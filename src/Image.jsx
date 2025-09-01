export default function Image({ src, alt = "", className = "", ...rest }) {
  const finalSrc =
    src && src.includes("https://")
      ? src
      : `${import.meta.env.VITE_API_BASE_URL}/uploads/${src}`;

  return (
    <img
      {...rest}
      src={finalSrc}
      alt={alt}
      className={`rounded-2xl object-cover ${className}`}
    />
  );
}
