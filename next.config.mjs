/** @type {import('next').NextConfig} */

const isProd = process.env.ALBERT_ENV === "production";
const isStatic = isProd || process.env.ALBERT_STATIC === "true";

const PROD_SUBDIRECTORY = "/albert";

const nextConfig = {
  output: isStatic ? "export" : "standalone",
  basePath: isProd ? PROD_SUBDIRECTORY : "",
  assetPrefix: isProd ? PROD_SUBDIRECTORY : "",
};

export default nextConfig;
