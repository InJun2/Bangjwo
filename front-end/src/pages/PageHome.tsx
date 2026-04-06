import SearchBar from "../components/SearchBar";
import MainImage from "../assets/images/main_image.png";
import Video from "../assets/videos/9629254-hd_1920_1080_24fps.mp4";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Button from "../components/buttons/Button";
import ScrollToTop from "../components/ScrollToTop";
import { useNavigate } from "react-router-dom";
import MotionArrow from "../components/MotionArrow";
import { RoomBuildingType } from "../types/roomTypes";

const PageHome = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [visibleSections, setVisibleSections] = useState<{
    [key: number]: boolean;
  }>({});
  const [selectedCategory, setSelectedCategory] =
    useState<RoomBuildingType>("ONEROOM_TWOROOM");

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const goToLogin = () => {
    navigate("/login");
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play();
    }
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = sectionsRef.current.indexOf(
            entry.target as HTMLElement
          );
          if (entry.isIntersecting && index !== -1) {
            setVisibleSections((prev) => ({ ...prev, [index]: true }));
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const radioOptions: { value: RoomBuildingType; label: string }[] = [
    { value: "ONEROOM_TWOROOM", label: "원룸 · 투룸" },
    { value: "APARTMENT", label: "아파트" },
    { value: "VILLA_HOUSE", label: "빌라 · 주택" },
    { value: "OFFICETEL", label: "오피스텔" },
  ];

  return (
    <>
      {/* first */}
      <section className="relative flex flex-col items-center min-h-[50vh] sm:min-h-screen pt-[2rem]">
        <div className="hidden sm:flex absolute left-0 top-0 m-4 flex-grow min-h-[16.5rem]">
          <MotionArrow addClass="hidden sm:flex" />
          <p className="writing-mode-vertical-rl">
            Scroll for know more about BangJwo
          </p>
        </div>
        <div className="w-full z-1 flex flex-col items-center gap-6 p-6">
          <div className="text-[clamp(1.25rem,calc(100vw/12),3rem)] font-bold">
            어떤 집을 찾고 있나요?
          </div>
          <div className="w-full flex flex-col gap-4 items-center">
            {/* category */}
            <div className="flex justify-around bg-neutral-black rounded-xl text-neutral-white w-full max-w-md px-2 py-1">
              {radioOptions.map(({ value, label }) => (
                <p
                  key={value}
                  onClick={() => {
                    setSelectedCategory(value);
                  }}
                  className={`cursor-pointer px-2 rounded-lg transition-all duration-300 ${
                    selectedCategory === value
                      ? "bg-gold-light text-neutral-dark300"
                      : ""
                  }`}
                >
                  {label}
                </p>
              ))}
            </div>
            <SearchBar category={selectedCategory} />
          </div>
        </div>
        <img src={MainImage} alt="뭐지" className="w-full mt-[-2rem]" />
        <div className="w-full flex-grow bg-neutral-black"></div>
      </section>

      {/* second */}
      <section
        ref={(el) => {
          sectionsRef.current[0] = el;
        }}
        className="bg-neutral-black min-h-[50vh] sm:min-h-screen flex flex-col justify-center pb-12"
      >
        {visibleSections[0] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }} // 처음엔 안 보이다가
            animate={{ opacity: 1, y: 0 }} // 자연스럽게 올라오며 나타남
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col gap-20"
          >
            <div className="text-[calc(100vw/8)] font-bold text-gold">
              <p>SAFE WITH</p>
              <p>BLOCKCHAIN</p>
            </div>
            <div className="font-thin text-xl text-neutral-white">
              방줘는 블록체인으로 위변조 없이 안전하게 계약서를 저장합니다.
            </div>
          </motion.div>
        )}
      </section>

      {/* third */}
      <section
        ref={(el) => {
          sectionsRef.current[1] = el;
        }}
        className="relative min-h-screen"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={Video} type="video/mp4" />
          브라우저가 비디오 태그를 지원하지 않습니다.
        </video>

        {visibleSections[1] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }} // 처음엔 안 보이다가
            animate={{ opacity: 1, y: 0 }} // 자연스럽게 올라오며 나타남
            transition={{ duration: 1, ease: "easeOut" }} // 1초 동안 애니메이션
            className="relative flex justify-center items-center min-h-screen text-white bg-black/50"
          >
            <div className="flex flex-col gap-6 items-center p-12">
              <div className="text-gold-light text-6xl font-bold">
                <p>지금 바로</p>
                <p>안전하게</p>
              </div>
              <div>
                <Button size="medium" variant="point">
                  <span className="text-8xl font-black">방 줘!</span>
                </Button>
              </div>
              {!isLoggedIn && (
                <Button variant="dark" onClick={goToLogin}>
                  로그인/회원가입하러 가기
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </section>
      <ScrollToTop />
    </>
  );
};

export default PageHome;
