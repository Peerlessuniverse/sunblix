/**
 * ============================================================================
 * SUNBLIX SURTI AI — PERSISTENT MEMORY SYSTEM (4 LAYERS, DB-FIRST)
 * ============================================================================
 * Full implementation of the 4-layer memory architecture:
 * 1. Working Memory: Active intent, recent message context, pending questions.
 * 2. Episodic Memory: Conversation summaries, previous interaction outcomes.
 * 3. Semantic / Preference Memory: Durable facts, customer budget, consumption,
 *    roof constraints, preferred language, verified vs inferred facts.
 * 4. Project / Operational Memory: SPH quote states, survey bookings, ticket IDs.
 *
 * PERSISTENCE (2026-10-25 Supabase integration):
 *  - With SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set, the 4-layer memory of
 *    every customer is mirrored into surti_customer_memories (memory_layer =
 *    'working' | 'episodic' | 'semantic' | 'operational', memory_key =
 *    customerId). Reads hydrate the in-memory cache from the DB on first access,
 *    so memories survive restarts and redeploys.
 *  - Without env vars, everything stays in-memory (demo mode) as before.
 */

import { getDbClient, isDbLive, logPersistenceMode } from '../supabaseClient.js';

logPersistenceMode('surti/memorySystem');

// In-Memory store for Demo Mode and active runtime sessions
const memoryStore = {
  // Key: customerId or sessionId
  customers: {},
  // Sessions
  sessions: {},
};

const MEMORY_TABLE = 'surti_customer_memories';
const hydrationDone = new Set(); // customerIds already hydrated from DB

function nowIso() {
  return new Date().toISOString();
}

/**
 * Build the default in-memory container
 */
function defaultCustomerMemory(customerId) {
  return {
    customerId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    // 1. Working Memory
    workingMemory: {
      activeIntent: 'greeting',
      recentTurns: [],
      currentStep: 'discovery',
      answeredQuestions: [],
      missingQuestions: ['property_type', 'monthly_bill', 'project_location'],
      lastToolResult: null,
    },
    // 2. Episodic Memory
    episodicMemory: [
      {
        id: `ep-${Date.now()}-1`,
        timestamp: nowIso(),
        summary: 'Percakapan awal dimulai. Pelanggan menyapa dan mengeksplorasi solusi PLTS Rooftop SUNBLIX.',
        decisions: [],
        recommendedPackage: null,
      },
    ],
    // 3. Semantic / Preference Memory
    semanticMemory: {
      language: 'id',
      propertyType: null, // 'house' | 'villa' | 'commercial' | 'warehouse'
      monthlyBill: null, // IDR
      location: null,
      budgetStated: null,
      roofType: 'Genteng Keramik',
      plnPowerVa: null, // e.g. 5500 VA
      preferredSystemType: null, // 'hybrid' | 'ongrid' | 'offgrid'
      // Verified flags to prevent AI hallucination over authoritative data
      factsVerification: {
        monthlyBill: false,
        propertyType: false,
        location: false,
      },
    },
    // 4. Project / Operational Memory
    projectMemory: {
      activeProjectId: `PRJ-${customerId.substring(0, 8)}`,
      currentStage: 'CONSULTATION', // 'CONSULTATION' | 'ASSESSMENT' | 'SPH_DRAFTED' | 'SURVEY_SCHEDULED' | 'APPROVED'
      assessments: [],
      sphDrafts: [],
      surveyRequests: [],
      serviceTickets: [],
    },
  };
}

