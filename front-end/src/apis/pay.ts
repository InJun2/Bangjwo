// // src/apis/paymentAPI.ts
import { loadIamportScript } from "../utils/loadIamport";
import axiosInstance from "../utils/axiosInstances";

export interface PaymentRequestParams {
  merchant_uid: string;    // 주문번호 등 고유 식별값
  name: string;            // 상품명
  amount: number;          // 결제 금액
  buyer_email: string;
  buyer_name: string;
  buyer_tel: string;
  buyer_addr: string;
  buyer_postcode: string;
}

// interface PaymentResponse {
//     channel: string;
//     escrow: boolean;
//     name: string;
//     amount: number;
//     currency: string;
//     status: string;
//     merchantUid: string;
//     impUid: string;
//     buyerName: string;
//     buyerEmail: string;
//     buyerTel: string;
//     customData: any | null;
//     buyerAddr: string;
//     buyerPostcode: string;
//     customerUid: string | null;
//     cardQuota: number;
//     cardNumber: string | null;
//     customerUidUsage: any | null;
//     cashReceiptIssued: boolean;
//     payMethod: string;
//     cardType: number;
//     cancelHistory: any[]; // 필요에 따라 상세 타입 지정 가능
//     pgProvider: string;
//     failedAt: string;
//     bankCode: string | null;
//     startedAt: number;
//     vbankNum: string | null;
//     applyNum: string;
//     bankName: string | null;
//     cancelledAt: string;
//     cardCode: string | null;
//     paidAt: string;
//     vbankIssuedAt: number;
//     receiptUrl: string;
//     cancelAmount: number;
//     vbankCode: string | null;
//     failReason: string | null;
//     vbankName: string | null;
//     vbankHolder: string | null;
//     vbankDate: string;
//     cancelReason: string | null;
//     pgTid: string;
//     embPgProvider: string;
//     cardName: string | null;
//   }
  
//   interface RootResponse {
//     code: number;
//     message: string | null;
//     response: PaymentResponse;
//   }
  
//   interface DocumentResponse {
//     impUid: string | null;
//     merchantUid: string;
//     memberId: number;
//     roomId: number;
//     status: string;
//     pdfUrl: string | null;
//     jsonUrl: string | null;
//     createdAt: string;
//     updatedAt: string;
//   }
  

/**
 * 전달받은 변수값으로 아임포트 결제 API 요청을 실행합니다.
 * 내부에서 스크립트를 로드하고 아임포트를 초기화한 후 결제 요청을 진행합니다.
 *
 * @param params - PaymentRequestParams 객체
 * @param callback - 결제 완료 후 호출될 콜백 함수
 */
// src/apis/paymentAPI.ts
export const requestIamportPayment = async (
  params: PaymentRequestParams
): Promise<any> => {
  await loadIamportScript();

  return new Promise((resolve, reject) => {
    if (!window.IMP) {
      return reject(new Error("아임포트 객체 초기화 실패"));
    }

    window.IMP.init(import.meta.env.VITE_IMP_ID);

    window.IMP.request_pay(
      {
        pg: "html5_inicis", // V1 채널에 맞춘 PG사
        pay_method: "card",
        merchant_uid: params.merchant_uid,
        name: params.name,
        amount: params.amount,
        buyer_email: params.buyer_email,
        buyer_name: params.buyer_name,
        buyer_tel: params.buyer_tel,
        buyer_addr: params.buyer_addr,
        buyer_postcode: params.buyer_postcode,
        // 🚨 모바일 결제 완료 후 돌아올 프론트엔드 URL (도메인에 맞게 수정 필요)
        m_redirect_url: `${window.location.origin}/payment/result` 
      },
      (response: any) => {
        // PC 환경 결제 결과 처리
        if (response.success) {
          resolve(response); // 성공 시 validatePayment로 넘길 데이터 반환
        } else {
          reject(new Error(response.error_msg || "결제에 실패하였습니다."));
        }
      }
    );
  });
};

// /**
//  * 결제 검증 API 함수  
//  * impUid를 입력받아 서버에 결제 검증 요청을 보냅니다.
//  *
//  * @param impUid - 아임포트 결제 완료 후 반환받은 결제 아이디
//  * @returns 결제 검증 결과 JSON
//  */
// export const validatePayment = async (
//     impUid: string
//   ): Promise<RootResponse> => {
//     const response = await fetch(`http://localhost:8080/api/v1/payment/validation/${impUid}`, {
//       method: "POST",
//     });
  
//     if (!response.ok) {
//       throw new Error("결제 검증 요청 실패");
//     }
  
//     return response.json();
//   };
  
//   /**
//    * 결제 상세 조회 API 함수  
//    * paymentId를 입력받아 서버에서 결제 상세 정보를 조회합니다.
//    *
//    * @param paymentId - DB 또는 다른 저장소에 저장된 결제 ID
//    * @returns 결제 상세 조회 결과 JSON
//    */
//   export const getPaymentDetail = async (
//     paymentId: string
//   ): Promise<DocumentResponse> => {
//     const response = await fetch(`http://localhost:8080/api/v1/payment/result/${paymentId}`);
  
//     if (!response.ok) {
//       throw new Error("결제 상세 조회 요청 실패");
//     }
  
//     return response.json();
//   };



///////////////////



// src/api/paymentApi.ts

export interface PaymentPrepareResponse {
    merchant_uid: string;
    amount: number;
    product_name: string;
  }
  
  export interface PaymentValidationResponse {
    success: boolean;
    // 기타 필요한 필드들...
  }
  
  export interface PaymentDetailResponse {
    // DB에 저장된 결제 내역 관련 필드들...
  }
  
  /**
 * 결제 준비 API 호출 (회원 아이디와 방 아이디 전달)
 * axiosInstance의 baseURL 및 헤더 설정을 그대로 활용합니다.
 */
export const preparePayment = async (memberId: number, roomId: number): Promise<PaymentPrepareResponse> => {
    const requestData = { memberId, roomId };
  
    try {
      // 이미 axiosInstance에 baseURL이 설정되어 있으므로, endpoint만 입력합니다.
      const response = await axiosInstance.post('/api/v1/payment/prepare', requestData);
      return response.data as PaymentPrepareResponse;
    } catch (error: any) {
      throw new Error(`preparePayment 실패: ${error?.response?.status || error.message}`);
    }
  };
  
  /**
   * 결제 검증 API 호출 (아임포트 결제 아이디 전달)
   */
  export const validatePayment = async (impUid: string): Promise<PaymentValidationResponse> => {
    try {
      const response = await axiosInstance.post(`/api/v1/payment/validation/${impUid}`);
      return response.data as PaymentValidationResponse;
    } catch (error: any) {
      throw new Error(`validatePayment 실패: ${error?.response?.status || error.message}`);
    }
  };
  
  /**
   * 결제 상세 조회 API 호출 (결제 ID 전달)
   */
  export const getPaymentDetail = async (paymentId: string): Promise<PaymentDetailResponse> => {
    try {
      const response = await axiosInstance.get(`/api/v1/payment/result/${paymentId}`);
      return response.data as PaymentDetailResponse;
    } catch (error: any) {
      throw new Error(`getPaymentDetail 실패: ${error?.response?.status || error.message}`);
    }
  };
  