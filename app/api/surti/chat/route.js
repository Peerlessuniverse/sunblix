import { NextResponse } from 'next/server';
import { processSurtiMessage } from '../../../../lib/surti/aiCoordinator.js';
import { getDbClient, isDbLive } from '../../../../lib/supabaseClient.js';

/**
 * POST /api/surti/chat
 * Processes a customer chat message and (when Supabase is configured) persists
 * the full conversation: every user & assistant message is recorded in
 * surti_messages under a surti_conversations row keyed by customerId+sessionId.
 */
export async function POST(request) {
  let sessionId = null;
  try {
    const body = await request.json();
    const {
      customerId = 'demo-customer-01',
      sessionId: incomingSessionId = null,
      channel = 'web_chat', // 'web_chat' | 'telegram' (voice_call/whatsapp reserved)
      message = '',
      conversationHistory = [],
      customerData = {},
    } = body;
    sessionId = incomingSessionId || customerId; // stable per-customer session

    const result = await processSurtiMessage({
      customerId,
      message,
      conversationHistory,
      customerData,
    });

    // --- Persistence: record user + assistant messages (best-effort) ---
    if (isDbLive() && message) {
      persistTurn({ customerId, sessionId, channel, userMessage: message, assistantReply: result?.reply })
        .catch((err) => console.error('[API /api/surti/chat] persist gagal:', err.message));
    }

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

/**
 * Best-effort persistence of one chat turn into surti_conversations/surti_messages.
 */
async function persistTurn({ customerId, sessionId, channel, userMessage, assistantReply }) {
  const client = getDbClient();
  if (!client) return;

  // 1. Ensure a conversation row exists for this session (idempotent per session)
  let conversationId = conversationCache.get(sessionId);
  if (!conversationId) {
    const inserted = await client.insert('surti_conversations', {
      customer_id: null, // linked later when the lead is qualified
      session_id: sessionId,
      channel: ['web_chat', 'telegram', 'voice_call', 'whatsapp'].includes(channel) ? channel : 'web_chat',
    });
    const row0 = Array.isArray(inserted) ? inserted[0] : null;
    conversationId = row0?.id || null;
    if (conversationId) conversationCache.set(sessionId, conversationId);
  }

  if (!conversationId) return;

  // 2. Record the user message and the assistant reply
  const rows = [
    { conversation_id: conversationId, role: 'user', content: userMessage },
  ];
  if (assistantReply) {
    rows.push({ conversation_id: conversationId, role: 'assistant', content: assistantReply });
  }
  await client.insert('surti_messages', rows);
}

// Conversation id cache (sessionId -> conversation uuid) for the process lifetime
const conversationCache = new Map();
