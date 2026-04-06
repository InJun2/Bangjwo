import { ReactNode } from "react";

interface LayoutTitleProps {
  title: string;
  children: ReactNode;
  wrapperClassName?: string;
}

const LayoutTitle = ({
  title,
  children,
  wrapperClassName = "",
}: LayoutTitleProps) => {
  return (
    <div
      className={`w-full m-auto mx-auto max-w-4xl flex flex-col px-4 pt-[1.125rem] pb-[4.375rem] items-center ${wrapperClassName}`}
    >
      <h1 className="py-[3.25rem] text-4xl font-extrabold tracking-widest text-neutral-dark300">
        {title}
      </h1>
      {children}
    </div>
  );
};

export default LayoutTitle;
