import { NextResponse } from 'next/server';
import {
  createDraftSph,
  submitSphForReview,
  approveSphByHuman,
  requestSphRevision,
  issueOfficialSph,
  getSphById,
  listAllSphs,
  clearAllSphs,
} from '../../../../lib/surti/sphService.js';
import { verifyRequestAuth } from '../../../../lib/auth/staffAuth.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const sph = getSphById(id);
    if (!sph) {
      return NextResponse.json({ success: false, message: 'SPH tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, sph });
  }

  // Listing all official SPH proposals is restricted to authenticated staff
  const auth = verifyRequestAuth(request);
  if (!auth.valid) {
    return NextResponse.json(
      {
        success: false,
        message: 'Akses ditolak. Rekapitulasi seluruh data SPH memerlukan sesi staf yang sah.',
      },
      { status: 401 }
    );
  }

  const allSphs = listAllSphs();
  return NextResponse.json({ success: true, sphs: allSphs });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action = 'create_draft', sphId, ...payload } = body;

    // Destructive action check: clear_all requires staff authorization
    if (action === 'clear_all') {
      const auth = verifyRequestAuth(request);
      if (!auth.valid) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. Pengosongan data SPH memerlukan sesi staf yang sah.' },
          { status: 401 }
        );
      }

      if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_DATA_RESET) {
        return NextResponse.json(
          { success: false, message: 'Penghapusan massal SPH dilarang di lingkungan produksi.' },
          { status: 403 }
        );
      }

      console.warn(`[AUDIT] SPH database cleared by staff session at ${new Date().toISOString()}`);
      clearAllSphs();
      return NextResponse.json({ success: true, message: 'Semua SPH berhasil dikosongkan.' });
    }

    // Administrative approval/issue actions require staff authorization
    if (action === 'approve' || action === 'issue' || action === 'request_revision') {
      const auth = verifyRequestAuth(request);
      if (!auth.valid) {
        return NextResponse.json(
          {
            success: false,
            message: `Akses ditolak. Operasi persetujuan SPH (${action}) memerlukan autentikasi staf yang sah.`,
          },
          { status: 401 }
        );
      }
    }

    let result;
    switch (action) {
      case 'create_draft':
        result = createDraftSph(payload);
        break;

      case 'submit_review':
        result = submitSphForReview(sphId, payload.notes);
        break;

      case 'approve':
        result = approveSphByHuman(sphId, payload.reviewerName, payload.comments);
        break;

      case 'request_revision':
        result = requestSphRevision(sphId, payload.reviewerName, payload.revisionReason);
        break;

      case 'issue':
        result = issueOfficialSph(sphId, payload.issuerName);
        break;

      default:
        return NextResponse.json({ success: false, message: `Aksi ${action} tidak dikenali.` }, { status: 400 });
    }

    return NextResponse.json({ success: true, sph: result });
  } catch (error) {
    console.error('[API /api/surti/sph] Error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem SPH.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  // Reject unauthenticated requests to prevent unauthorized wipe
  const auth = verifyRequestAuth(request);
  if (!auth.valid) {
    return NextResponse.json(
      {
        success: false,
        message: 'Akses ditolak. Penghapusan data SPH memerlukan sesi staf yang sah (Cookie atau Bearer token).',
      },
      { status: 401 }
    );
  }

  // Prevent mass deletion in production unless explicitly permitted by break-glass variable
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_DATA_RESET) {
    return NextResponse.json(
      {
        success: false,
        message: 'Operasi penghapusan massal data SPH dilarang di lingkungan produksi.',
      },
      { status: 403 }
    );
  }

  console.warn(`[AUDIT] SPH mass DELETE executed by authenticated staff (${auth.payload?.role || 'staff'}) at ${new Date().toISOString()}`);
  clearAllSphs();
  return NextResponse.json({ success: true, message: 'Semua data SPH berhasil dihapus.' });
}
