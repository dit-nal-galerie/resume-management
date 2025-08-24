// src/features/users/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersKeys } from './queryKeys';
import * as api from '@/shared/api/queries';

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.login,
    onSuccess: () => {
      // Profil neu laden
      qc.invalidateQueries({ queryKey: usersKeys.profile() });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.profile() });
    },
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: usersKeys.profile(),
    queryFn: api.getUserProfile,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateUserData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateUserData,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.profile() });
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: api.requestPasswordReset,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: api.resetPassword,
  });
}

export function useValidateToken(token: string, enabled = true) {
  return useQuery({
    queryKey: [...usersKeys.all, 'validateToken', token] as const,
    queryFn: () => api.validateToken(token),
    enabled,
    staleTime: 0,
  });
}

export function useUpdateAccessData() {
  return useMutation({
    mutationFn: api.updateAccessData,
  });
}

export function useUserAnredeAndName() {
  return useQuery({
    queryKey: usersKeys.anredeName(),
    queryFn: api.getUserAnredeAndName,
    staleTime: 1000 * 60 * 10,
  });
}
