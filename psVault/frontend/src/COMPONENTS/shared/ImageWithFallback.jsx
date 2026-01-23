import { useState } from "react";

function ImageWithFallback({ src, alt, className, ...props }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !src) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a2236",
          color: "#6b7280",
        }}
        {...props}
      >
        <span>No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      onLoad={() => setLoading(false)}
      {...props}
    />
  );
}

export default ImageWithFallback;
