// src/features/dictionaries/queryKeys.ts
export const dictionariesKeys = {
  all: ['dictionaries'] as const,
  states: () => [...dictionariesKeys.all, 'states'] as const,
  anrede: () => [...dictionariesKeys.all, 'anrede'] as const,
};
