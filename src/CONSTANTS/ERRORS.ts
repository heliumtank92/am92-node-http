import { NodeHttpErrorMap } from '../TYPES'

export const DEFAULT_REQUEST_ERROR: NodeHttpErrorMap = {
  statusCode: 500,
  errorCode: 'NODE_HTTP::REQUEST'
}
