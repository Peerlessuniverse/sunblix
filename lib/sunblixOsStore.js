/**
 * ============================================================================
 * SUNBLIX OS — CENTRAL LOCAL BUSINESS DATA STORE
 * PT. SUNBLIX ENERGI INDONESIA
 * ============================================================================
 * Handles persistent operational data for:
 * - CRM & Sales Pipeline (Leads & SPH proposals)
 * - EPC Projects Portfolio & Construction Progress
 * - Finance, Invoices, Payment Milestones (Termin 50/40/10)
 * - Operations & Executive Approval Inbox (My Work Tasks)
 * - Equipment & Material Inventory (Tier-1 Modules, Inverters, Batteries)
 * - Real-time subscription event bus for reactive UI updates
 */

const STORAGE_KEY = 'sunblix_os_store_v3';

// ----------------------------------------------------------------------------
// SEED DEFAULT DATA (Clean Zero-State for Live Operations)
// ----------------------------------------------------------------------------

// NOTE: previously seeded with two real early customers (used as the
// first demo/template records) whose name, phone and email kept
// reappearing as the default example every time the CRM store was
// reset. Kept as a true empty zero-state, matching SEED_PROJECTS /
// SEED_INVOICES / SEED_INVENTORY below, so no past customer's data is
// reused as a stand-in for future ones.
export const SEED_LEADS = [];
export const SEED_PROJECTS = [];
export const SEED_INVOICES = [];
export const SEED_TASKS = [];
export const SEED_INVENTORY = [];
export const SEED_NOTIFICATIONS = [];
export const SEED_MESSAGES = [];

// ----------------------------------------------------------------------------
// STORE SUBSCRIBERS
// ----------------------------------------------------------------------------
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error('Error in store listener:', err);
    }
  });
}

