import type { NextConfig } from "next";

// GitHub Pages 部署在 https://<user>.github.io/<repo>/ 底下，需要 basePath。
// 本機 dev 時不加，才不會每個網址都要多打前綴。
const isProd = process.env.NODE_ENV === "production";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? "/svroom" : "");

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // 家目錄有另一份 lockfile，不指定的話 Turbopack 會推錯 workspace root
  turbopack: { root: __dirname },
};

export default nextConfig;
