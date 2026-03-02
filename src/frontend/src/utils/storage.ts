import type { BunkSetup, CreditSettlement, DaySales } from "../types";

const KEYS = {
  SETUP: "bp_setup",
  SALES: "bp_sales",
  CREDIT_SETTLEMENTS: "bp_credit_settlements",
} as const;

// ---- Setup ----
export function getSetup(): BunkSetup | null {
  try {
    const raw = localStorage.getItem(KEYS.SETUP);
    return raw ? (JSON.parse(raw) as BunkSetup) : null;
  } catch {
    return null;
  }
}

export function saveSetup(setup: BunkSetup): void {
  localStorage.setItem(KEYS.SETUP, JSON.stringify(setup));
}

// ---- Sales ----
export function getAllSales(): DaySales[] {
  try {
    const raw = localStorage.getItem(KEYS.SALES);
    return raw ? (JSON.parse(raw) as DaySales[]) : [];
  } catch {
    return [];
  }
}

export function getSalesByDate(date: string): DaySales | null {
  const all = getAllSales();
  return all.find((s) => s.date === date) || null;
}

export function saveSales(sale: DaySales): void {
  const all = getAllSales();
  const idx = all.findIndex((s) => s.date === sale.date);
  if (idx >= 0) {
    all[idx] = sale;
  } else {
    all.push(sale);
  }
  // Sort by date descending
  all.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(KEYS.SALES, JSON.stringify(all));
}

// ---- Credit Settlements ----
export function getCreditSettlements(): CreditSettlement[] {
  try {
    const raw = localStorage.getItem(KEYS.CREDIT_SETTLEMENTS);
    return raw ? (JSON.parse(raw) as CreditSettlement[]) : [];
  } catch {
    return [];
  }
}

export function saveCreditSettlement(
  settlement: Omit<CreditSettlement, "id">,
): CreditSettlement {
  const all = getCreditSettlements();
  const newItem: CreditSettlement = {
    ...settlement,
    id: BigInt(Date.now()),
  };
  all.push(newItem);
  localStorage.setItem(KEYS.CREDIT_SETTLEMENTS, JSON.stringify(all));
  return newItem;
}

export function getTotalCreditGiven(): number {
  return getAllSales().reduce((sum, s) => sum + (s.creditGiven || 0), 0);
}

export function getTotalCreditSettled(): number {
  return getCreditSettlements().reduce(
    (sum, s) => sum + (s.amountSettled || 0),
    0,
  );
}

export function getCreditRemaining(): number {
  return getTotalCreditGiven() - getTotalCreditSettled();
}
