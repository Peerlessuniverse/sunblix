'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SurtiSphPreviewModal from '../../components/SurtiSphPreviewModal';

export default function SphDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [sph, setSph] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/surti/sph?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.sph) {
          setSph(data.sph);
        }
      })
      .catch((err) => console.error('Fetch SPH err:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020d1c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p>Memuat Dokumen Penawaran Resmi SUNBLIX...</p>
      </div>
    );
  }

  if (!sph) {
    return (
      <div style={{ minHeight: '100vh', background: '#020d1c', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Dokumen SPH Tidak Ditemukan</h2>
        <p style={{ color: '#94a3b8', margin: '10px 0 20px 0' }}>Dokumen SPH {id} belum terdaftar atau telah kadaluarsa.</p>
        <Link href="/surti" style={{ padding: '8px 16px', background: '#003b7a', color: '#fff', borderRadius: '6px', textDecoration: 'none' }}>
          ← Kembali ke SURTI AI
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020d1c' }}>
      <SurtiSphPreviewModal
        sph={sph}
        onClose={() => router.push('/surti')}
      />
    </div>
  );
}
