import * as React from "react";

type StaticImageData = {
  src: string;
};

type StorybookImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "height" | "src" | "width"
> & {
  blurDataURL?: string;
  fill?: boolean;
  height?: number | string;
  loader?: unknown;
  placeholder?: string;
  priority?: boolean;
  quality?: number | string;
  src: StaticImageData | string;
  unoptimized?: boolean;
  width?: number | string;
};

export default function Image({
  blurDataURL: _blurDataURL,
  fill,
  height,
  loader: _loader,
  placeholder: _placeholder,
  priority: _priority,
  quality: _quality,
  src,
  style,
  unoptimized: _unoptimized,
  width,
  ...props
}: StorybookImageProps) {
  const resolvedSrc = typeof src === "string" ? src : src.src;

  return (
    <img
      {...props}
      height={fill ? undefined : height}
      src={resolvedSrc}
      style={{
        ...(fill
          ? {
              height: "100%",
              inset: 0,
              objectFit: "cover",
              position: "absolute",
              width: "100%",
            }
          : null),
        ...style,
      }}
      width={fill ? undefined : width}
    />
  );
}