export function subscribeToStore(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ----------------------------------------------------------------------------
// CORE STORE READ / WRITE HELPERS
// ----------------------------------------------------------------------------

function isLegacyItem(item) {
  if (!item) return false;
  const str = JSON.stringify(item);
  return (
    str.includes('Villa Sanur') ||
    str.includes('PT Megah Semesta') ||
    str.includes('Bambang Sutrisno') ||
    str.includes('Pabrik Tekstil Solo') ||
    str.includes('Canggu Eco') ||
    str.includes('Ubud Heritage') ||
    str.includes('Agro Tabanan') ||
    str.includes('Indofood') ||
    str.includes('DAS-2620')
  );
}

function loadRawData() {
  const empty = {
    leads: [...SEED_LEADS],
    projects: [...SEED_PROJECTS],
    invoices: [...SEED_INVOICES],
    tasks: [...SEED_TASKS],
    inventory: [...SEED_INVENTORY],
    notifications: [...SEED_NOTIFICATIONS],
    messages: [...SEED_MESSAGES],
    updatedAt: new Date().toISOString(),
  };

  if (typeof window === 'undefined') {
    return empty;
  }

  // Purge legacy storage keys from previous templates
  try {
    localStorage.removeItem('sunblix_os_store_v2');
    localStorage.removeItem('sunblix_os_store');
    localStorage.removeItem('sunblix_os_data');
    localStorage.removeItem('sunblix_crm_leads');
  } catch {}

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    return empty;
  }

  try {
    const parsed = JSON.parse(stored);
    let cleanLeads = Array.isArray(parsed.leads) ? parsed.leads.filter((i) => !isLegacyItem(i)) : [];
    if (cleanLeads.length === 0) {
      cleanLeads = [...SEED_LEADS];
    }
    const cleanProjects = Array.isArray(parsed.projects) ? parsed.projects.filter((i) => !isLegacyItem(i)) : [];
    const cleanInvoices = Array.isArray(parsed.invoices) ? parsed.invoices.filter((i) => !isLegacyItem(i)) : [];
    const cleanTasks = Array.isArray(parsed.tasks) && parsed.tasks.length > 0
      ? parsed.tasks.filter((i) => !isLegacyItem(i))
      : [...SEED_TASKS];
    const cleanInventory = Array.isArray(parsed.inventory) ? parsed.inventory.filter((i) => !isLegacyItem(i)) : [];
    const cleanNotifications = Array.isArray(parsed.notifications) && parsed.notifications.length > 0
      ? parsed.notifications.filter((i) => !isLegacyItem(i))
      : [...SEED_NOTIFICATIONS];
    const cleanMessages = Array.isArray(parsed.messages) ? parsed.messages.filter((i) => !isLegacyItem(i)) : [];

    return {
      leads: cleanLeads,
      projects: cleanProjects,
      invoices: cleanInvoices,
      tasks: cleanTasks,
      inventory: cleanInventory,
      notifications: cleanNotifications,
      messages: cleanMessages,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return empty;
  }
}

export function clearAllStoreData() {
  if (typeof window === 'undefined') return;
  const empty = {
    leads: [],
    projects: [],
    invoices: [],
    tasks: [],
    inventory: [],
    notifications: [],
    messages: [],
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('sunblix_os_store_v2');
    localStorage.removeItem('sunblix_os_store');
    localStorage.removeItem('sunblix_os_data');
    localStorage.removeItem('sunblix_crm_leads');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
  emit();
  return empty;
}


function saveRawData(data) {
  if (typeof window === 'undefined') return;
  data.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    emit();
  } catch (e) {
    console.error('Error writing to localStorage:', e);
  }
}

// ----------------------------------------------------------------------------
// CRM / LEADS API
// ----------------------------------------------------------------------------

export function getStoreLeads() {
  return loadRawData().leads;
}

export function saveStoreLead(lead) {
  const data = loadRawData();
  const leads = [...data.leads];

  if (!lead.id) {
    const nextIdx = leads.length + 1;
    lead.id = `LD-26${String(nextIdx).padStart(2, '0')}`;
    lead.date = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    leads.unshift(lead);
  } else {
    const idx = leads.findIndex((l) => l.id === lead.id);
    if (idx >= 0) {
      leads[idx] = { ...leads[idx], ...lead };
    } else {
      leads.unshift(lead);
    }
  }

  data.leads = leads;
  saveRawData(data);
  return lead;
}

export function updateLeadStage(leadId, nextStage) {
  const data = loadRawData();
  const leads = data.leads.map((l) => (l.id === leadId ? { ...l, stage: nextStage } : l));
  data.leads = leads;
  saveRawData(data);
}

export function deleteStoreLead(leadId) {
  const data = loadRawData();
  data.leads = data.leads.filter((l) => l.id !== leadId);
  saveRawData(data);
}

/**
 * CONVERT A WON LEAD INTO AN ACTIVE EPC PROJECT & GENERATE INVOICES
 */
export function convertLeadToProject(leadId) {
  const data = loadRawData();
  const lead = data.leads.find((l) => l.id === leadId);
  if (!lead) return null;

  // 1. Update lead stage to Deal Won
  data.leads = data.leads.map((l) => (l.id === leadId ? { ...l, stage: 'Deal Won' } : l));

  // 2. Generate new Project
  const nextPrjNum = data.projects.length + 1;
  const projectCode = `SBX-PRJ-26${String(nextPrjNum).padStart(2, '0')}`;
  const kwpFloat = parseFloat(lead.targetKwp) || 5.85;

  const newProject = {
    code: projectCode,
    name: `${lead.company || lead.name} PLTS`,
    client: lead.name,
    location: lead.location,
    type: kwpFloat >= 20 ? 'Commercial (PRO+)' : 'Residential (PRO)',
    kwp: `${kwpFloat.toFixed(2)} kWp`,
    kwpNum: kwpFloat,
    inverter: kwpFloat >= 15 ? '3 Phase Hybrid Inverter' : '1 Phase On-Grid Inverter',
    panels: `${Math.round((kwpFloat * 1000) / 585)}x LONGI / Astronergy 585 Wp`,
    progress: 10,
    status: 'Instalasi Struktur Rangka',
    statusColor: 'info',
    cod: 'Target 30 Hari Kerja',
    estYield: `${Math.round(kwpFloat * 135)} kWh/bln`,
    contractValue: lead.estValue,
    contractValueNum: lead.estValueNum || 100000000,
    notes: `Dikonversi dari prospek ${lead.id}. ${lead.notes || ''}`,
  };

  data.projects.unshift(newProject);

  // 3. Generate Official 3-Termin Invoices (DP 50%, Material 40%, Handover 10%)
  const totalVal = lead.estValueNum || 100000000;
  const dpAmount = Math.round(totalVal * 0.5);
  const matAmount = Math.round(totalVal * 0.4);
  const finalAmount = totalVal - dpAmount - matAmount;

  const nextInvNum = data.invoices.length + 1;
  const invDP = {
    invNumber: `INV-SBX-26${String(nextInvNum).padStart(2, '0')}`,
    client: `${lead.name} (${lead.company || lead.location})`,
    projectCode: projectCode,
    kwp: `${kwpFloat.toFixed(2)} kWp`,
    milestone: 'Termin 1 (DP 50% Penandatanganan Kontrak)',
    amount: 'Rp ' + dpAmount.toLocaleString('id-ID'),
    amountNum: dpAmount,
    dueDate: '7 Hari Kerja',
    status: 'Menunggu Pelunasan',
    statusColor: 'warning',
    method: 'BCA Virtual Account / Mandiri',
    paidAt: null,
  };

  data.invoices.unshift(invDP);

  // 4. Add Task to My Work for Engineering & Survey
  const newTask = {
    id: `TSK-${data.tasks.length + 101}`,
    title: `Kickoff Engineering & Final Rooftop Survey: ${newProject.name}`,
    category: 'Engineering',
    priority: 'HIGH',
    assignee: 'Tim EPC Engineer',
    dueDate: 'Besok, 09:00',
    status: 'pending',
    project: newProject.name,
    icon: '⚡',
  };
  data.tasks.unshift(newTask);

  saveRawData(data);
  return { project: newProject, invoice: invDP };
}

// ----------------------------------------------------------------------------
// PROJECTS API
// ----------------------------------------------------------------------------

export function getStoreProjects() {
  return loadRawData().projects;
}

export function saveStoreProject(project) {
  const data = loadRawData();
  const projects = [...data.projects];

  if (!project.code) {
    const nextIdx = projects.length + 1;
    project.code = `SBX-PRJ-26${String(nextIdx).padStart(2, '0')}`;
    projects.unshift(project);
  } else {
    const idx = projects.findIndex((p) => p.code === project.code);
    if (idx >= 0) {
      projects[idx] = { ...projects[idx], ...project };
    } else {
      projects.unshift(project);
    }
  }

  data.projects = projects;
  saveRawData(data);
  return project;
}

export function updateProjectProgress(projectCode, progress, status, statusColor) {
  const data = loadRawData();
  data.projects = data.projects.map((p) => {
    if (p.code === projectCode) {
      return {
        ...p,
        progress: Number(progress),
        status: status || p.status,
        statusColor: statusColor || (progress >= 100 ? 'success' : progress >= 80 ? 'warning' : 'info'),
      };
    }
    return p;
  });
  saveRawData(data);
}

export function deleteStoreProject(projectCode) {
  const data = loadRawData();
  data.projects = data.projects.filter((p) => p.code !== projectCode);
  saveRawData(data);
}

// ----------------------------------------------------------------------------
// FINANCE / INVOICES API
// ----------------------------------------------------------------------------

export function getStoreInvoices() {
  return loadRawData().invoices;
}

export function saveStoreInvoice(invoice) {
  const data = loadRawData();
  const invoices = [...data.invoices];

  if (!invoice.invNumber) {
    const nextIdx = invoices.length + 1;
    invoice.invNumber = `INV-SBX-26${String(nextIdx).padStart(2, '0')}`;
    invoices.unshift(invoice);
  } else {
    const idx = invoices.findIndex((i) => i.invNumber === invoice.invNumber);
    if (idx >= 0) {
      invoices[idx] = { ...invoices[idx], ...invoice };
    } else {
      invoices.unshift(invoice);
    }
  }

  data.invoices = invoices;
  saveRawData(data);
  return invoice;
}

export function markInvoicePaid(invNumber) {
  const data = loadRawData();
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  data.invoices = data.invoices.map((inv) => {
    if (inv.invNumber === invNumber) {
      return {
        ...inv,
        status: 'Lunas',
        statusColor: 'success',
        paidAt: todayStr,
      };
    }
    return inv;
  });
  saveRawData(data);
}

export function deleteStoreInvoice(invNumber) {
  const data = loadRawData();
  data.invoices = data.invoices.filter((i) => i.invNumber !== invNumber);
  saveRawData(data);
}

// ----------------------------------------------------------------------------
// TASKS (MY WORK) API
// ----------------------------------------------------------------------------

export function getStoreTasks() {
  return loadRawData().tasks;
}

export function saveStoreTask(task) {
  const data = loadRawData();
  const tasks = [...data.tasks];

  if (!task.id) {
    task.id = `TSK-${tasks.length + 101}`;
    task.status = task.status || 'pending';
    task.icon = task.icon || '📌';
    tasks.unshift(task);
  } else {
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], ...task };
    } else {
      tasks.unshift(task);
    }
  }

  data.tasks = tasks;
  saveRawData(data);
  return task;
}

