/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    HYGRAPH_ENDPOINT: process.env.HYGRAPH_ENDPOINT,
    HYGRAPH_TOKEN: process.env.HYGRAPH_TOKEN,
  },
};

module.exports = nextConfig;
