import './globals.css';

export const metadata = {
  metadataBase: new URL('https://sunblix.com'),
  title: 'SUNBLIX — Power Your World | Solusi Solar Panel PLTS Indonesia',
  description:
    'SUNBLIX adalah penyedia solusi terpercaya PLTS Rooftop residensial dan komersial di Indonesia. Hemat tagihan listrik hingga 80% dengan garansi performa 25 tahun, komponen Tier-1, dan izin resmi PLN & SLO ESDM.',
  keywords: [
    'SUNBLIX',
    'PLTS Rooftop',
    'Solar Panel Indonesia',
    'Panel Surya Rumah',
    'Tenaga Surya',
    'Pasang PLTS',
    'Garansi 25 Tahun',
    'Net Metering PLN',
    'SLO ESDM',
    'EPC Solar',
  ],
  authors: [{ name: 'PT SUNBLIX ENERGI INDONESIA' }],
  creator: 'PT SUNBLIX ENERGI INDONESIA',
  publisher: 'PT SUNBLIX ENERGI INDONESIA',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'SUNBLIX',
    url: 'https://sunblix.com/',
    title: 'SUNBLIX — Power Your World | Solusi Solar Panel PLTS Indonesia',
    description:
      'Spesialis PLTS Rooftop Terpercaya di 19+ Kota Indonesia. Hemat biaya listrik hingga 80% dengan garansi performa 25 tahun dan izin resmi PLN & SLO.',
    images: [
      {
        url: '/asset/herobg.png',
        width: 1200,
        height: 630,
        alt: 'SUNBLIX Solar Panel Indonesia',
      },
    ],
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUNBLIX — Power Your World | Solusi Solar Panel PLTS Indonesia',
    description:
      'Spesialis PLTS Rooftop Terpercaya di 19+ Kota Indonesia. Garansi performa 25 tahun dan perizinan resmi PLN.',
    images: ['/asset/herobg.png'],
  },
  icons: {
    icon: [
      { url: '/asset/favicon.svg', type: 'image/svg+xml' },
      { url: '/asset/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/asset/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/asset/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport = {
  themeColor: '#031c3f',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;850;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
