interface RoundedImageProps {
  src?: string;
  alt?: string;
  size?: string;
  className?: string;
}

const RoundedImage = ({
  src,
  alt = "rounded image",
  size = "2.375rem",
  className,
}: RoundedImageProps) => {
  const finalSrc = (src && src.trim() !== "") 
    ? src 
    : "https://images.pexels.com/photos/207272/pexels-photo-207272.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

  return (
    <div
      className={`bg-neutral-light100 rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        className="w-full h-full object-cover rounded-full"
        src={finalSrc}
        alt={alt}
        onError={(e) => {
          e.currentTarget.src = "https://images.pexels.com/photos/207272/pexels-photo-207272.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
        }}
      />
    </div>
  );
};

export default RoundedImage;