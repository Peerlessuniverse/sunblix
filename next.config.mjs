/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/cinematic', destination: '/' },
      { source: '/sunblix_cinematic.html', destination: '/' },
      { source: '/dashboard', destination: '/DashboardOs' },
      { source: '/dashboardos', destination: '/DashboardOs' },
      { source: '/os', destination: '/DashboardOs' },
    ];
  },
};

export default nextConfig;
