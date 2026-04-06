import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../buttons/Button";
import ButtonIcon from "../buttons/ButtonIcon";
import HeaderNavItem from "./HeaderNavItem";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Toast from "../../features/toast/components/Toast"
import { useNotification, NotificationItem } from "../../contexts/NotificationContext";

interface HeaderProps {
  title?: string;
  variant?: "dark" | "light";
}

const Header = ({ title, variant = "light" }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, notifications, markAsRead } = useNotification();
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isAuthMenuOpenMobile, setIsAuthMenuOpenMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isNotiMenuOpen, setIsNotiMenuOpen] = useState(false);
  const [isNotiMenuOpenMobile, setIsNotiMenuOpenMobile] = useState(false);

  // 💡 1. 토스트 상태 추가
  const [toastMessage, setToastMessage] = useState("");

  const authMenuRef = useRef<HTMLDivElement>(null);
  const authMenuButtonRef = useRef<HTMLDivElement>(null);
  const notiMenuRef = useRef<HTMLDivElement>(null);
  const notiMenuButtonRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const allCloseMobile = () => {
    setIsMobileMenuOpen(false);
    setIsAuthMenuOpenMobile(false);
    setIsNotiMenuOpenMobile(false);
  };

  const openChatWindow = () => {
    window.open("/chat", "_blank", "width=1000,height=700,menubar=no,toolbar=no,location=no,status=no");
    allCloseMobile();
  };

  // 💡 2. 수동 로그아웃 핸들러: 토스트 띄우고 1.5초 뒤 이동
  const handleLogout = () => {
    setToastMessage("로그아웃 중입니다.");
    allCloseMobile();
    setIsAuthMenuOpen(false);
    
    setTimeout(() => {
      logout();
    }, 1500);
  };

  const handleNotificationClick = async (noti: NotificationItem) => {
    await markAsRead(noti.id);
    setIsNotiMenuOpen(false);
    setIsNotiMenuOpenMobile(false);
    
    if (noti.relatedUrl.startsWith("/chat")) {
      openChatWindow();
    } else {
      navigate(noti.relatedUrl); 
    }
  };

  // 💡 3. Axios의 401(만료) 신호를 수신하는 역할
  useEffect(() => {
    const handleTokenExpired = () => {
      setToastMessage("토큰이 만료되었습니다. 로그아웃 됩니다.");
      allCloseMobile();
      setIsAuthMenuOpen(false);

      setTimeout(() => {
        logout();
      }, 1500);
    };

    window.addEventListener("tokenExpired", handleTokenExpired);
    return () => window.removeEventListener("tokenExpired", handleTokenExpired);
  }, [logout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        authMenuRef.current &&
        !authMenuRef.current.contains(event.target as Node) &&
        authMenuButtonRef.current &&
        !authMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsAuthMenuOpen(false);
        setIsAuthMenuOpenMobile(false);
      }

      if (
        notiMenuRef.current && !notiMenuRef.current.contains(event.target as Node) &&
        notiMenuButtonRef.current && !notiMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsNotiMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* 💡 4. 화면 어딘가에 토스트를 띄우기 위한 컴포넌트 */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      <header className="flex w-full h-[55px] p-[12px_14px] justify-center items-center gap-[16px] border-b-1 border-neutral-light100">
        <div>
          <Link to="/" className="flex gap-2 items-center justify-center">
            <span className="pb-[3.5px]">
              <Logo className="w-[35.28px]" variant={variant} />
            </span>
            <span className={`text-lg font-['TmonMonsori'] ${variant === "light" ? "text-gold" : "text-neutral-black"}`}>
              방줘
            </span>
          </Link>
        </div>

        {title ? (
          <div className="text-lg font-bold">{title}</div>
        ) : (
          <div className="flex justify-end gap-8 flex-1 items-center">
            <nav>
              <ul className="flex gap-4 items-center hidden md:flex">
                <Link to="/room/find"><HeaderNavItem>집 찾기</HeaderNavItem></Link>
                <Link to="/room/sell"><HeaderNavItem>집 내놓기</HeaderNavItem></Link>
                {user ? <Link to="/mypage"><HeaderNavItem>마이페이지</HeaderNavItem></Link> : null}

                {user ? (
                  <>
                    <li className="relative flex items-center">
                      <ButtonIcon 
                        icon="notifications" 
                        ref={notiMenuButtonRef} 
                        onClick={() => setIsNotiMenuOpen(!isNotiMenuOpen)} 
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.65rem] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                      
                      {/* 알림 드롭다운 내용 */}
                      {isNotiMenuOpen && (
                        <div ref={notiMenuRef} className="z-10 absolute right-0 top-[120%] w-[18rem] bg-white border border-gray-200 shadow-xl rounded-md overflow-hidden">
                          <div className="p-3 bg-gray-50 border-b font-bold text-sm text-gray-700">새로운 알림</div>
                          <ul className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <li className="p-4 text-center text-sm text-gray-500">새로운 알림이 없습니다.</li>
                            ) : (
                              notifications.map((noti) => (
                                <li 
                                  key={noti.id} 
                                  onClick={() => handleNotificationClick(noti)}
                                  className="p-3 border-b border-gray-100 hover:bg-gold-light/20 cursor-pointer transition-colors"
                                >
                                  <p className="text-sm text-gray-800 line-clamp-2">{noti.message}</p>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      )}
                    </li>
                    <li><ButtonIcon icon="chat" onClick={openChatWindow} /></li>
                    <li className="relative">
                      <ButtonIcon icon="account_circle" onClick={() => setIsAuthMenuOpen(!isAuthMenuOpen)} ref={authMenuButtonRef} />
                      {isAuthMenuOpen && (
                        <div ref={authMenuRef} onClick={handleLogout} className="z-1 cursor-pointer absolute right-0 min-w-[6rem] text-center px-4 py-2 border-1 border-neutral-light100 rounded-md max-w-[10rem] w-fit mx-auto my-2 shadow-md bg-neutral-white">
                          로그아웃
                        </div>
                      )}
                    </li>
                  </>
                ) : (
                  <li><Button size="small" onClick={() => navigate("/login")}>로그인</Button></li>
                )}
              </ul>
            </nav>
            <div className="md:hidden" onClick={toggleMobileMenu}><ButtonIcon icon="menu" /></div>
          </div>
        )}

        <AnimatePresence>
          {isMobileMenuOpen && !title && (
            <motion.nav initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed max-w-full right-0 top-0 min-w-[16rem] bg-neutral-white h-full z-10001 text-center border-l-2 border-neutral-dark300 px-4 py-8">
              <ul className="flex flex-col gap-8 text-lg text-neutral-dark200">
                <div className="md:hidden text-center flex items-center justify-center" onClick={allCloseMobile}>
                  <ButtonIcon icon="close" addClassName="w-fit h-fit bg-neutral-dark300 text-neutral-white mb-4" />
                </div>
                <HeaderNavItem onClick={() => { navigate("/room/find"); setIsMobileMenuOpen(false); }}>집 찾기</HeaderNavItem>
                <HeaderNavItem onClick={() => { navigate("/room/sell"); setIsMobileMenuOpen(false); }}>집 내놓기</HeaderNavItem>
                {user ? <HeaderNavItem onClick={() => { navigate("/mypage"); setIsMobileMenuOpen(false); }}>마이페이지</HeaderNavItem> : null}

                {user ? (
                  <>
                    <li className="relative flex items-center justify-center">
                      <ButtonIcon 
                        icon="notifications" 
                        onClick={() => setIsNotiMenuOpenMobile(!isNotiMenuOpenMobile)} 
                        addClassName="w-fit h-fit m-auto"
                      />
                      
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 right-2 bg-red-500 text-white text-[0.65rem] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}

                      {isNotiMenuOpenMobile && (
                        <div className="z-10 absolute left-1/2 -translate-x-1/2 top-[120%] w-[18rem] bg-white border border-gray-200 shadow-xl rounded-md overflow-hidden text-left">
                          <div className="p-3 bg-gray-50 border-b font-bold text-sm text-gray-700">새로운 알림</div>
                          <ul className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <li className="p-4 text-center text-sm text-gray-500">새로운 알림이 없습니다.</li>
                            ) : (
                              notifications.map((noti) => (
                                <li 
                                  key={noti.id} 
                                  onClick={() => handleNotificationClick(noti)}
                                  className="p-3 border-b border-gray-100 hover:bg-gold-light/20 cursor-pointer transition-colors"
                                >
                                  <p className="text-sm text-gray-800 line-clamp-2">{noti.message}</p>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      )}
                    </li>

                    <li><ButtonIcon icon="chat" onClick={openChatWindow} addClassName="w-fit h-fit m-auto" /></li>
                    <li>
                      <ButtonIcon icon="account_circle" onClick={() => setIsAuthMenuOpenMobile(true)} addClassName="w-fit h-fit m-auto" />
                      {isAuthMenuOpenMobile && (
                        <div className="px-4 py-2 border-1 border-neutral-light100 rounded-md max-w-[10rem] mx-auto my-2 shadow-md bg-neutral-white">
                          <p onClick={handleLogout}>로그아웃</p>
                        </div>
                      )}
                    </li>
                  </>
                ) : (
                  <li><Button size="small" onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}>로그인</Button></li>
                )}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;