import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ConsumptionRecord, BillDetails } from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Consumption Records ───────────────────────────────────────────────────────

export function useGetUserConsumptionRecords() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ConsumptionRecord[]>({
    queryKey: ['consumptionRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserConsumptionRecords();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAddConsumptionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, unitsConsumed }: { date: bigint; unitsConsumed: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addConsumptionRecord(date, unitsConsumed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumptionRecords'] });
    },
  });
}

export function useSeedTestData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.seedTestConsumptionData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumptionRecords'] });
    },
  });
}

// ── Bill Estimation ───────────────────────────────────────────────────────────

export function useGetDetailedBillEstimate(units: bigint, isBPL: boolean) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BillDetails>({
    queryKey: ['billEstimate', units.toString(), isBPL],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDetailedBillEstimate(units, isBPL);
    },
    enabled: !!actor && !actorFetching && units > 0n,
  });
}

// ── Role Assignment ───────────────────────────────────────────────────────────

export function useAssignCallerUserRole() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ user, role }: { user: import('@dfinity/principal').Principal; role: import('../backend').UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
  });
}
