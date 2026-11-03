import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '../../lib/auth/staffAuth.js';

export const metadata = {
  title: 'SUNBLIX Engineering OS — Dashboard v2',
  description: 'Sistem Engineering, Kalkulator PLTS, SPH & Quotation Resmi SUNBLIX',
};

export default async function DashboardV2Page() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  const auth = verifySessionToken(sessionToken);

  if (!auth.valid) {
    redirect('/DashboardOs/login?redirect=/dashboardv2');
  }

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', background: '#0b1120' }}>
      <iframe
        src="/engineering/index.html"
        title="SUNBLIX Engineering Dashboard v2"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  );
}

