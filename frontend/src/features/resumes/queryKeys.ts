// src/features/resumes/queryKeys.ts
export const resumesKeys = {
  all: ['resumes'] as const,
  list: () => [...resumesKeys.all, 'list'] as const,
  byId: (resumeId: number, refId: number) => [...resumesKeys.all, 'byId', resumeId, refId] as const,
  history: (resumeId: number, refId: number) =>
    [...resumesKeys.all, 'history', resumeId, refId] as const,
  companies: (isRecruter: boolean) => [...resumesKeys.all, 'companies', isRecruter] as const,
  contacts: (refId: number, companyId: number) =>
    [...resumesKeys.all, 'contacts', refId, companyId] as const,
};
