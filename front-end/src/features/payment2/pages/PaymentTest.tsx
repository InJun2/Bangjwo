import React, { useState, useEffect, ChangeEvent  } from "react";
import { preparePayment, validatePayment, getPaymentDetail, PaymentPrepareResponse, requestIamportPayment } from "../../../apis/pay";

declare global {
  interface Window {
    IMP: any;
  }
}

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

const PaymentTest: React.FC = () => {
  const [prepareResult, setPrepareResult] = useState<PaymentPrepareResponse | null>(null);
  const [validateResult, setValidateResult] = useState<any>(null);
  const [detailResult, setDetailResult] = useState<any>(null);
  const [impScriptLoaded, setImpScriptLoaded] = useState<boolean>(false);
  const [paymentParams, setPaymentParams] = useState<PaymentRequestParams>({
    merchant_uid: "",
    name: "",
    amount: 0,
    buyer_email: "",
    buyer_name: "",
    buyer_tel: "",
    buyer_addr: "",
    buyer_postcode: "",
  });

  // 아임포트 스크립트를 동적으로 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    script.async = true;
    script.onload = () => setImpScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 사전 정보 등록 및 결제 요청 핸들러
  const handlePrepareSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const memberId = Number(formData.get("memberId"));
    const roomId = Number(formData.get("roomId"));

    try {
      const data = await preparePayment(memberId, roomId);
      setPrepareResult(data);

      // 아임포트 결제 요청
      if (impScriptLoaded && window.IMP) {
        window.IMP.init(import.meta.env.VITE_IMP_ID);
        const { merchant_uid, amount, product_name } = data;
        window.IMP.request_pay(
          {
            pg: "html5_inicis",
            pay_method: "card",
            merchant_uid,
            name: product_name,
            amount,
            buyer_email: "test@example.com",
            buyer_name: "테스터",
            buyer_tel: "01012345678",
            buyer_addr: "서울특별시 강남구",
            buyer_postcode: "01181",
          },
          (rsp: any) => {
            if (rsp.success) {
              alert("결제 성공! imp_uid: " + rsp.imp_uid);
            } else {
              alert("결제 실패: " + rsp.error_msg);
            }
          }
        );
      } else {
        console.error("아임포트 스크립트가 로드되지 않았습니다.");
      }
    } catch (error) {
    //   setPrepareResult({ error });
    }
  };

  // 결제 검증 핸들러
  const handleValidateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const impUid = formData.get("impUid") as string;

    try {
      const data = await validatePayment(impUid);
      setValidateResult(data);
    } catch (error) {
      setValidateResult({ error });
    }
  };

  // 결제 상세 조회 핸들러
  const handleDetailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const paymentId = formData.get("paymentId") as string;

    try {
      const data = await getPaymentDetail(paymentId);
      setDetailResult(data);
    } catch (error) {
      setDetailResult({ error });
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPaymentParams({
      ...paymentParams,
      // amount는 숫자로 변환합니다.
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // event.target은 HTMLFormElement임을 명시적으로 지정
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const paymentParams: PaymentRequestParams = {
      merchant_uid: formData.get("merchant_uid") as string,
      name: formData.get("name") as string,
      amount: Number(formData.get("amount")),
      buyer_email: formData.get("buyer_email") as string,
      buyer_name: formData.get("buyer_name") as string,
      buyer_tel: formData.get("buyer_tel") as string,
      buyer_addr: formData.get("buyer_addr") as string,
      buyer_postcode: formData.get("buyer_postcode") as string,
    };

    // 별도로 구현해 둔 결제 요청 함수를 호출합니다.
    requestIamportPayment(paymentParams).catch((error) => {
      console.error("결제 요청 중 에러 발생:", error);
    });
  };

  return (
    <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Payment API 테스트</h1>

      {/* 사전 정보 입력 */}
      <h2>사전 정보 입력</h2>
      <form onSubmit={handlePrepareSubmit} style={{ marginBottom: "30px", padding: "10px", border: "1px solid #ccc" }}>
        <label htmlFor="memberId">Member ID:</label>
        <input type="number" name="memberId" id="memberId" defaultValue="1" required />

        <label htmlFor="roomId">Room ID:</label>
        <input type="number" name="roomId" id="roomId" defaultValue="1" required />

        <button type="submit" style={{ padding: "5px", marginTop: "5px" }}>
          사전 정보 등록 + 결제 요청
        </button>
      </form>
      <div id="prepareResult">
        <pre style={{ backgroundColor: "#f5f5f5", padding: "10px" }}>{JSON.stringify(prepareResult, null, 2)}</pre>
      </div>

      {/* 결제 검증 */}
      <h2>결제 검증</h2>
      <form onSubmit={handleValidateSubmit} style={{ marginBottom: "30px", padding: "10px", border: "1px solid #ccc" }}>
        <label htmlFor="impUid">Imp UID:</label>
        <input type="text" name="impUid" id="impUid" placeholder="아임포트 결제 ID 입력" required />
        <button type="submit" style={{ padding: "5px", marginTop: "5px" }}>
          결제 검증
        </button>
      </form>
      <div id="validateResult">
        <pre style={{ backgroundColor: "#f5f5f5", padding: "10px" }}>{JSON.stringify(validateResult, null, 2)}</pre>
      </div>

      {/* 결제 상세 조회 */}
      <h2>결제 내역 상세 조회</h2>
      <form onSubmit={handleDetailSubmit} style={{ marginBottom: "30px", padding: "10px", border: "1px solid #ccc" }}>
        <label htmlFor="paymentId">Payment ID:</label>
        <input type="text" name="paymentId" id="paymentId" placeholder="DB에 저장된 Payment ID 입력" required />
        <button type="submit" style={{ padding: "5px", marginTop: "5px" }}>
          내역 조회
        </button>
      </form>
      <div id="detailResult">
        <pre style={{ backgroundColor: "#f5f5f5", padding: "10px" }}>{JSON.stringify(detailResult, null, 2)}</pre>
      </div>

      {/* 결제 요청 테스트 */}
      <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>결제 요청 테스트</h2>
      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: "30px", padding: "10px", border: "1px solid #ccc" }}
      >
        <div>
          <label htmlFor="merchant_uid">주문번호:</label>
          <input
            type="text"
            name="merchant_uid"
            id="merchant_uid"
            value={paymentParams.merchant_uid}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="name">상품명:</label>
          <input
            type="text"
            name="name"
            id="name"
            value={paymentParams.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="amount">결제 금액:</label>
          <input
            type="number"
            name="amount"
            id="amount"
            value={paymentParams.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="buyer_email">이메일:</label>
          <input
            type="email"
            name="buyer_email"
            id="buyer_email"
            value={paymentParams.buyer_email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="buyer_name">구매자 이름:</label>
          <input
            type="text"
            name="buyer_name"
            id="buyer_name"
            value={paymentParams.buyer_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="buyer_tel">연락처:</label>
          <input
            type="tel"
            name="buyer_tel"
            id="buyer_tel"
            value={paymentParams.buyer_tel}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="buyer_addr">주소:</label>
          <input
            type="text"
            name="buyer_addr"
            id="buyer_addr"
            value={paymentParams.buyer_addr}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="buyer_postcode">우편번호:</label>
          <input
            type="text"
            name="buyer_postcode"
            id="buyer_postcode"
            value={paymentParams.buyer_postcode}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" style={{ padding: "5px", marginTop: "5px" }}>
          결제 요청
        </button>
      </form>
    </div>
    </div>
  );
};

export default PaymentTest;