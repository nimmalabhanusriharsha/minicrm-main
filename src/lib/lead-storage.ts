export type LocalLead = {
  id: string;
  owner_id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const STORAGE_KEY = "apex-crm-leads";

function readStoredLeads(): LocalLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredLeads(leads: LocalLead[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function readLocalLeads(): LocalLead[] {
  return readStoredLeads();
}

export function addLocalLead(input: Omit<LocalLead, "id" | "created_at" | "updated_at">) {
  const leads = readStoredLeads();
  const createdAt = new Date().toISOString();
  const nextLead: LocalLead = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    owner_id: input.owner_id,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    source: input.source,
    status: input.status,
    notes: input.notes ?? null,
    created_at: createdAt,
    updated_at: createdAt,
  };
  writeStoredLeads([nextLead, ...leads]);
  return nextLead;
}

export function updateLocalLead(id: string, updates: Partial<Omit<LocalLead, "id" | "created_at" | "updated_at">>) {
  const leads = readStoredLeads();
  const updated = leads.map((lead) => (lead.id === id ? { ...lead, ...updates, updated_at: new Date().toISOString() } : lead));
  writeStoredLeads(updated);
  return updated.find((lead) => lead.id === id) ?? null;
}

export function deleteLocalLead(id: string) {
  const leads = readStoredLeads();
  const filtered = leads.filter((lead) => lead.id !== id);
  writeStoredLeads(filtered);
  return filtered;
}
