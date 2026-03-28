import { ChangeEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TitleBox from "../../../components/TitleBox";
import InputBasic from "../../../components/InputBasic";
import InfoText from "../../../components/InfoText";
import ContentWithTitle from "../../../components/ContentWithTitle";
import Button from "../../../components/buttons/Button";
import InputRadio from "../../../components/InputRadio";
import ImageUploader from "../components/ImageUploader";
import {
  maintenanceIncludeLabel,
  roomDirectionTypeLabel,
  roomOptionLabel,
} from "../../../utils/roomMapper";
import InputCheckbox from "../../../components/InputCheckbox";
import {
  CreateRoomRequestDto,
  MaintenanceIncludeName,
  RoomBuildingType,
  RoomDirection,
  RoomImage,
  RoomOption,
  RoomRequestBaseDto,
  UpdateRoomRequestDto,
} from "../../../types/roomTypes";
import { openAddressSearch } from "../../../utils/openAddressSearch";
import InputButton from "../../../components/InputButton";
import { RoomSellCreateContext } from "../pages/PageRoomSellCreate";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Textarea from "../../../components/TextArea";
import {
  createRoom,
  getRoomDetail,
  updateRoom,
} from "../../../services/roomService";
import InputDate from "../../../components/InputDate";
import Toast from "../../toast/components/Toast";

type RoomFormType = "create" | "update";

interface RoomFormProps {
  type: RoomFormType;
  roomId?: number | null;
  initialData?: Partial<
    CreateRoomRequestDto & UpdateRoomRequestDto & { id?: string }
  >;
  onSubmit?: (
    form: CreateRoomRequestDto | UpdateRoomRequestDto,
    images: File[],
    deleteImageIds?: number[],
    latLng?: { lat: number; lng: number }
  ) => void;
}

const FORM_KEY = "roomFormData";
const EXTRA_KEY = "roomExtraFields";

const RoomForm = ({ type, roomId, initialData, onSubmit }: RoomFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // const params = useParams();
  // const roomId = params.roomId ? parseInt(params.roomId) : null;
  const [roomLatLng, setRoomLatLng] = useState<{ lat: number; lng: number }>({
    lat: 37.5,
    lng: 127.04,
  });
  const [toastMessage, setToastMessage] = useState("");
  const [undergroundInput, setUndergroundInput] = useState("");
  const [isUndergroundMode, setIsUndergroundMode] = useState(false);

  const outletContext = useOutletContext<RoomSellCreateContext | null>();
  const handleSubmitExternal =
    onSubmit ?? outletContext?.handleNext ?? (() => {});

  const radioOptions: { value: RoomBuildingType; label: string }[] = [
    { value: "ONEROOM_TWOROOM", label: "원룸 · 투룸" },
    { value: "APARTMENT", label: "아파트" },
    { value: "VILLA_HOUSE", label: "빌라 · 주택" },
    { value: "OFFICETEL", label: "오피스텔" },
  ];

  const defaultRoomFormData = (): RoomRequestBaseDto => ({
    deposit: 0,
    monthlyRent: 0,
    exclusiveArea: 0,
    supplyArea: 0,
    totalUnits: 0,
    floor: "",
    maxFloor: 0,
    parkingSpaces: 0,
    availableFrom: "",
    permissionDate: "",
    simpleDescription: "",
    description: "",
    maintenanceCost: 0,
    roomCnt: 1,
    bathroomCnt: 1,
    direction: "",
    discussable: false,
    discussDetail: "",
    reviewable: false,
    isPhonePublic: true,
    maintenanceIncludes: [],
    options: [],
    images: [],
  });

  const [formData, setFormData] = useState<RoomRequestBaseDto>(() => {
    const saved = sessionStorage.getItem(FORM_KEY);
    if (saved) return JSON.parse(saved);
    return {
      ...defaultRoomFormData(),
      ...(initialData as Partial<RoomRequestBaseDto>),
    };
  });

  type CreateExtraField = Omit<CreateRoomRequestDto, keyof RoomRequestBaseDto>;
  const [extraFieldsCreate, setExtraFieldsCreate] = useState<CreateExtraField>(
    () => {
      const saved = sessionStorage.getItem(EXTRA_KEY);
      if (saved) return JSON.parse(saved);
      return {
        buildingType: initialData?.buildingType ?? "ONEROOM_TWOROOM",
        realEstateId: initialData?.realEstateId ?? "",
        postalCode: initialData?.postalCode ?? "",
        address: initialData?.address ?? "",
        addressDetail: initialData?.addressDetail ?? "",
      };
    }
  );

  type UpdateExtraField = Pick<UpdateRoomRequestDto, "deleteImageIds">;
  const [extraFieldsUpdate, setExtraFieldsUpdate] = useState<UpdateExtraField>({
    deleteImageIds: [],
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<RoomImage[]>(
    initialData?.images?.map((url, idx) => ({
      imageId: idx,
      imageUrl: url,
    })) ?? []
  );

  // 보안을 위해 페이지 이탈 시 sessionStorage 제거
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     sessionStorage.removeItem(FORM_KEY);
  //     sessionStorage.removeItem(EXTRA_KEY);
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);

  const handleDeleteImage = (imageId: number) => {
    setExtraFieldsUpdate((prev) => ({
      ...prev,
      deleteImageIds: [...prev.deleteImageIds, imageId],
    }));

    setExistingImages((prev) => prev.filter((img) => img.imageId !== imageId));
  };

  const pyeongToSqm = (pyeong: number) => +(pyeong * 3.3058).toFixed(2);
  const sqmToPyeong = (sqm: number) => +Math.round(sqm / 3.3058);

  const handlePyeongChange =
    (key: "supplyArea" | "exclusiveArea") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const pyeong = parseFloat(e.target.value);
      if (isNaN(pyeong)) return;

      const sqm = pyeongToSqm(pyeong);
      setFormData((prev) => ({
        ...prev,
        [key]: sqm,
      }));
    };

  useEffect(() => {
    if (type === "update") return;
    sessionStorage.setItem(FORM_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    sessionStorage.setItem(EXTRA_KEY, JSON.stringify(extraFieldsCreate));
  }, [extraFieldsCreate]);

  useEffect(() => {
    if (type === "update" && roomId !== null) {
      (async () => {
        try {
          const roomData = await getRoomDetail(roomId);
          const {
            deposit,
            monthlyRent,
            exclusiveArea,
            supplyArea,
            totalUnits,
            floor,
            maxFloor,
            parkingSpaces,
            availableFrom,
            permissionDate,
            simpleDescription,
            description,
            maintenanceCost,
            roomCnt,
            bathroomCnt,
            direction,
            discussable,
            discussDetail,
            reviewable,
            isPhonePublic,
            maintenanceIncludes,
            options,
            images,
          } = roomData;

          setFormData({
            deposit,
            monthlyRent,
            exclusiveArea,
            supplyArea,
            totalUnits,
            floor,
            maxFloor,
            parkingSpaces,
            availableFrom,
            permissionDate,
            simpleDescription,
            description,
            maintenanceCost,
            roomCnt,
            bathroomCnt,
            direction,
            discussable,
            discussDetail,
            reviewable,
            isPhonePublic,
            maintenanceIncludes,
            options,
            images: images.map((img) => img.imageUrl),
          });

          console.log(roomData);
          setExistingImages(images);

          setRoomLatLng({ lat: roomData.lat, lng: roomData.lng });
        } catch (err) {
          alert("해당하는 방이 없습니다."); //임시 처리
          navigate("/room/sell");
          return null;
          console.error("방 정보 불러오기 실패:", err);
        }
      })();
    }
  }, [type, roomId]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;

    const createKeys = [
      "buildingType",
      "realEstateId",
      "postalCode",
      "address",
      "addressDetail",
    ];

    if (createKeys.includes(name)) {
      setExtraFieldsCreate((prev) => ({ ...prev, [name]: parsedValue }));
    } else {
      // floor 입력 시 처리 (일반 층, 반지하, 지하)
      if (name === "floor") {
        setIsUndergroundMode(false); // 일반 층 입력 시 underground 모드 해제

        // 일반 층 처리
        const num = Number(value);
        const text = !isNaN(num) && num > 0 ? `${num}층` : ""; // 숫자일 경우 "층"을 추가

        setFormData((prev) => ({
          ...prev,
          floor: text, // text로 "층" 추가
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = async () => {
    const finalImageCount = existingImages.length + newImages.length;
    if (
      (type === "create" && newImages.length < 3) ||
      (type === "update" && finalImageCount < 3)
    ) {
      alert("이미지는 최소 3장 이상 첨부해야 합니다.");
      return;
    }

    const createData: CreateRoomRequestDto = {
      ...formData,
      ...extraFieldsCreate,
    };

    const updateData: UpdateRoomRequestDto = {
      ...formData,
      ...extraFieldsUpdate,
    };

    const finalData = type === "create" ? createData : updateData;
    const deleteImageIds =
      type === "update" ? extraFieldsUpdate.deleteImageIds : [];

    try {
      const form = new FormData();

      Object.entries(finalData).forEach(([key, value]) => {
        if (type !== "create" && key === "images") return; //initialData의 문자열 데이터 받지 않음
        if (Array.isArray(value)) {
          value.forEach((v) => form.append(`${key}`, v));
        } else {
          form.append(key, value as any);
        }
      });

      newImages.forEach((image) => {
        form.append("images", image);
      });

      if (type === "update" && deleteImageIds.length > 0) {
        deleteImageIds.forEach((id) => {
          form.append("deleteImageIds", id.toString());
        });
      }

      // for (let [key, value] of form.entries()) {
      //   console.log(key, value);
      // }

      const result =
        type === "create"
          ? await createRoom(form)
          : await updateRoom(roomId!, form);

      if (type === "create") {
        sessionStorage.removeItem(FORM_KEY);
        sessionStorage.removeItem(EXTRA_KEY);
      }

      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["myRooms"] });

      handleSubmitExternal(result, newImages, deleteImageIds, roomLatLng);
    } catch (err) {
      setToastMessage(`방 ${type === "create" ? "등록" : "수정"} 실패`);
      console.error(err);
    }
  };

  return (
    <div className="w-full flex flex-col gap-10">
      <InfoText text="'방줘'에서는 월세 매물만 내놓을 수 있습니다." />

      {type === "create" && (
        <>
          <TitleBox title="집 종류" required>
            <div className="flex flex-wrap gap-2">
              {radioOptions.map(({ value, label }) => (
                <InputRadio
                  key={value}
                  name="buildingType"
                  label={label}
                  value={value}
                  checked={extraFieldsCreate.buildingType === value}
                  onChange={(e) => handleInputChange(e)}
                />
              ))}
            </div>
          </TitleBox>
          <TitleBox title="주소" required>
            <ContentWithTitle title="우편 번호">
              <InputBasic
                name="postalCode"
                value={extraFieldsCreate.postalCode}
                onChange={handleInputChange}
                placeholder="우편 번호"
                required
              />
              <Button
                onClick={() =>
                  openAddressSearch((data) => {
                    setExtraFieldsCreate((prev) => ({
                      ...prev,
                      postalCode: data.zonecode,
                      address: data.roadAddress,
                    }));
                  })
                }
              >
                주소 검색
              </Button>
            </ContentWithTitle>
            <ContentWithTitle title="도로명 주소">
              <InputBasic
                name="address"
                value={extraFieldsCreate.address}
                onChange={handleInputChange}
                placeholder="도로명 주소"
                required
              />
            </ContentWithTitle>
            <ContentWithTitle title="상세 주소">
              <InputBasic
                name="addressDetail"
                value={extraFieldsCreate.addressDetail}
                onChange={handleInputChange}
                placeholder="상세 주소"
                size="large"
              />
            </ContentWithTitle>
          </TitleBox>
        </>
      )}

      <TitleBox title="판매 금액" required>
        <ContentWithTitle title="보증금">
          <InputBasic
            type="number"
            name="deposit"
            value={formData.deposit}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                deposit: Number(e.target.value),
              }))
            }
            text="원"
            size="small"
            required
          />
        </ContentWithTitle>
        <ContentWithTitle title="월세">
          <InputBasic
            type="number"
            name="monthlyRent"
            value={formData.monthlyRent}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                monthlyRent: Number(e.target.value),
              }))
            }
            text="원"
            size="small"
            required
          />
        </ContentWithTitle>
        <ContentWithTitle title={`가격 조정\n가능 여부`}>
          <div className="flex gap-2">
            <InputRadio
              name="discussable"
              value="true"
              label="가능"
              checked={formData.discussable === true}
              onChange={() =>
                setFormData((prev) => ({ ...prev, discussable: true }))
              }
            />
            <InputRadio
              name="discussable"
              value="false"
              label="불가"
              checked={formData.discussable === false}
              onChange={() =>
                setFormData((prev) => ({ ...prev, discussable: false }))
              }
            />
            {formData.discussable && (
              <InputBasic
                value={formData.discussDetail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discussDetail: e.target.value,
                  }))
                }
                placeholder="가격 조정에 관해 설명해주세요"
              />
            )}
          </div>
        </ContentWithTitle>
      </TitleBox>

      <TitleBox title="관리비" required>
        <ContentWithTitle title="관리비">
          <div className="flex gap-2">
            <InputBasic
              type="number"
              name="maintenanceCost"
              value={formData.maintenanceCost}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maintenanceCost: Number(e.target.value),
                }))
              }
              text="원"
              size="small"
              required
            />
            <InputCheckbox
              label="없음"
              checked={formData.maintenanceCost === 0}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  maintenanceCost: 0,
                }))
              }
            />
          </div>
        </ContentWithTitle>
        <ContentWithTitle title={`관리비\n포함 사항`}>
          {(
            Object.entries(maintenanceIncludeLabel) as [
              MaintenanceIncludeName,
              string
            ][]
          ).map(([key, label]) => (
            <InputCheckbox
              key={key}
              label={label}
              checked={formData.maintenanceIncludes.includes(key)}
              onChange={() =>
                setFormData((prev) => {
                  const alreadyChecked = prev.maintenanceIncludes.includes(key);
                  return {
                    ...prev,
                    maintenanceIncludes: alreadyChecked
                      ? prev.maintenanceIncludes.filter((item) => item !== key)
                      : [...prev.maintenanceIncludes, key],
                  };
                })
              }
            />
          ))}
        </ContentWithTitle>
      </TitleBox>

      <TitleBox title="집 사진 등록" detail="(3장 이상)" required>
        <InfoText text="집의 내부를 파악할 수 있는 사진을 올려주세요. 매물과 관계 없는 사진을 포함할 시 제재될 수 있습니다." />
        <ImageUploader
          existingImages={existingImages}
          setExistingImages={setExistingImages}
          newImages={newImages}
          setNewImages={setNewImages}
          onDeleteImage={handleDeleteImage}
        />
      </TitleBox>

      <TitleBox title="옵션" required>
        <ContentWithTitle>
          {(Object.entries(roomOptionLabel) as [RoomOption, string][]).map(
            ([key, label]) => (
              <InputCheckbox
                key={key}
                label={label}
                checked={formData.options.includes(key)}
                onChange={() =>
                  setFormData((prev) => {
                    const alreadyChecked = prev.options.includes(key);
                    return {
                      ...prev,
                      options: alreadyChecked
                        ? prev.options.filter((item) => item !== key)
                        : [...prev.options, key],
                    };
                  })
                }
              />
            )
          )}
        </ContentWithTitle>
      </TitleBox>

      <TitleBox title="집 방향" required>
        <InfoText text="거실을 기준으로 선택해주세요" />
        <div className="flex flex-wrap gap-2">
          {(
            Object.entries(roomDirectionTypeLabel) as [RoomDirection, string][]
          ).map(([value, label]) => (
            <InputRadio
              key={value}
              name="direction"
              label={label}
              value={value}
              checked={formData.direction === value}
              onChange={(e) => handleInputChange(e)}
            />
          ))}
        </div>
      </TitleBox>

      <TitleBox title="집 정보" required>
        <ContentWithTitle title="입주 가능일">
          <div className="flex gap-2 items-center">
            <InputDate
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleInputChange}
              placeholder="입주 가능일"
            />

            <InputButton
              label="즉시 입주 가능"
              onClick={() =>
                setFormData((prev) => {
                  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'
                  return {
                    ...prev,
                    availableFrom: prev.availableFrom === today ? "" : today,
                  };
                })
              }
              checked={
                formData.availableFrom ===
                new Date().toISOString().split("T")[0]
              }
            />
          </div>
        </ContentWithTitle>

        <ContentWithTitle title="면적">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">공급 면적</span>
            <InputBasic
              type="number"
              name="supplyArea_pyeong"
              value={sqmToPyeong(formData.supplyArea)}
              onChange={handlePyeongChange("supplyArea")}
              text="평"
              size="small"
              placeholder="공급 면적(㎡)"
            />
            <span className="text-sm">=</span>
            <InputBasic
              type="number"
              name="supplyArea"
              value={formData.supplyArea}
              onChange={handleInputChange}
              text="㎡"
              size="small"
              placeholder="공급 면적(㎡)"
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">전용 면적</span>
            <InputBasic
              type="number"
              name="exclusiveArea_pyeong"
              value={sqmToPyeong(formData.exclusiveArea)}
              onChange={handlePyeongChange("exclusiveArea")}
              text="평"
              size="small"
              placeholder="전용용 면적(평)"
            />
            <span className="text-sm">=</span>

            <InputBasic
              type="number"
              name="exclusiveArea"
              value={formData.exclusiveArea}
              onChange={handleInputChange}
              text="㎡"
              size="small"
              placeholder="전용 면적(㎡)"
              required
            />
          </div>
        </ContentWithTitle>
        <ContentWithTitle title="방 수">
          <InputBasic
            type="number"
            name="roomCnt"
            value={formData.roomCnt}
            onChange={handleInputChange}
            text="개"
            size="small"
            placeholder="방 수"
            required
          />
        </ContentWithTitle>
        <ContentWithTitle title="욕실 수">
          <InputBasic
            type="number"
            name="bathroomCnt"
            value={formData.bathroomCnt}
            onChange={handleInputChange}
            text="개"
            size="small"
            placeholder="욕실 수"
            required
          />
        </ContentWithTitle>
        <ContentWithTitle title="건물 전체 층">
          <InputBasic
            type="number"
            name="maxFloor"
            value={formData.maxFloor}
            onChange={handleInputChange}
            text="층"
            size="small"
            placeholder="건물 전체"
            required
          />
        </ContentWithTitle>

        <ContentWithTitle title="해당 층">
          <div className="flex gap-2 items-center">
            {/* 일반 층 입력 */}
            <InputBasic
              type="number"
              name="floor"
              value={formData.floor.replace("층", "")} // "층" 제외한 숫자만 보여주기
              onChange={handleInputChange}
              text="층"
              size="small"
              placeholder="해당"
              required
            />

            {/* 반지하 버튼 */}
            <InputButton
              label="반지하"
              onClick={() => {
                setIsUndergroundMode(false);
                setFormData((prev) => ({
                  ...prev,
                  floor: "반지하", // 반지하 선택 시 "반지하"로 저장
                }));
              }}
              checked={formData.floor === "반지하"}
            />

            {/* 지하 버튼 */}
            <InputButton
              label="지하"
              onClick={() => {
                setIsUndergroundMode(true); // 지하 선택 시 underground mode 활성화
                setUndergroundInput(""); // 입력 초기화
                setFormData((prev) => ({
                  ...prev,
                  floor: "", // 기본 지하 설정 (나중에 지하 층수로 바뀜)
                }));
              }}
              checked={isUndergroundMode}
            />

            {/* 지하 층수 입력 필드 (지하 버튼 눌렸을 때만 나타남) */}
            {isUndergroundMode && (
              <InputBasic
                type="number"
                value={undergroundInput}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setUndergroundInput(inputValue);
                  const numeric = Number(inputValue);

                  if (!isNaN(numeric) && numeric > 0) {
                    setFormData((prev) => ({
                      ...prev,
                      floor: `지하 ${numeric}층`, // "지하 X층" 형식으로 저장
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      floor: "", // 유효하지 않으면 빈 값
                    }));
                  }
                }}
                placeholder="지하 층"
              />
            )}
          </div>
        </ContentWithTitle>

        <ContentWithTitle title="사용 승인일">
          <InputDate
            name="permissionDate"
            value={formData.permissionDate}
            onChange={handleInputChange}
            placeholder="사용 승인일"
            size="small"
          />
        </ContentWithTitle>
        <ContentWithTitle title="주차대수">
          <InputBasic
            type="number"
            name="parkingSpaces"
            value={formData.parkingSpaces}
            onChange={handleInputChange}
            placeholder="주차대수"
            size="small"
            text="대"
            required
          />
        </ContentWithTitle>
        {type === "create" && (
          <ContentWithTitle title={`부동산\n고유 번호`}>
            <InputBasic
              name="realEstateId"
              value={extraFieldsCreate.realEstateId}
              onChange={handleInputChange}
              placeholder="부동산 고유 번호"
              size="small"
              required
            />
          </ContentWithTitle>
        )}
        <ContentWithTitle title={`총 세대 수`}>
          <InputBasic
            type="number"
            name="totalUnits"
            value={formData.totalUnits}
            onChange={handleInputChange}
            placeholder="총 세대 수"
            size="small"
            text="세대"
            required
          />
        </ContentWithTitle>
      </TitleBox>

      <TitleBox title="집 소개" required>
        <InfoText text="세입자들이 설명을 보고 어떤 집인지 한눈에 알 수 있도록 특징을 적어주세요. 알아보기 쉽게 작성하면 세입자들의 접근이 쉬워집니다. (예. 깔끔하고 전망 좋은 12층 집입니다 등)" />
        <InputBasic
          name="simpleDescription"
          value={formData.simpleDescription}
          onChange={handleInputChange}
          placeholder="한줄 소개"
          required
        />
        <InfoText text="매물의 특징을 상세하게 적어주세요. (예. 반려동물 가능합니다. 주차 공간은 따로 없어요 등)" />
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="상세 설명"
        />
      </TitleBox>
      {/* <TitleBox title="리뷰 설정" required>
        <InfoText text="리뷰는 매물 단위로 쌓이며, 이 리뷰들을 표시 및 새로운 리뷰를 등록할 수 있는지 여부를 설정할 수 있습니다." />
        <div className="flex gap-2">
          <InputRadio
            name="reviewable"
            value="true"
            label="허용"
            checked={formData.reviewable === true}
            onChange={() =>
              setFormData((prev) => ({ ...prev, reviewable: true }))
            }
          />
          <InputRadio
            name="reviewable"
            value="false"
            label="비허용"
            checked={formData.reviewable === false}
            onChange={() =>
              setFormData((prev) => ({ ...prev, reviewable: false }))
            }
          />
        </div>
      </TitleBox> */}

      <TitleBox title="연락처 공개 여부" required>
        <InfoText text="이후 본인 인증에서 입력한 연락처를 공개할지 여부를 설정할 수 있습니다." />
        <div className="flex gap-2">
          <InputRadio
            name="isPhonePublic"
            value="true"
            label="공개"
            checked={formData.isPhonePublic === true}
            onChange={() =>
              setFormData((prev) => ({ ...prev, isPhonePublic: true }))
            }
          />
          <InputRadio
            name="isPhonePublic"
            value="false"
            label="비공개"
            checked={formData.isPhonePublic === false}
            onChange={() =>
              setFormData((prev) => ({ ...prev, isPhonePublic: false }))
            }
          />
        </div>
      </TitleBox>

      <div className="text-center">
        <Button size="large" variant="point" onClick={handleSubmit}>
          정보 입력 완료
        </Button>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
};

export default RoomForm;
