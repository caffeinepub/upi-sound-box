import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useGetTodaysSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<{ totalAmount: bigint; transactionCount: bigint }>({
    queryKey: ["summary"],
    queryFn: async () => {
      if (!actor) return { totalAmount: 0n, transactionCount: 0n };
      return actor.getTodaysSummary();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      upiId,
      senderName,
    }: {
      amount: bigint;
      upiId: string;
      senderName: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addTransaction(amount, upiId, senderName, "SUCCESS");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useSeedDemo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.seedDemoTransactions();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}