// ---------------------------------------------------------------------------
// DB HYDRATION & FLUSH
// ---------------------------------------------------------------------------
async function hydrateFromDb(customerId) {
  if (!isDbLive() || hydrationDone.has(customerId)) return;
  hydrationDone.add(customerId);
  try {
    const client = getDbClient();
    const rows = await client
      .from(MEMORY_TABLE)
      .select('*')
      .eq('memory_key', customerId)
      .limit(50);

    if (!Array.isArray(rows) || rows.length === 0) return;

    let container = memoryStore.customers[customerId];
    if (!container) {
      container = defaultCustomerMemory(customerId);
      memoryStore.customers[customerId] = container;
    }

    for (const row of rows) {
      if (row.status === 'deleted') continue;
      const value = row.memory_value;
      try {
        switch (row.memory_layer) {
          case 'working':
            container.workingMemory = { ...container.workingMemory, ...(value || {}) };
            break;
          case 'semantic':
            container.semanticMemory = { ...container.semanticMemory, ...(value || {}) };
            break;
          case 'episodic':
            if (Array.isArray(value?.episodes)) container.episodicMemory = value.episodes;
            break;
          case 'operational':
            if (value?.projectMemory) container.projectMemory = { ...container.projectMemory, ...value.projectMemory };
            break;
        }
      } catch (e) {
        console.warn(`[memorySystem] Gagal parse memori layer ${row.memory_layer}:`, e.message);
      }
    }
  } catch (err) {
    console.error('[memorySystem.hydrateFromDb] gagal:', err.message);
  }
}

function scheduleMemoryFlush(customerId, layer, memoryValue) {
  if (!isDbLive()) return;
  (async () => {
    try {
      const client = getDbClient();
      await client.insert(
        MEMORY_TABLE,
        {
          // customer_id is set when known; memory_key ties rows to runtime customerId
          customer_id: null,
          memory_layer: layer,
          memory_key: customerId,
          memory_value: memoryValue,
          confidence: 1.0,
          is_verified: true,
          status: 'active',
        },
        { upsert: false }
      );
    } catch (err) {
      console.error(`[memorySystem.scheduleMemoryFlush:${layer}] gagal:`, err.message);
    }
  })();
}

/**
 * Initialize or get memory container for a customer session
 */
export function getOrCreateCustomerMemory(customerId = 'demo-customer-01') {
  if (!memoryStore.customers[customerId]) {
    memoryStore.customers[customerId] = defaultCustomerMemory(customerId);
    // Async hydration upgrades the default container with DB data if present
    hydrateFromDb(customerId);
  } else {
    hydrateFromDb(customerId); // idempotent (guarded by hydrationDone set)
  }
  return memoryStore.customers[customerId];
}

/**
 * Retrieve relevant memories for prompt context
 */
export function retrieveRelevantMemories(customerId = 'demo-customer-01') {
  const memory = getOrCreateCustomerMemory(customerId);
  return {
    working: {
      activeIntent: memory.workingMemory.activeIntent,
      currentStep: memory.workingMemory.currentStep,
      missingQuestions: memory.workingMemory.missingQuestions,
    },
    semantic: {
      language: memory.semanticMemory.language,
      propertyType: memory.semanticMemory.propertyType,
      monthlyBill: memory.semanticMemory.monthlyBill,
      location: memory.semanticMemory.location,
      preferredSystemType: memory.semanticMemory.preferredSystemType,
      budgetStated: memory.semanticMemory.budgetStated,
    },
    episodicRecent: memory.episodicMemory.slice(-3),
    project: {
      currentStage: memory.projectMemory.currentStage,
      sphDraftsCount: memory.projectMemory.sphDrafts.length,
      surveyCount: memory.projectMemory.surveyRequests.length,
      ticketCount: memory.projectMemory.serviceTickets.length,
    },
  };
}

/**
 * Update working memory state
 */
export function updateWorkingMemory(customerId, { intent, currentStep, answeredQuestion, missingQuestions, lastToolResult }) {
  const mem = getOrCreateCustomerMemory(customerId);
  if (intent) mem.workingMemory.activeIntent = intent;
  if (currentStep) mem.workingMemory.currentStep = currentStep;
  if (answeredQuestion && !mem.workingMemory.answeredQuestions.includes(answeredQuestion)) {
    mem.workingMemory.answeredQuestions.push(answeredQuestion);
    mem.workingMemory.missingQuestions = mem.workingMemory.missingQuestions.filter((q) => q !== answeredQuestion);
  }
  if (missingQuestions) mem.workingMemory.missingQuestions = missingQuestions;
  if (lastToolResult) mem.workingMemory.lastToolResult = lastToolResult;
  mem.updatedAt = nowIso();

  scheduleMemoryFlush(customerId, 'working', mem.workingMemory);
  return mem.workingMemory;
}

