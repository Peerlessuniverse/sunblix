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

  const allSphs = listAllSphs();
  return NextResponse.json({ success: true, sphs: allSphs });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action = 'create_draft', sphId, ...payload } = body;

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

      case 'clear_all':
        clearAllSphs();
        return NextResponse.json({ success: true, message: 'Semua SPH berhasil dikosongkan.' });

      default:
        return NextResponse.json({ success: false, message: `Aksi ${action} tidak dikenali.` }, { status: 400 });
    }

    return NextResponse.json({ success: true, sph: result });
  } catch (error) {
    console.error('[API /api/surti/sph] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  clearAllSphs();
  return NextResponse.json({ success: true, message: 'Semua data SPH berhasil dihapus.' });
}

