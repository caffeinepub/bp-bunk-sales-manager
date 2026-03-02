export interface BunkSetup {
  bunkName: string;
  location: string;
}

export interface DaySales {
  id?: bigint;
  date: string; // YYYY-MM-DD
  petrolPrice: number;
  dieselPrice: number;
  pump1_n1_open: number;
  pump1_n1_close: number;
  pump1_n2_open: number;
  pump1_n2_close: number;
  pump1_n3_open: number;
  pump1_n3_close: number;
  pump1_n4_open: number;
  pump1_n4_close: number;
  pump2_n1_open: number;
  pump2_n1_close: number;
  pump2_n2_open: number;
  pump2_n2_close: number;
  pump2_n3_open: number;
  pump2_n3_close: number;
  pump2_n4_open: number;
  pump2_n4_close: number;
  creditGiven: number;
  testPetrol: number;
  testDiesel: number;
}

export interface CreditSettlement {
  id: bigint;
  date: string;
  amountSettled: number;
}

export interface DaySalesCalculated extends DaySales {
  petrolSold: number;
  dieselSold: number;
  petrolRevenue: number;
  dieselRevenue: number;
  totalRevenue: number;
  revenueWithoutCredit: number;
}

export interface MonthlyData {
  month: string; // YYYY-MM
  monthLabel: string; // MMM YYYY
  petrolRevenue: number;
  dieselRevenue: number;
  totalRevenue: number;
  petrolSold: number;
  dieselSold: number;
}
