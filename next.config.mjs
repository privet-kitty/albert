/** @type {import('next').NextConfig} */

const isStatic = process.env.ALBERT_STATIC === "true";

const nextConfig = {
  output: isStatic ? "export" : "standalone",
};

export default nextConfig;
