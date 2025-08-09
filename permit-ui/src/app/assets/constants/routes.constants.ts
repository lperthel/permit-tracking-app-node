export const ROUTES = {
  NEW_PERMIT: '/new-permit',
  UPDATE: (id: string) => `/update/${id}`,
  ROOT_PAGE: '/',
} as const;
