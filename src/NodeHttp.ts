import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { randomId } from '@am92/utils-string'

import { NodeHttpError } from './NodeHttpError'

import {
  DefaultNodeHttpAxiosConfig,
  DefaultNodeHttpConfig,
  NodeHttpContext,
  NodeHttpAxiosConfig,
  NodeHttpAxiosError,
  NodeHttpConfig,
  NodeHttpRequestOptions,
  NodeHttpResponse,
  NodeHttpAxiosInterceptors,
  NodeHttpErrorMap
} from './TYPES'

import { NODE_HTTP_CONTEXT, NODE_HTTP_REQ_HEADERS } from './CONSTANTS'
import LogInterceptor from './LogInterceptor'

import { DEFAULT_REQUEST_ERROR } from './CONSTANTS/ERRORS'

/**
 * HTTP Client Class.
 *
 * @class
 * @typedef {NodeHttp}
 */
export default class NodeHttp {
  /**
   * nodeHttpConfig initialized at NodeHttp instance level for all API requests.
   */
  nodeHttpConfig: NodeHttpConfig
  /**
   * NodeHttpContext instance associated with NodeHttp instance.
   */
  context: NodeHttpContext
  /**
   * Axios client associated with NodeHttp instance.
   */
  client: AxiosInstance
  /**
   * Axios interceptors attached to NodeHttp instance for easier use.
   */
  interceptors: NodeHttpAxiosInterceptors

  /**
   * Creates an instance of NodeHttp.
   *
   * @constructor
   * @param [nodeHttpAxiosConfig] axios and axios-retry config to be associated with the axios client. Defaults to {@link DefaultNodeHttpConfig}
   * @param [nodeHttpConfig] nodeHttpConfig to be initialized at NodeHttp instance level for all API requests. Defaults to {@link DefaultNodeHttpConfig}
   */
  constructor(
    nodeHttpAxiosConfig?: NodeHttpAxiosConfig,
    nodeHttpConfig?: NodeHttpConfig
  ) {
    // Configurations
    const config = { ...DefaultNodeHttpAxiosConfig, ...nodeHttpAxiosConfig }
    this.nodeHttpConfig = { ...DefaultNodeHttpConfig, ...nodeHttpConfig }

    // Create Axios Instance & Attach Axios Retry
    this.client = axios.create(config)
    axiosRetry(this.client, config)

    // NodeHttp Context for all request at session level
    this.context = new Map([
      [NODE_HTTP_CONTEXT.SESSION_ID, randomId(20)],
      [NODE_HTTP_CONTEXT.API_KEY, ''],
      [NODE_HTTP_CONTEXT.ACCESS_TOKEN, ''],
      [NODE_HTTP_CONTEXT.REFRESH_TOKEN, ''],
      [NODE_HTTP_CONTEXT.PUBLIC_KEY, ''],
      [NODE_HTTP_CONTEXT.CLIENT_ID, ''],
      [
        NODE_HTTP_CONTEXT.AUTHENTICATION_TOKEN_KEY,
        NODE_HTTP_REQ_HEADERS.ACCESS_TOKEN
      ]
    ])

    this.interceptors = this.client.interceptors

    // Use Default Interceptors
    this._useDefaultInterceptors()

    // Bind Functions
    this.request = this.request.bind(this)
  }

  /**
   * Method to make API call.
   *
   * @async
   * @param options Axios request options to define the API call.
   * @throws {NodeHttpError}
   * @returns
   */
  async request(options: NodeHttpRequestOptions): Promise<NodeHttpResponse> {
    const { nodeHttpConfig = {}, ...restOptions } = options
    const sanitizedOptions = this._sanitizeOptions(restOptions)

    const requestOptions = {
      ...sanitizedOptions,
      nodeHttpContext: this.context,
      nodeHttpConfig: {
        ...this.nodeHttpConfig,
        ...nodeHttpConfig
      }
    }

    const response: NodeHttpResponse = await this.client
      .request(requestOptions)
      .catch(async (e: NodeHttpAxiosError) => {
        const { request, response } = e
        // Handle Axios Response Error
        if (response) {
          const { status, statusText } = response
          const body: any = response.data as any
          const { statusCode, message, error, errorCode } = body || {}

          if (errorCode === 'ApiCrypto::PRIVATE_KEY_NOT_FOUND') {
            const { publicKey = '' } = error || {}
            this.context.set(NODE_HTTP_CONTEXT.PUBLIC_KEY, publicKey)
            return await this.request(options)
          }

          const eMap: NodeHttpErrorMap = {
            statusCode: statusCode || status,
            message: message || statusText,
            errorCode: errorCode || 'NodeHttp::RESPONSE'
          }
          throw new NodeHttpError(body, eMap)
        }

        // Handle Axios Request Error
        if (request) {
          throw new NodeHttpError(e, DEFAULT_REQUEST_ERROR)
        }

        // Handle any other form of error
        throw new NodeHttpError(e)
      })

    return response
  }

  /** @ignore */
  _useDefaultInterceptors() {
    const { disableLog } = this.nodeHttpConfig

    if (!disableLog) {
      if (LogInterceptor.request) {
        this.interceptors.request.use(...LogInterceptor.request)
      }
      if (LogInterceptor.response) {
        this.interceptors.response.use(...LogInterceptor.response)
      }
    }
  }

  /** @ignore */
  _sanitizeOptions(options: NodeHttpRequestOptions) {
    if (options.urlParams) {
      const urlParams = options.urlParams
      Object.keys(urlParams).forEach(param => {
        const value = urlParams[param]
        options.url = options.url.replace(`:${param}`, `${value}`)
      })
    }

    return options
  }
}
