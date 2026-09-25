/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/cinematic', destination: '/' },
      { source: '/sunblix_cinematic.html', destination: '/' },
    ];
  },
};

export default nextConfig;
