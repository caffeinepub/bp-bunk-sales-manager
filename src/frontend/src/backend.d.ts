import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DaySales {
    id: bigint;
    pump1_n2_open: number;
    pump2_n1_close: number;
    dieselPrice: number;
    pump2_n2_close: number;
    pump2_n3_open: number;
    date: string;
    pump1_n1_close: number;
    testPetrol: number;
    pump2_n3_close: number;
    pump1_n3_open: number;
    pump2_n1_open: number;
    pump1_n2_close: number;
    pump2_n4_close: number;
    pump1_n1_open: number;
    creditGiven: number;
    pump2_n4_open: number;
    pump1_n3_close: number;
    pump1_n4_close: number;
    testDiesel: number;
    pump1_n4_open: number;
    pump2_n2_open: number;
    petrolPrice: number;
}
export interface CreditSettlement {
    id: bigint;
    date: string;
    amountSettled: number;
}
export interface BunkSetup {
    bunkName: string;
    location: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCreditSettlement(date: string, amountSettled: number): Promise<void>;
    addDaySales(date: string, petrolPrice: number, dieselPrice: number, pump1_n1_open: number, pump1_n1_close: number, pump1_n2_open: number, pump1_n2_close: number, pump1_n3_open: number, pump1_n3_close: number, pump1_n4_open: number, pump1_n4_close: number, pump2_n1_open: number, pump2_n1_close: number, pump2_n2_open: number, pump2_n2_close: number, pump2_n3_open: number, pump2_n3_close: number, pump2_n4_open: number, pump2_n4_close: number, creditGiven: number, testPetrol: number, testDiesel: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteDaySalesByDate(date: string): Promise<void>;
    getAllDaySales(): Promise<Array<DaySales>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCreditSettlements(from: string, to: string): Promise<Array<CreditSettlement>>;
    getDaySalesByDate(date: string): Promise<DaySales | null>;
    getSetup(): Promise<BunkSetup | null>;
    getTotalOutstandingCredit(): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveSetup(bunkName: string, location: string): Promise<void>;
    updateDaySales(id: bigint, date: string, petrolPrice: number, dieselPrice: number, pump1_n1_open: number, pump1_n1_close: number, pump1_n2_open: number, pump1_n2_close: number, pump1_n3_open: number, pump1_n3_close: number, pump1_n4_open: number, pump1_n4_close: number, pump2_n1_open: number, pump2_n1_close: number, pump2_n2_open: number, pump2_n2_close: number, pump2_n3_open: number, pump2_n3_close: number, pump2_n4_open: number, pump2_n4_close: number, creditGiven: number, testPetrol: number, testDiesel: number): Promise<void>;
}
