// src/features/users/queryKeys.ts
export const usersKeys = {
  all: ['users'] as const,
  profile: () => [...usersKeys.all, 'profile'] as const,
  anredeName: () => [...usersKeys.all, 'anredeName'] as const,
};
