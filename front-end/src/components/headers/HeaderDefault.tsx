import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../buttons/Button";
import ButtonIcon from "../buttons/ButtonIcon";
import HeaderNavItem from "./HeaderNavItem";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HeaderProps {
  title?: string;
  variant?: "dark" | "light";
}

const Header = ({ title, variant = "light" }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isAuthMenuOpenMobile, setIsAuthMenuOpenMobile] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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

  const handleLogout = () => {
    logout();
    allCloseMobile();
  };

  const authMenuRef = useRef<HTMLDivElement>(null);
  const authMenuButtonRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="flex w-full h-[55px] p-[12px_14px] justify-center items-center gap-[16px] border-b-1 border-neutral-light100">
      {/* Logo */}
      <div>
        <Link to="/" className="flex gap-2 items-center justify-center">
          <span className="pb-[3.5px]">
            <Logo className="w-[35.28px]" variant={variant} />
          </span>
          <span
            className={`text-lg font-['TmonMonsori'] ${
              variant === "light" ? "text-gold" : "text-neutral-black"
            }`}
          >
            방줘
          </span>
        </Link>
      </div>

      {/* title 값이 있다면 다른 형태로 렌더링 */}
      {title ? (
        <div className="text-lg font-bold">{title}</div>
      ) : (
        <>
          {/* title 값이 있다면 다른 형태로 렌더링 */}
          <div className="flex justify-end gap-8 flex-1 items-center">
            <nav>
              <ul className="flex gap-4 items-center hidden md:flex">
                <Link to="/room/find">
                  <HeaderNavItem>집 찾기</HeaderNavItem>
                </Link>
                <Link to="/room/sell">
                  <HeaderNavItem>집 내놓기</HeaderNavItem>
                </Link>
                {user ? (
                  <Link to="/mypage">
                    <HeaderNavItem>마이페이지</HeaderNavItem>
                  </Link>
                ) : null}

                {/* 로그인/로그아웃 버튼 */}
                {user ? (
                  <>
                    <li>
                      <ButtonIcon icon="chat" onClick={openChatWindow} />
                    </li>
                    <li className="relative">
                      <ButtonIcon
                        icon="account_circle"
                        onClick={() => {
                          setIsAuthMenuOpen(!isAuthMenuOpen);
                        }}
                        ref={authMenuButtonRef}
                      />
                      {isAuthMenuOpen && (
                        <div
                          ref={authMenuRef}
                          className="z-1 cursor-pointer absolute right-0 min-w-[6rem] text-center px-4 py-2 border-1 border-neutral-light100 rounded-md max-w-[10rem] w-fit mx-auto my-2 shadow-md bg-neutral-white"
                        >
                          로그아웃
                        </div>
                      )}
                    </li>
                  </>
                ) : (
                  <li>
                    <Button size="small" onClick={() => navigate("/login")}>
                      로그인
                    </Button>
                  </li>
                )}
              </ul>
            </nav>
            {/* Burger Menu Icon (only visible on mobile) */}
            <div className="md:hidden" onClick={toggleMobileMenu}>
              <ButtonIcon icon="menu" />
            </div>
          </div>
        </>
      )}

      {/* 모바일용 창 */}
      <AnimatePresence>
        {isMobileMenuOpen && !title && (
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed max-w-full right-0 top-0 min-w-[16rem] bg-neutral-white h-full z-10001 text-center border-l-2 border-neutral-dark300 px-4 py-8"
          >
            <ul className="flex flex-col gap-8 text-lg text-neutral-dark200">
              <div
                className="md:hidden text-center flex items-center justify-center"
                onClick={allCloseMobile}
              >
                <ButtonIcon
                  icon="close"
                  addClassName="w-fit h-fit bg-neutral-dark300 text-neutral-white mb-4"
                />
              </div>
              <HeaderNavItem
                onClick={() => {
                  navigate("/room/find");
                  setIsMobileMenuOpen(false);
                }}
              >
                집 찾기
              </HeaderNavItem>
              <HeaderNavItem
                onClick={() => {
                  navigate("/room/sell");
                  setIsMobileMenuOpen(false);
                }}
              >
                집 내놓기
              </HeaderNavItem>
              {user ? (
                <HeaderNavItem
                  onClick={() => {
                    navigate("/mypage");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  마이페이지
                </HeaderNavItem>
              ) : null}

              {/* 로그인/로그아웃 버튼 */}
              {user ? (
                <>
                  <li>
                    <ButtonIcon
                      icon="chat"
                      onClick={openChatWindow}
                      addClassName="w-fit h-fit m-auto"
                    />
                  </li>
                  <li>
                    <ButtonIcon
                      icon="account_circle"
                      onClick={() => {
                        setIsAuthMenuOpenMobile(true);
                      }}
                      addClassName="w-fit h-fit m-auto"
                    />
                    {isAuthMenuOpenMobile && (
                      <div className="px-4 py-2 border-1 border-neutral-light100 rounded-md max-w-[10rem] mx-auto my-2 shadow-md bg-neutral-white">
                        <p onClick={handleLogout}>로그아웃</p>
                      </div>
                    )}
                  </li>
                </>
              ) : (
                <li>
                  <Button
                    size="small"
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    로그인
                  </Button>
                </li>
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
