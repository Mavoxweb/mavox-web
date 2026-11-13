/** @type {import("next").NextConfig} */
const nextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  images: { formats: ["image/avif", "image/webp"] },
};
export default nextConfig;
