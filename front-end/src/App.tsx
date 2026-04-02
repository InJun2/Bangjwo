//router
import { BrowserRouter, Routes, Route } from "react-router-dom";
//layouts
import LayoutMain from "./layouts/LayoutMain";
//pages
import PageHome from "./pages/PageHome";
import PageTest from "./pages/PageTest";
import PageTestButton from "./pages/PageTestButton";
import SellerContractPage from "./features/contract/pages/SellerContractPage";
import "react-datepicker/dist/react-datepicker.css";
import { AuthProvider } from "./contexts/AuthProvider";
import RedirectIfNotLoggedIn from "./features/auth/components/RedirectIfNotLoggedIn";
import PageMy from "./features/mypage/pages/PageMy";
import PageMyAccount from "./features/mypage/account/pages/PageMyAccount";
import RedirectRoomFind from "./features/room-find/components/RedirectRoomFind";
import PageNotFound from "./pages/PageNotFound";
import PageLogin from "./features/auth/pages/PageLogin";
import PageKakaoRedirect from "./features/auth/pages/PageKakaoRedirect";
import PageRoomSellCreate from "./features/room-sell/pages/PageRoomSellCreate";
import PageRoomSellUpdate from "./features/room-sell/pages/PageRoomSellUpdate";
import RoomForm from "./features/room-sell/components/RoomForm";
import VerifyOwner from "./features/room-sell/components/VerifyOwner";
import CreateSuccess from "./features/room-sell/components/CreateSuccess";
import RoomSellNotice from "./features/room-sell/components/RoomSellNotice";
import ChatPageOnly from "./features/chat/pages/ChatPageOnly";
import PageMySell from "./features/mypage/sell/pages/PageMySell";
import PageMyLike from "./features/mypage/like/pages/PageMyLike";
import BuyerContractPage from "./features/contract/pages/BuyerContractPage";
import PageMyContract from "./features/mypage/contract/pages/PageMyContract";
import RedirectIfNotAuth from "./features/auth/components/RedirectIfNotAuth";
import ChatbotPage from "./features/chatbot/pages/ChatbotPage";
import PaymentTest from "./features/payment2/pages/PaymentTest";
import PageWelcome from "./features/auth/pages/PageWelcome";
import ChatbotNoticePage from "./features/chatbot/pages/ChatbotNoticePage";
import ThreeJSScene from "./features/contract/pages/ThreeJSScene";
import PageRegistry from "./features/registry/pages/PageRegistry";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <LayoutMain darkHeader wrapperClassName="bg-gold-light">
                <PageHome />
              </LayoutMain>
            }
          />
          <Route
            path="/room/find/:category?"
            element={
              <LayoutMain
                wrapperClassName="h-screen min-h-[calc(27rem+55px+7.9rem)] min-w-[calc(5.035rem+660px)]"
                mainClassName="flex flex-row overflow-hidden"
                hasFooter={false}
              >
                <RedirectRoomFind />
              </LayoutMain>
            }
          />
          <Route
            path="/room/sell"
            element={
              <RedirectIfNotLoggedIn>
                <RedirectIfNotAuth>
                  <LayoutMain>
                    <PageRoomSellCreate />
                  </LayoutMain>
                </RedirectIfNotAuth>
              </RedirectIfNotLoggedIn>
            }
          >
            <Route index element={<RoomSellNotice />} />
            <Route path="write" element={<RoomForm type="create" />} />
            <Route path="verify/:roomId" element={<VerifyOwner />} />
            <Route path="success/:roomId" element={<CreateSuccess />} />
          </Route>
          <Route
            path="/room/update/:roomId"
            element={
              <LayoutMain>
                <PageRoomSellUpdate />
              </LayoutMain>
            }
          />
          <Route
            path="/login"
            element={
              <LayoutMain>
                <PageLogin />
              </LayoutMain>
            }
          />
          <Route
            path="/welcome"
            element={
              <LayoutMain>
                <PageWelcome />
              </LayoutMain>
            }
          />
          <Route path="/auth/kakao/callback" element={<PageKakaoRedirect />} />
          <Route
            path="/mypage"
            element={
              <RedirectIfNotLoggedIn>
                <LayoutMain>
                  <PageMy />
                </LayoutMain>
              </RedirectIfNotLoggedIn>
            }
          >
            <Route index element={<PageMyAccount />} />
            <Route path="contract" element={<PageMyContract />} />
            <Route path="sell" element={<PageMySell />} />
            <Route path="like" element={<PageMyLike />} />
          </Route>
          <Route path="/test" element={<PageTest />} />
          <Route path="/test/button" element={<PageTestButton />} />
          <Route path="/seller-contract/:roomId/:contractId" element={<SellerContractPage />} />
          <Route path="/buyer-contract/:roomId/:contractId" element={<BuyerContractPage />} />
          <Route path="/chat" element={<ChatPageOnly />} />
          <Route
            path="/chatbot-notice"
            element={
              <ChatbotNoticePage onAgree={() => console.log("동의 처리")} />
            }
          />{" "}
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/pay_test" element={<PaymentTest />}></Route>
          <Route path="/blockchain-loading" element={<ThreeJSScene />} />
          {/* 그 외 모든 페이지는 404 not found */}
          <Route
            path="*"
            element={
              <LayoutMain
                wrapperClassName="bg-gold-light"
                mainClassName="flex"
                darkHeader
              >
                <PageNotFound />
              </LayoutMain>
            }
          />
          <Route
            path="/registry/:paymentId"
            element={
              <LayoutMain>
                <PageRegistry />
              </LayoutMain>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
