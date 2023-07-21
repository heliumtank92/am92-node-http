import { SERVICE } from './CONFIG'
import { NodeHttpErrorMap } from './TYPES'

/** @ignore */
const DEFAULT_ERROR_MSG = 'Node Http Error'
/** @ignore */
const DEFAULT_ERROR_STATUS_CODE = 500
/** @ignore */
const DEFAULT_ERROR_CODE = 'NodeHttpError::UNKWON'

/**
 * Error class whose instance is thrown in case of any error.
 *
 * @class
 * @typedef {NodeHttpError}
 * @extends {Error}
 */
export class NodeHttpError extends Error {
  /**
   * Flag to identify if error is a custom error.
   */
  readonly _isCustomError = true
  /**
   * Flag to identoify if error is a NodeHttpError.
   */
  readonly _isNodeHttpError = true
  /**
   * Service Name from where the error was generated.
   */
  readonly service = SERVICE
  /**
   * API Error's message string.
   */
  message: string
  /**
   * API Error's HTTP status code.
   */
  statusCode: number
  /**
   * API Error's error code as sent by backend.
   */
  errorCode: string
  /**
   * API Error's error code as sent by backend.
   */
  code?: string
  /**
   * API Error's data object if sent with error.
   */
  data?: any
  /**
   * API Error's error object.
   */
  error?: any

  /**
   * Creates an instance of NodeHttpError.
   *
   * @constructor
   * @param [e] AxiosError instance or error object from response body to wrap with NodeHttpError.
   * @param [eMap] NodeHttpErrorMap to rewrap error for better understanding.
   */
  constructor(e?: any, eMap?: NodeHttpErrorMap) {
    super()

    this.message = eMap?.message || e?.message || e?.msg || DEFAULT_ERROR_MSG
    this.statusCode =
      eMap?.statusCode || e?.statusCode || DEFAULT_ERROR_STATUS_CODE
    this.errorCode =
      eMap?.errorCode || e?.code || e?.errorCode || DEFAULT_ERROR_CODE
    this.error = e?.error || e
    this.data = e?.data || undefined
  }
}
