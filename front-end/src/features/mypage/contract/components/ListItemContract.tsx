import Button from "../../../../components/buttons/Button";
import LineBox from "../../../../components/LineBox";
import MaterialIcon from "../../../../components/MaterialIcon";
import { useRoomNavigation } from "../../../../hooks/useRoomNavigation";
import { RoomBuildingType } from "../../../../types/roomTypes";
import { roomBuildingTypeLabel } from "../../../../utils/roomMapper";
import { useNavigate } from "react-router-dom";

interface ContractRoom {
  roomId: number;
  memberId: number;
  buildingType: string;
  deposit: number;
  monthlyRent: number;
  lat: number;
  lng: number;
  contractId?: number;
  contractStatus?: "BEFORE_WRITE" | "LANDLORD_COMPLETED" | "TENANT_COMPLETED" | "TENANT_SIGNED" | "COMPLETED";
  myRole?: "LANDLORD" | "TENANT";
}

interface ListItemContractProps {
  contract: ContractRoom;
}

const ListItemContract = ({ contract }: ListItemContractProps) => {
  const { goToRoomDetail } = useRoomNavigation();
  const navigate = useNavigate();

  const handleAddressClick = () => {
    goToRoomDetail(contract.lat, contract.lng, contract.roomId);
  };

  const getContractAction = () => {
    const { roomId, contractId, contractStatus, myRole } = contract;

    if (!contractId || !contractStatus || !myRole) {
      return { label: "데이터 연동 대기 중", btnText: "확인 불가", path: "", disabled: true };
    }

    if (contractStatus === "BEFORE_WRITE") {
      if (myRole === "LANDLORD") return { label: "임대인 작성 중", btnText: "계약서 작성하기", path: `/seller-contract/${roomId}/${contractId}`, disabled: false };
      return { label: "임대인 작성 중", btnText: "대기 중", path: "", disabled: true };
    }
    
    if (contractStatus === "LANDLORD_COMPLETED") {
      if (myRole === "TENANT") return { label: "임차인 확인 중", btnText: "계약서 작성하기", path: `/buyer-contract/${roomId}/${contractId}`, disabled: false };
      return { label: "임차인 확인 대기", btnText: "대기 중", path: "", disabled: true };
    }

    if (contractStatus === "TENANT_COMPLETED") {
      if (myRole === "TENANT") return { label: "임차인 서명 대기", btnText: "계약서 승인하기", path: `/final-sign/${roomId}/${contractId}`, disabled: false };
      return { label: "임차인 서명 대기", btnText: "대기 중", path: "", disabled: true };
    }

    if (contractStatus === "TENANT_SIGNED") {
      if (myRole === "LANDLORD") return { label: "임대인 서명 대기", btnText: "계약서 승인하기", path: `/final-sign/${roomId}/${contractId}`, disabled: false };
      return { label: "임대인 서명 대기", btnText: "대기 중", path: "", disabled: true };
    }

    if (contractStatus === "COMPLETED") {
      return { label: "계약 완료", btnText: "계약서 확인하기", path: `/final-sign/${roomId}/${contractId}`, disabled: false };
    }

    return { label: "상태 알 수 없음", btnText: "확인 불가", path: "", disabled: true };
  };

  const action = getContractAction();

  return (
    <>
      <li className="w-full sm:w-1/2 md:w-1/3 p-2">
        <LineBox addClassName=" flex flex-col justify-center items-center gap-4">
          <div className="flex flex-col gap-1 items-center w-full">
            
            <div className="flex flex-col items-center gap-1.5 w-full">
              <Button as="div" size="small" isAngular variant="gold">
                내가 계약한 집
              </Button>
              <div className="text-sm font-bold text-neutral-dark100 mt-1 bg-neutral-light100/50 px-3 py-1 rounded-md">
                진행 상태: <span className="text-blue-600">{action.label}</span>
              </div>
            </div>

            <div
              onClick={handleAddressClick}
              className="cursor-pointer flex flex-wrap items-center mt-3"
            >
              <div className="flex gap-1 text-xl font-semibold">
                <span>월세</span>
                <span>
                  {contract.deposit / 10000}/{contract.monthlyRent / 10000}
                </span>
              </div>
              <MaterialIcon icon="arrow_forward_ios" />
            </div>
            
            <div className="font-light text-neutral-gray">
              {contract.buildingType in roomBuildingTypeLabel
                ? roomBuildingTypeLabel[
                    contract.buildingType as RoomBuildingType
                  ]
                : "기타"}
            </div>
          </div>

          <Button 
            size="small" 
            variant="point"
            disabled={action.disabled}
            onClick={() => {
              if (!action.disabled && action.path) navigate(action.path);
            }}
          >
            {action.btnText}
          </Button>
        </LineBox>
      </li>
    </>
  );
};

export default ListItemContract;