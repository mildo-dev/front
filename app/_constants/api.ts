export const AXIOS_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const END_POINTS = {
  TOKEN_INFO: '/tokens',
  TOKEN_REFRESH: '/tokens/refresh',
  TEST: '/test',
  LOGOUT: '/logout',
  USER_INFO: (memberId: string) => `/user/${memberId}/info`,
};

export const NETWORK = {
  RETRY_COUNT: 2,
  TIMEOUT: 10000,
} as const;

export const HTTP_STATUS_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONTENT_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ACCESS_TOKEN_KEY = 'mildo-session';
