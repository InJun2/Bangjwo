import { useState } from "react";
import { fetchContractPdf } from "../../../apis/contract";

interface ContractViewButtonProps {
  contractId: number;
}

const ContractViewButton = ({ contractId }: ContractViewButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenPdf = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const url = await fetchContractPdf(contractId);
      if (url) {
        window.open(url, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(url), 6000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleOpenPdf}
      disabled={isLoading}
      className={`px-4 py-2 font-bold rounded text-sm transition-colors ${
            isLoading ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300"
      }`}
    >
      {isLoading ? "불러오는 중..." : "계약서 보기"}
    </button>
  );
};

export default ContractViewButton;