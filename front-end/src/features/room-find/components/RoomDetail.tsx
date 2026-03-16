import { useEffect, useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getRoomDetail } from "../../../services/roomService";
import { RoomDetailResponse } from "../../../types/roomTypes";
import TabMenu from "./TabMenu";
import Accordion from "../../../components/Accordion";
import ListItemLine from "../../../components/ListItemLine";
import InfoText from "../../../components/InfoText";
import TabContent from "./TabContent";
import Button from "../../../components/buttons/Button";
import RoomOptions from "./RoomOptions";
import BoxHeader from "./BoxHeader";
import {
  roomBuildingTypeLabel,
  roomDirectionTypeLabel,
  roomOptionLabel,
  maintenanceIncludeLabel,
} from "../../../utils/roomMapper";
import {
  RoomBuildingType,
  RoomDirection,
  RoomOption,
  MaintenanceIncludeName,
} from "../../../types/roomTypes";
import RoomLocationMap from "../components/RoomLocationMap";
import ModalPhoneCheck from "../../modal/pages/ModalPhoneCheck";
import RoundedImage from "../../../components/RoundedImage";
import MaterialIcon from "../../../components/MaterialIcon";
import { useIamportPayment } from "../../registry/hooks/useIamportPayment";
import { validatePayment } from "../../../apis/pay";
import { useAuth } from "../../../contexts/AuthContext";
import { handleRoomLike } from "../../../services/likeService";
import ModalAlert from "../../modal/pages/ModalAlert";
import useModal from "../../modal/hooks/useModal";
import { fetchCreateChatRoom } from "../../../apis/chat";

interface RoomDetailProps {
  selectedRoomId: number | null;
  onClose: () => void;
}

