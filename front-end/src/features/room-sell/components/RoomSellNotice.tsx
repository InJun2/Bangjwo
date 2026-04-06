import { useNavigate } from "react-router-dom";
import LayoutNotice from "../../../layouts/LayoutNotice";

const RoomSellNotice = () => {
  const navigate = useNavigate();
  const goNext = () => {
    navigate("write");
  };

  return (
    <LayoutNotice
      onClick={goNext}
      infoText="안내드립니다"
      buttonText="계속 내놓으러 가기"
    >
      <div className="text-sm">
        <p>집을 내놓으려면 수수료 10원과</p>
        <p>부동산 고유 번호가 필요합니다.</p>
      </div>
    </LayoutNotice>
  );
};

export default RoomSellNotice;