export function toggleStoreTask(taskId) {
  const data = loadRawData();
  data.tasks = data.tasks.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: t.status === 'completed' ? 'pending' : 'completed',
      };
    }
    return t;
  });
  saveRawData(data);
}

export function deleteStoreTask(taskId) {
  const data = loadRawData();
  data.tasks = data.tasks.filter((t) => t.id !== taskId);
  saveRawData(data);
}

// ----------------------------------------------------------------------------
// INVENTORY API
// ----------------------------------------------------------------------------

export function getStoreInventory() {
  return loadRawData().inventory;
}

export function adjustInventoryStock(sku, delta) {
  const data = loadRawData();
  data.inventory = data.inventory.map((item) => {
    if (item.sku === sku) {
      const newStock = Math.max(0, (item.stock || 0) + delta);
      const isLow = newStock <= item.minStock;
      return {
        ...item,
        stock: newStock,
        status: isLow ? 'Menipis' : 'Aman',
        statusColor: isLow ? 'warning' : 'success',
      };
    }
    return item;
  });
  saveRawData(data);
}

// ----------------------------------------------------------------------------
// NOTIFICATIONS & MESSAGES API
// ----------------------------------------------------------------------------

export function getStoreNotifications() {
  return loadRawData().notifications || SEED_NOTIFICATIONS;
}

