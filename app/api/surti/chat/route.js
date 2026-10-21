import { NextResponse } from 'next/server';
import { processSurtiMessage } from '../../../../lib/surti/aiCoordinator.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerId = 'demo-customer-01',
      message = '',
      conversationHistory = [],
      customerData = {},
    } = body;

    const result = await processSurtiMessage({
      customerId,
      message,
      conversationHistory,
      customerData,
    });

    return NextResponse.json({
      success: true,
      reply: result.reply,
      mode: result.mode,
      toolCalls: result.toolCalls,
      data: result.data,
      quickActions: result.quickActions || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API /api/surti/chat] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error processing SURTI chat',
      },
      { status: 500 }
    );
  }
}