/**
 * Save confirmed semantic / preference fact
 */
export function updateSemanticFact(customerId, key, value, isVerified = true) {
  const mem = getOrCreateCustomerMemory(customerId);
  if (key in mem.semanticMemory) {
    mem.semanticMemory[key] = value;
    mem.semanticMemory.factsVerification[key] = isVerified;
  } else {
    // Unknown keys (e.g. customerName, phone, plnPower added during intake) are
    // stored too so nothing from the conversation is lost.
    mem.semanticMemory[key] = value;
    mem.semanticMemory.factsVerification[key] = isVerified;
  }
  mem.updatedAt = nowIso();

  scheduleMemoryFlush(customerId, 'semantic', mem.semanticMemory);
  return mem.semanticMemory;
}

/**
 * Append episodic summary
 */
export function addEpisodicSummary(customerId, summary, decisions = [], recommendedPackage = null) {
  const mem = getOrCreateCustomerMemory(customerId);
  const episode = {
    id: `ep-${Date.now()}`,
    timestamp: nowIso(),
    summary,
    decisions,
    recommendedPackage,
  };
  mem.episodicMemory.push(episode);
  mem.updatedAt = nowIso();

  scheduleMemoryFlush(customerId, 'episodic', { episodes: mem.episodicMemory });
  return episode;
}

/**
 * Attach operational record (SPH draft, survey, ticket)
 */
export function attachOperationalRecord(customerId, type, record) {
  const mem = getOrCreateCustomerMemory(customerId);
  if (type === 'sphDraft') {
    mem.projectMemory.sphDrafts.push(record);
    mem.projectMemory.currentStage = 'SPH_DRAFTED';
  } else if (type === 'survey') {
    mem.projectMemory.surveyRequests.push(record);
    mem.projectMemory.currentStage = 'SURVEY_SCHEDULED';
  } else if (type === 'ticket') {
    mem.projectMemory.serviceTickets.push(record);
  } else if (type === 'assessment') {
    mem.projectMemory.assessments.push(record);
    mem.projectMemory.currentStage = 'ASSESSMENT';
  }
  mem.updatedAt = nowIso();

  scheduleMemoryFlush(customerId, 'operational', { projectMemory: mem.projectMemory });
  return mem.projectMemory;
}

/**
 * Customer control: view remembered details
 */
export function getCustomerMemorySummary(customerId = 'demo-customer-01') {
  const mem = getOrCreateCustomerMemory(customerId);
  return {
    customerId: mem.customerId,
    durablePreferences: mem.semanticMemory,
    recentInteractions: mem.episodicMemory,
    projectRecords: {
      stage: mem.projectMemory.currentStage,
      sphDrafts: mem.projectMemory.sphDrafts,
      surveys: mem.projectMemory.surveyRequests,
      tickets: mem.projectMemory.serviceTickets,
    },
    updatedAt: mem.updatedAt,
  };
}

/**
 * Customer control: clear or reset memory
 */
export function clearCustomerMemory(customerId = 'demo-customer-01') {
  delete memoryStore.customers[customerId];
  hydrationDone.delete(customerId);

  if (isDbLive()) {
    (async () => {
      try {
        const client = getDbClient();
        await client.update(MEMORY_TABLE, { memory_key: customerId }, { status: 'deleted' });
      } catch (err) {
        console.error('[memorySystem.clearCustomerMemory] DB soft-delete gagal:', err.message);
      }
    })();
  }

  return { success: true, message: 'Memori percakapan Anda telah berhasil direset.' };
}
