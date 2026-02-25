import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = Principal;
export type Timestamp = bigint;
export type Rupees = bigint;
export interface ConsumptionRecord {
    date: Timestamp;
    user: UserId;
    unitsConsumed: Units;
    timestamp: Timestamp;
}
export interface BillEstimate {
    totalCost: Rupees;
    unitsConsumed: Units;
    unitCost: bigint;
}
export interface BillDetails {
    fixedCharges: Rupees;
    totalCost: Rupees;
    totalUnitsConsumed: Units;
    slabCosts: Array<SlabBreakdown>;
}
export type Units = bigint;
export interface SlabBreakdown {
    cost: Rupees;
    name: string;
    units: Units;
    perUnitCost: bigint;
}
export interface UserProfile {
    name: string;
    consumerNumber: string;
    email: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addConsumptionRecord(date: Timestamp, unitsConsumed: Units): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRole(user: Principal, role: UserRole): Promise<void>;
    calculateBillEstimate(units: Units, isBPL: boolean): Promise<BillEstimate>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConsumptionRecordsByUser(user: UserId): Promise<Array<ConsumptionRecord>>;
    getDetailedBillEstimate(units: Units, isBPL: boolean): Promise<BillDetails>;
    getTotalUnitsConsumed(user: UserId): Promise<Units>;
    getUserConsumptionRecords(): Promise<Array<ConsumptionRecord>>;
    getUserConsumptionSummary(): Promise<{
        records: Array<ConsumptionRecord>;
        totalUnits: Units;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(profile: UserProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedTestConsumptionData(): Promise<void>;
}
