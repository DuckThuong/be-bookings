export const parsePageLimit = (
  page?: number,
  limit?: number,
): { page: number; limit: number } => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));
  return { page: p, limit: l };
};
