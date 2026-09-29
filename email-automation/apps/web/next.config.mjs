/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",   // generates /out folder → needed for Render Static Site
  images: {
    unoptimized: true, // required for static export (no Next.js image server)
  },
};

export default nextConfig;
