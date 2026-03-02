import type { DaySales, DaySalesCalculated, MonthlyData } from "../types";

export function calculateDaySales(sale: DaySales): DaySalesCalculated {
  const petrolSold =
    sale.pump1_n1_close -
    sale.pump1_n1_open +
    (sale.pump1_n4_close - sale.pump1_n4_open) +
    (sale.pump2_n1_close - sale.pump2_n1_open) +
    (sale.pump2_n4_close - sale.pump2_n4_open) -
    sale.testPetrol;

  const dieselSold =
    sale.pump1_n2_close -
    sale.pump1_n2_open +
    (sale.pump1_n3_close - sale.pump1_n3_open) +
    (sale.pump2_n2_close - sale.pump2_n2_open) +
    (sale.pump2_n3_close - sale.pump2_n3_open) -
    sale.testDiesel;

  const petrolRevenue = petrolSold * sale.petrolPrice;
  const dieselRevenue = dieselSold * sale.dieselPrice;
  const totalRevenue = petrolRevenue + dieselRevenue;
  const revenueWithoutCredit = totalRevenue - sale.creditGiven;

  return {
    ...sale,
    petrolSold,
    dieselSold,
    petrolRevenue,
    dieselRevenue,
    totalRevenue,
    revenueWithoutCredit,
  };
}

export function aggregateByMonth(sales: DaySales[]): MonthlyData[] {
  const map = new Map<string, MonthlyData>();

  for (const sale of sales) {
    const calc = calculateDaySales(sale);
    const month = sale.date.substring(0, 7); // YYYY-MM
    const [year, mon] = month.split("-");
    const date = new Date(Number(year), Number(mon) - 1, 1);
    const monthLabel = date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });

    if (!map.has(month)) {
      map.set(month, {
        month,
        monthLabel,
        petrolRevenue: 0,
        dieselRevenue: 0,
        totalRevenue: 0,
        petrolSold: 0,
        dieselSold: 0,
      });
    }

    const entry = map.get(month)!;
    entry.petrolRevenue += calc.petrolRevenue;
    entry.dieselRevenue += calc.dieselRevenue;
    entry.totalRevenue += calc.totalRevenue;
    entry.petrolSold += calc.petrolSold;
    entry.dieselSold += calc.dieselSold;
  }

  return Array.from(map.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function formatLitres(litres: number): string {
  return `${litres.toFixed(2)} L`;
}