const RoomDetail = ({ selectedRoomId, onClose }: RoomDetailProps) => {
  // 모든 state와 ref를 먼저 선언
  const { accessToken, user } = useAuth();

  const [isHeaderColorChange, setIsHeaderColorChange] = useState(false);
  const [isTitleScrolled, setIsTitleScrolled] = useState(false);
  const [tabMenuHeight, setTabMenuHeight] = useState(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const textStartRef = useRef<HTMLDivElement | null>(null);
  const tabContentsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { isOpen, openModal, closeModal } = useModal();

  const [isAuthMenuOpenMobile, setIsAuthMenuOpenMobile] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const allCloseMobile = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    if (isAuthMenuOpenMobile) {
      setIsAuthMenuOpenMobile(false);
    }
  };

  const openChatWindow = () => {
    window.open(
      "/chat",
      "_blank",
      "width=1000,height=700,menubar=no,toolbar=no,location=no,status=no"
    );
    allCloseMobile();
  };

  const handleAsk = () => {
    if (!room || !user) return; //임시 타입 해결
    fetchCreateChatRoom({
      landlordId: room.memberId,
      roomId: room.roomId,
      tenantId: Number(user.sub),
    });
    openChatWindow();
  };

  // 그 다음 useQuery 훅 호출
  const {
    data: room,
    isLoading,
    isError,
    error,
  } = useQuery<RoomDetailResponse, Error>({
    queryKey: ["roomDetail", selectedRoomId],
    queryFn: () => getRoomDetail(selectedRoomId!),
    enabled: !!selectedRoomId,
  });

  const tabTitles = [
    "기본 정보",
    "관리비",
    "집 소개",
    "집 정보",
    "위치",
    "등기부등본 · 위험도",
  ];
  const roomOptions: string[] =
    room?.options
      .map((option) =>
        option in roomOptionLabel
          ? roomOptionLabel[option as RoomOption]
          : undefined
      )
      .filter((label): label is string => typeof label === "string") || [];

  const allMaintenanceKeys = Object.keys(
    maintenanceIncludeLabel
  ) as MaintenanceIncludeName[];

  const includedKeys = room?.maintenanceIncludes ?? [];
  const excludedKeys = allMaintenanceKeys.filter(
    (key) => !includedKeys.includes(key)
  );

  const maintenanceOptions: string[] = includedKeys.map(
    (key) => maintenanceIncludeLabel[key]
  );
  const notMaintenanceOptions: string[] = excludedKeys.map(
    (key) => maintenanceIncludeLabel[key]
  );

  // tab scroll
  const handleTabClick = (idx: number) => {
    tabContentsRef.current[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // TabMenu 높이 가져오기
  useEffect(() => {
    const tabMenuElement = document.querySelector(".sticky") as HTMLElement;
    if (tabMenuElement) {
      setTabMenuHeight(tabMenuElement.offsetHeight);
    }
  });

  useEffect(() => {
    const boxElement = boxRef.current;
    const headerRect = headerRef.current?.getBoundingClientRect();
    const textStartElement = textStartRef.current;
    const titleElement = titleRef.current;

    const handleScroll = () => {
      //헤더 색상 변경
      if (headerRect && textStartElement) {
        const textStartRect = textStartElement.getBoundingClientRect();
        setIsHeaderColorChange(textStartRect.top <= headerRect.bottom);
      }

      //title이 scroll로 가려지면 header에 title 등장
      if (headerRect && titleElement) {
        const titleRect = titleElement.getBoundingClientRect();
        setIsTitleScrolled(titleRect.top <= headerRect.bottom);
      }

      tabContentsRef.current.forEach(
        (ref: HTMLDivElement | null, idx: number) => {
          if (ref && boxRef.current) {
            const { top, bottom } = ref.getBoundingClientRect();

            const boxTop = boxRef.current.getBoundingClientRect().top;
            const boxHeight = boxRef.current.getBoundingClientRect().height;
            if (
              top <= boxTop + boxHeight / 2 &&
              bottom >= boxTop + boxHeight / 2
            ) {
              setActiveTab(idx);
            }
          }
        }
      );
    };
    boxElement?.addEventListener("scroll", handleScroll);

    return () => {
      boxElement?.removeEventListener("scroll", handleScroll);
    };
  });

  //등기사항전부증명서 결제 처리
  const { requestPayment, scriptLoaded } = useIamportPayment();
  const handleClick = () => {
    if (!accessToken) {
      openModal("needLogin");
      return;
    }
    if (!scriptLoaded) {
      console.warn("결제 모듈이 아직 로딩되지 않았어요");
      return;
    }

    requestPayment(
      {
        merchant_uid: `test_${Date.now()}`,
        name: "테스트 상품",
        amount: 100,
        buyer_email: "test@example.com",
        buyer_name: "홍길동",
        buyer_tel: "01012345678",
        buyer_addr: "서울시 테스트구",
        buyer_postcode: "12345",
      },
      async (rsp) => {
        console.log("결제 결과:", rsp);

        if (rsp.success) {
          console.log("✅ 결제 성공, imp_uid:", rsp.imp_uid);

          const impUid = rsp.imp_uid;

          try {
            const validateData = await validatePayment(impUid);
            console.log("아이디값");
            console.log(validateData); //id
            const newWindowUrl = `/registry/${validateData ?? ""}`;
            window.open(newWindowUrl, "_blank");
          } catch (validateError) {
            console.log("Failed to verify payment:", rsp.error_msg);
          }
        } else {
          console.log("Failed to pay:", rsp.error_msg);
        }
      }
    );
  };

  useEffect(() => {
    if (room) {
      setIsLiked(room.isLiked);
    }
  }, [room]);

  const handleLikeClick = async (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!accessToken) {
      openModal("needLogin");
      return;
    }

    if (selectedRoomId === null) return;
    try {
      await handleRoomLike(selectedRoomId);
      setIsLiked((prev) => !prev);
    } catch (error) {
      console.error("좋아요 처리 중 에러", error);
      alert("좋아요 처리 중 문제가 발생했습니다.");
    }
  };

  const calculateBrokerageFee = (
    deposit: number,
    rent: number
  ): { total: number; brokerageFee: number; vat: number } => {
    // 보증금과 월세를 합산하여 총 금액 계산
    const totalAmount = deposit + rent * 12;

    let brokerageRate = 0;
    if (totalAmount <= 10000000) {
      brokerageRate = 0.005; // 0.5%
    } else if (totalAmount <= 30000000) {
      brokerageRate = 0.004; // 0.4%
    } else if (totalAmount <= 50000000) {
      brokerageRate = 0.003; // 0.3%
    } else if (totalAmount <= 100000000) {
      brokerageRate = 0.0025; // 0.25%
    } else {
      brokerageRate = 0.002; // 0.2%
    }

    // 최대 중개수수료 계산
    const brokerageFee = totalAmount * brokerageRate;

    // 부가세 계산 (수수료의 10%)
    const vat = brokerageFee * 0.1;

    const total = brokerageFee + vat;
    return {
      total,
      brokerageFee,
      vat,
    };
  };

  const formatMoney = (amount: number): string => {
    return `${amount.toLocaleString()}`; // 천 단위 구분과 "원" 추가
  };

  const formatDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const formattedDate = new Date(date).toLocaleString("ko-KR", options);

    return formattedDate.replace(
      /(\d{4})\s(\w+)\s(\d{1,2})\s(\d{1,2}):(\d{2})/,
      "$1년 $2 $3일 $4:$5"
    );
  };

  // 조건부 렌더링 처리
  if (!selectedRoomId) return null;
  if (isLoading) return <div>불러오는 중...</div>;
  if (isError || !room) return <div>에러 발생: {(error as Error).message}</div>;

  return (
    <>
      <AnimatePresence>
        {selectedRoomId && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute z-[-1] top-0 bottom-0 p-[0.625rem] left-[340px] w-[360px]"
          >
            {/* gray box */}
            <div className="bg-neutral-light100 w-full h-full flex rounded-xl shadow-custom relative overflow-hidden text-sm">
              <div
                ref={boxRef}
                className="w-full h-full overflow-y-auto scroll-custom"
              >
                {/* box header */}
                <BoxHeader
                  ref={headerRef}
                  isHeaderColorChange={isHeaderColorChange}
                  isTitleScrolled={isTitleScrolled}
                  onClose={onClose}
                />

                {/* Image */}
                <div className="bg-neutral-light100 w-full h-[13rem] overflow-hidden relative">
                  {/* 이미지 슬라이더 */}
                  <div className="relative w-full h-[13rem] overflow-hidden group bg-neutral-light100 rounded-t-lg">
                    {room.images.length > 0 && (
                      <AnimatePresence initial={false} custom={direction}>
                        <motion.img
                          key={room.images[currentImageIndex].imageId}
                          src={room.images[currentImageIndex].imageUrl}
                          alt={`room image ${room.images[currentImageIndex].imageId}`}
                          className="absolute w-full h-full object-cover"
                          custom={direction}
                          initial={{
                            x: direction === "left" ? -300 : 300,
                            opacity: 0,
                          }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{
                            x: direction === "left" ? 300 : -300,
                            opacity: 0,
                          }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        />
                      </AnimatePresence>
                    )}

                    {/* 그라데이션 오버레이 */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-transparent opacity-50 pointer-events-none" />

                    {/* 좌우 화살표 */}
                    {room.images.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            setDirection("left");
                            setCurrentImageIndex((prev) =>
                              prev === 0 ? room.images.length - 1 : prev - 1
                            );
                          }}
                          className="h-[calc(24px+var(--spacing)*4)] cursor-pointer absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                        >
                          <i className="material-symbols-rounded">
                            chevron_left
                          </i>
                        </button>

                        <button
                          onClick={() => {
                            setDirection("right");
                            setCurrentImageIndex((prev) =>
                              prev === room.images.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="h-[calc(24px+var(--spacing)*4)] cursor-pointer absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                        >
                          <MaterialIcon icon="chevron_right" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div
                  ref={textStartRef}
                  className="flex flex-col gap-4 p-[0.875rem] mb-[0.375rem] bg-real-white"
                >
                  {/* info header */}
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        isAngular={true}
                        variant="gold"
                        as="div"
                      >
                        집주인
                        {room.memberId}
                      </Button>
                      <Button
                        size="small"
                        isAngular={true}
                        isLine={true}
                        variant="gold"
                        as="div"
                      >
                        등록번호 {selectedRoomId}
                      </Button>
                    </div>
                    {/* 하트 아이콘 */}
                    <div onClick={handleLikeClick} className="cursor-pointer">
                      <MaterialIcon icon="favorite" fill={isLiked} />
                    </div>
                  </div>

                  {/* title */}
                  <div className="flex flex-col gap-1">
                    <Accordion
                      trigger={
                        <Button size="small">
                          <i className="material-symbols-rounded text-base text-neutral-dark100">
                            keyboard_arrow_down
                          </i>
                          <span className="text-neutral-dark100">
                            {room.discussable
                              ? "가격 조정 가능"
                              : "가격 조정 불가"}
                          </span>
                        </Button>
                      }
                    >
                      <div className="text-neutral-dark100 py-2">
                        {room.discussDetail}
                      </div>
                    </Accordion>

                    <div
                      ref={titleRef}
                      className="flex flex-wrap gap-2 items-center"
                    >
                      <span className="font-semibold text-xl">
                        월세 {room.deposit / 10000}/{room.monthlyRent / 10000}
                      </span>
                      <span className="font-light text-neutral-dark100">
                        {room.buildingType in roomBuildingTypeLabel
                          ? roomBuildingTypeLabel[
                              room.buildingType as RoomBuildingType
                            ]
                          : "기타"}
                      </span>
                    </div>
                    {/* review buttom */}
                    {/* <div className="flex flex-wrap gap-1 items-center cursor-pointer">
                    <i className="material-symbols-rounded text-lg">reviews</i>
                    <span className="font-semibold">
                      리뷰 ${room.reviewCnt}개
                    </span>
                    <i className="material-symbols-rounded text-base">
                      arrow_forward_ios
                    </i>
                  </div> */}
                  </div>

                  {/* save price */}

                  <Accordion
                    trigger={
                      <div className="p-[.875rem_1rem] font-semibold border rounded-md border-neutral-light100">
                        직거래로{" "}
                        <span className="text-gold-dark">
                          {formatMoney(
                            calculateBrokerageFee(
                              room.deposit,
                              room.monthlyRent
                            ).total
                          )}
                          원
                        </span>
                        을 아낄 수 있어요!
                      </div>
                    }
                  >
                    <div className="text-neutral-white bg-neutral-dark100 p-2 my-2 rounded-md whitespace-pre-line">
                      <div className="w-full flex justify-between">
                        <span>법정 최대 중개수수료</span>
                        <span>
                          {formatMoney(
                            calculateBrokerageFee(
                              room.deposit,
                              room.monthlyRent
                            ).brokerageFee
                          )}
                          원
                        </span>
                      </div>
                      <div className="w-full flex justify-between">
                        <span>부가세(10%)</span>
                        <span>
                          {formatMoney(
                            calculateBrokerageFee(
                              room.deposit,
                              room.monthlyRent
                            ).vat
                          )}
                          원
                        </span>
                      </div>
                    </div>
                  </Accordion>

                  <div className="flex flex-wrap items-center gap-3">
                    <RoundedImage
                      src={room.profileUrl}
                      alt="profile image"
                      size="3rem"
                    />
                    <div className="flex gap-1">
                      <span>작성자</span>
                      <span>·</span>
                      <span>{room.nickname}</span>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="text-neutral-dark100 flex flex-wrap gap-1">
                    <span>{formatDate(room.createDate)}</span>
                    <span>·</span>
                    <span>{formatDate(room.updateDate)} 수정</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="small" variant="dark">
                      수정
                    </Button>
                    <Button size="small" variant="warning">
                      삭제
                    </Button>
                  </div>
                </div>

                {/* Detail */}
                <TabMenu
                  tabTitles={tabTitles}
                  addClassName="sticky top-[48px]"
                  onTabClick={handleTabClick}
                  activeTab={activeTab}
                />
                {/* Tab Contents */}
                <div className="flex flex-col gap-4 bg-real-white p-[0.875rem_1rem_calc(0.875rem+33vh)_1rem]">
                  <TabContent
                    title="기본 정보"
                    ref={(el) => {
                      if (el) tabContentsRef.current[0] = el;
                    }}
                    scrollMarginTop={48 + tabMenuHeight}
                  >
                    <div>{room.simpleDescription}</div>
                    <RoomOptions roomOptions={roomOptions} />
                  </TabContent>

                  <div className="divider" />

                  <TabContent
                    title="관리비"
                    ref={(el) => {
                      if (el) tabContentsRef.current[1] = el;
                    }}
                    scrollMarginTop={48 + tabMenuHeight}
                  >
                    <p className="text-xl font-bold">
                      {room.maintenanceCost * 10000}원
                    </p>
                    <RoomOptions
                      title="관리비 포함 항목"
                      roomOptions={maintenanceOptions}
                    />
                    <RoomOptions
                      title="관리비와 별도인 항목"
                      roomOptions={notMaintenanceOptions}
                    />
                  </TabContent>

                  <div className="divider" />

                  <TabContent
                    title="집 소개"
                    ref={(el) => {
                      if (el) tabContentsRef.current[2] = el;
                    }}
                    scrollMarginTop={48 + tabMenuHeight}
                  >
                    <div>
                      <p>{room.description}</p>
                    </div>
                  </TabContent>

                  <div className="divider" />

                  <TabContent
                    title="집 정보"
                    ref={(el) => {
                      if (el) tabContentsRef.current[3] = el;
                    }}
                    scrollMarginTop={48 + tabMenuHeight}
                  >
                    <ListItemLine
                      title="입주 가능일"
                      content={`${room.availableFrom}`}
                    />
                    <div className="flex flex-1 items-center gap-1">
                      <ListItemLine
                        title="면적 (공급/전용)"
                        content={`${room.supplyArea}㎡ / ${room.exclusiveArea}㎡`}
                      />
                      {/* <button>평</button> */}
                    </div>
                    <ListItemLine
                      title="방 수 / 욕실 수"
                      content={`${room.roomCnt}개 / ${room.bathroomCnt}개`}
                    />
                    <ListItemLine
                      title="위치"
                      content={`${room.floor}층 (총 ${room.maxFloor}층)`}
                    />
                    <ListItemLine
                      title="방향"
                      content={`${
                        room.direction in roomDirectionTypeLabel
                          ? roomDirectionTypeLabel[
                              room.direction as RoomDirection
                            ]
                          : "비공개"
                      } (거실 기준)`}
                    />
                    <ListItemLine title="주소" content={`${room.address}`} />
                    <ListItemLine
                      title="사용 승인일"
                      content={`${room.permissionDate}`}
                    />
                    <ListItemLine
                      title="주차대수"
                      content={`${room.parkingSpaces}대(세대 당 ${
                        room.parkingSpaces / room.totalUnits
                      }대)`}
                    />
                    <ListItemLine
                      title="부동산 고유 번호"
                      content={`${room.realEstateId}`}
                    />
                    <ListItemLine
                      title="총 세대 수"
                      content={`${room.totalUnits}`}
                    />
                    <ListItemLine
                      title="유형"
                      content={
                        room.buildingType in roomBuildingTypeLabel
                          ? roomBuildingTypeLabel[
                              room.buildingType as RoomBuildingType
                            ]
                          : "기타"
                      }
                    />
                  </TabContent>

                  <div className="divider" />

                  <TabContent
                    title="위치"
                    ref={(el) => {
                      if (el) tabContentsRef.current[4] = el;
                    }}
                    scrollMarginTop={48 + tabMenuHeight}
                  >
                    <RoomLocationMap address={room.address} />
                    <div className="font-medium">{room.address}</div>
                  </TabContent>

                  <div className="divider" />

                  <TabContent
                    title="등기부등본 · 위험도"
                    ref={(el) => {
                      if (el) tabContentsRef.current[5] = el;
                    }}
                    scrollMarginTop={48 + tabMenuHeight}
                  >
                    <InfoText text="등기부등본을 확인하기 위해서는 700원의 수수료가 필요합니다." />
                    <Button
                      size="large"
                      variant="point"
                      className="w-full"
                      onClick={handleClick}
                    >
                      [유료] 등기사항전부증명서·위험도 확인
                    </Button>
                    {/* <Button size="large" className="w-full">
                    지난 위험도 분석 결과 확인하기
                  </Button> */}
                  </TabContent>
                </div>
                {/* box footer */}
                <div className="flex w-full h-[48px] bg-gold-light justify-around items-center bottom-[0px] absolute py-[0.875rem] text-base font-semibold">
                  <div className="flex-grow text-center">
                    <p
                      className="cursor-pointer"
                      onClick={() => setIsPhoneModalOpen(true)}
                    >
                      전화
                    </p>
                    <ModalPhoneCheck
                      isOpen={isPhoneModalOpen}
                      closeModal={() => setIsPhoneModalOpen(false)}
                      phone={room.phoneNumber}
                    />
                  </div>
                  <span className="separator"></span>
                  <div className="flex-grow text-center" onClick={handleAsk}>
                    <p className="cursor-pointer">문의하기</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ModalAlert
        isOpen={isOpen("needLogin")}
        closeModal={() => {
          closeModal("needLogin");
        }}
        title="안내"
        text={`로그인을 해야 이용할 수 있습니다.`}
      />
    </>
  );
};

export default RoomDetail;
