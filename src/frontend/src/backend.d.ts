import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Transaction {
    id: bigint;
    status: string;
    timestamp: Time;
    senderName: string;
    upiId: string;
    amount: bigint;
}
export interface backendInterface {
    addTransaction(amount: bigint, upiId: string, senderName: string, status: string): Promise<bigint>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getTodaysSummary(): Promise<{
        totalAmount: bigint;
        transactionCount: bigint;
    }>;
    seedDemoTransactions(): Promise<void>;
}
