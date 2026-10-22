/**
 * ============================================================================
 * SUNBLIX SURTI AI — PERSISTENT MEMORY SYSTEM (4 LAYERS)
 * ============================================================================
 * Full implementation of the 4-layer memory architecture:
 * 1. Working Memory: Active intent, recent message context, pending questions.
 * 2. Episodic Memory: Conversation summaries, previous interaction outcomes.
 * 3. Semantic / Preference Memory: Durable facts, customer budget, consumption,
 *    roof constraints, preferred language, verified vs inferred facts.
 * 4. Project / Operational Memory: SPH quote states, survey bookings, ticket IDs.
 */

// In-Memory store for Demo Mode and active runtime sessions
const memoryStore = {
  // Key: customerId or sessionId
  customers: {},
  // Sessions
  sessions: {},
};

/**
 * Initialize or get memory container for a customer session
 */
export function getOrCreateCustomerMemory(customerId = 'demo-customer-01') {
  if (!memoryStore.customers[customerId]) {
    memoryStore.customers[customerId] = {
      customerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
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
  mem.updatedAt = new Date().toISOString();
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
    mem.updatedAt = new Date().toISOString();
  }
  return mem.semanticMemory;
}

/**
 * Append episodic summary
 */
export function addEpisodicSummary(customerId, summary, decisions = [], recommendedPackage = null) {
  const mem = getOrCreateCustomerMemory(customerId);
  const episode = {
    id: `ep-${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary,
    decisions,
    recommendedPackage,
  };
  mem.episodicMemory.push(episode);
  mem.updatedAt = new Date().toISOString();
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
  mem.updatedAt = new Date().toISOString();
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
  return { success: true, message: 'Memori percakapan Anda telah berhasil direset.' };
}
