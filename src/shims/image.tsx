import React from "react";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
}

export default function Image({
  src,
  alt = "",
  width,
  height,
  fill,
  className = "",
  priority,
  unoptimized,
  style,
  ...props
}: ImageProps) {
  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(fill
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }
      : {}),
  };

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      style={combinedStyle}
      {...props}
    />
  );
}
