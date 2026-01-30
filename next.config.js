/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use this project as the workspace root (avoids warning about lockfile in parent folder)
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
