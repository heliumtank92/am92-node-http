import {
  AxiosError,
  AxiosInterceptorManager,
  AxiosInterceptorOptions,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
  Method
} from 'axios'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'
import { NODE_HTTP_CONTEXT } from './CONSTANTS'

/** @ignore */
export type Debug = { enableDevLogs: boolean }

/** @ignore */
export type DebugKeys = keyof Debug

export { AxiosError }

/**
 * Interface for NodeHttpContext Map.
 *
 * @typedef {NodeHttpContext}
 */
export type NodeHttpContext = Map<keyof typeof NODE_HTTP_CONTEXT, any>

/**
 * Interface for axios and axios-retry config to be taken to instantiate NodeHttp.
 *
 * @interface
 * @typedef {NodeHttpAxiosConfig}
 * @extends {CreateAxiosDefaults}
 * @extends {IAxiosRetryConfig}
 */
export interface NodeHttpAxiosConfig
  extends CreateAxiosDefaults,
    IAxiosRetryConfig {}

/**
 * Default NodeHttpAxiosConfig for NodeHttp instance.
 */
export const DefaultNodeHttpAxiosConfig: NodeHttpAxiosConfig = {
  retryDelay: axiosRetry.exponentialDelay,
  retries: 0
}

/**
 * Type defination for NodeHttpConfig.
 *
 * @typedef {NodeHttpConfig}
 */
export interface NodeHttpConfig {
  /**
   * Disable generated Request and Response logs
   */
  disableLog: boolean
  /**
   * Omit `body` key from the generated Request and Response logs
   */
  disableBodyLog: boolean
}

/**
 * Default NodeHttpConfig for NodeHttp instance.
 */
export const DefaultNodeHttpConfig: NodeHttpConfig = {
  disableLog: false,
  disableBodyLog: false
}

/**
 * Interface for axios's InternalAxiosRequestConfig.
 *
 * @interface
 * @typedef {NodeHttpRequestConfig}
 * @extends {InternalAxiosRequestConfig}
 */
export interface NodeHttpRequestConfig extends InternalAxiosRequestConfig {}

/**
 * Interface for request function options parameter.
 *
 * @interface
 * @typedef {NodeHttpRequestOptions}
 * @extends {Omit<AxiosRequestConfig, 'url' | 'method' | 'nodeHttpConfig' | 'nodeHttpContext'>}
 */
export interface NodeHttpRequestOptions
  extends Omit<
    AxiosRequestConfig,
    'url' | 'method' | 'nodeHttpConfig' | 'nodeHttpContext'
  > {
  /**
   * URL string on which API request is to be made.
   */
  url: string
  /**
   * HTTP Method to be used which making the API request.
   */
  urlParams?: { [K: string]: string | number | boolean | undefined }
  /**
   * HTTP Method to be used which making the API request.
   */
  method: Method | string
  /**
   * NodeHttpConfig to be used exclusively for the given API request.
   */
  nodeHttpConfig?: NodeHttpConfig
}

/**
 * Interface for axios's AxiosResponse.
 *
 * @interface
 * @typedef {NodeHttpResponse}
 * @extends {Omit<AxiosResponse, 'config'>}
 */
export interface NodeHttpResponse extends Omit<AxiosResponse, 'config'> {
  /**
   * Overriding 'config' property of AxiosResponse
   */
  config: NodeHttpRequestConfig
}

/**
 * Interface for axios's AxiosError.
 *
 * @interface
 * @typedef {NodeHttpAxiosError}
 * @extends {Omit<AxiosError, 'config' | 'response'>}
 */
export interface NodeHttpAxiosError
  extends Omit<AxiosError, 'config' | 'response'> {
  /**
   * Overriding 'config' property of AxiosError
   */
  config: NodeHttpRequestConfig
  /**
   * Overriding 'response' property of AxiosError
   */
  response: NodeHttpResponse
}

/**
 * Type defination for error map to be passed to NodeHttpError.
 *
 * @interface
 * @typedef {NodeHttpErrorMap}
 */
export interface NodeHttpErrorMap {
  /**
   * Overriding message string for JoseCryptoError instance
   */
  message?: string
  /**
   * Overriding error code string for JoseCryptoError instance
   */
  errorCode?: string
  /**
   * Overriding HTTP status code for JoseCryptoError instance
   */
  statusCode?: number
}

/**
 * Interface for `NodeHttp.interceptors`
 *
 * @interface
 * @typedef {NodeHttpAxiosInterceptors}
 */
export interface NodeHttpAxiosInterceptors {
  /**
   * Request interceptor manager
   */
  request: AxiosInterceptorManager<NodeHttpRequestConfig>
  /**
   * Response interceptor manager
   */
  response: AxiosInterceptorManager<NodeHttpResponse>
}

declare module 'axios' {
  /** @ignore */
  interface InternalAxiosRequestConfig {
    nodeHttpConfig: NodeHttpConfig
    nodeHttpContext: NodeHttpContext
  }
}

/** @ignore */
export type RequestLog = {
  type: 'NODE_HTTP'
  message: string
  req: {
    httpVersion: string
    ipAddress: string
    url: string
    method: string
    headers: any
    body: any
  }
}

/** @ignore */
export type ResponseLog = {
  type: 'NODE_HTTP'
  message: string
  res: {
    statusCode: number
    status: string
    headers: any
    body: any
    responseMessage: string
    responseTime: number
  }
}

declare global {
  /** @ignore */
  interface Console {
    success?(...data: any[]): void
    fatal?(...data: any[]): void
    httpError?(data: RequestLog | ResponseLog): void
    httpSuccess?(data: RequestLog | ResponseLog): void
    httpInfo?(data: RequestLog | ResponseLog): void
  }
}
