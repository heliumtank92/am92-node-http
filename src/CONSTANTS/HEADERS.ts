/**
 * Constant which has all default injectable request headers.
 */
export const NODE_HTTP_REQ_HEADERS = {
  SESSION_ID: 'x-session-id',
  REQUEST_ID: 'x-req-id',
  API_KEY: 'x-api-key',
  AUTH_TOKEN: 'x-authtoken',
  ACCESS_TOKEN: 'x-access-token',
  ENCRYPTION_KEY: 'x-api-encryption-key',
  CLIENT_ID: 'x-api-client-id'
} as const

/**
 * Constant which has all response headers which are read from API responses.
 */
export const NODE_HTTP_RES_HEADERS = {
  AUTH_TOKEN: 'x-authtoken',
  ACCESS_TOKEN: 'x-access-token',
  REFRESH_TOKEN: 'x-refresh-token'
} as const
