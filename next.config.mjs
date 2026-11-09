/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  async headers() {
    return [
      {
        source: '/asset/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.(jpg|jpeg|png|webp|svg|mp4|pdf|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/SUNBLIX_KATALOG_2026.pdf',
        destination: '/SUNBLIX%20KATALOG%202026%20NEW.pdf',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/', destination: '/dashboardv2', has: [{ type: 'host', value: 'dashboardv2.sunblix.id' }] },
      { source: '/cinematic', destination: '/' },
      { source: '/sunblix_cinematic.html', destination: '/' },
      { source: '/dashboard', destination: '/DashboardOs' },
      { source: '/dashboardos', destination: '/DashboardOs' },
      { source: '/os', destination: '/DashboardOs' },
    ];
  },
};

export default nextConfig;
