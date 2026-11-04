export type GetConversationsQuery = Readonly<{
  page: number;
  size: number;
}>;

export const createGetConversationsQuery = (
  page: number = 0,
  size: number = 20,
): GetConversationsQuery => {
  if (!Number.isInteger(page) || page < 0) {
    throw new Error('Page number must be a non-negative integer');
  }
  if (!Number.isInteger(size) || size < 1 || size > 50) {
    throw new Error('Page size must be between 1 and 50');
  }
  return Object.freeze({ page, size });
};