export function markNotificationRead(id) {
  const data = loadRawData();
  data.notifications = (data.notifications || SEED_NOTIFICATIONS).map((n) =>
    n.id === id ? { ...n, isRead: true } : n
  );
  saveRawData(data);
}

export function markAllNotificationsRead() {
  const data = loadRawData();
  data.notifications = (data.notifications || SEED_NOTIFICATIONS).map((n) => ({ ...n, isRead: true }));
  saveRawData(data);
}

export function addStoreNotification(notif) {
  const data = loadRawData();
  const notifs = [...(data.notifications || SEED_NOTIFICATIONS)];
  const nextId = `NTF-${Date.now()}`;
  notifs.unshift({
    id: nextId,
    time: 'Baru saja',
    isRead: false,
    ...notif,
  });
  data.notifications = notifs;
  saveRawData(data);
}

export function clearStoreNotifications() {
  const data = loadRawData();
  data.notifications = [];
  saveRawData(data);
}

export function getStoreMessages() {
  return loadRawData().messages || SEED_MESSAGES;
}

export function addStoreMessage(msg) {
  const data = loadRawData();
  const msgs = [...(data.messages || SEED_MESSAGES)];
  msgs.unshift({
    id: `MSG-${Date.now()}`,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    status: 'Baru',
    ...msg,
  });
  data.messages = msgs;
  saveRawData(data);
}

// ----------------------------------------------------------------------------
// RESET / EXPORT / IMPORT
// ----------------------------------------------------------------------------


export function resetStoreToDefault() {
  if (typeof window === 'undefined') return;
  const initial = {
    leads: SEED_LEADS,
    projects: SEED_PROJECTS,
    invoices: SEED_INVOICES,
    tasks: SEED_TASKS,
    inventory: SEED_INVENTORY,
    notifications: SEED_NOTIFICATIONS,
    messages: SEED_MESSAGES,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  emit();
  return initial;
}

export function exportStoreJson() {
  const raw = loadRawData();
  return JSON.stringify(raw, null, 2);
}

export function importStoreJson(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      saveRawData(parsed);
      return { success: true };
    }
    return { success: false, error: 'Format JSON tidak valid' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

