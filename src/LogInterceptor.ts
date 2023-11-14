import http from 'http'
import DEBUG from './DEBUG'
import { NodeHttpRequestConfig, NodeHttpResponse, ResponseLog } from './TYPES'
import { NODE_HTTP_CONTEXT } from './CONSTANTS'

/** @ignore */
const LogInterceptor = {
  request: [requestSuccess, requestError],
  response: [responseSuccess, responseError]
}

export default LogInterceptor

/** @ignore */
function requestSuccess(config: NodeHttpRequestConfig): NodeHttpRequestConfig {
  const { nodeHttpConfig, nodeHttpContext } = config
  if (nodeHttpConfig.disableLog) {
    return config
  }

  nodeHttpContext.set(NODE_HTTP_CONTEXT.REQ_TS, new Date().getTime())
  _logRequest(config)
  return config
}

/** @ignore */
function requestError(error: any): any {
  const { nodeHttpConfig } = error.config || {}
  if (nodeHttpConfig.disableLog) {
    throw error
  }

  _logRequestError(error)
  throw error
}

/** @ignore */
function responseSuccess(response: NodeHttpResponse): NodeHttpResponse {
  const { config } = response
  const { nodeHttpConfig, nodeHttpContext } = config
  if (nodeHttpConfig.disableLog) {
    return response
  }

  nodeHttpContext.set(NODE_HTTP_CONTEXT.RES_TS, new Date().getTime())
  _logResponse(response)
  return response
}

/** @ignore */
function responseError(error: any): any {
  const { response, config } = error
  const { nodeHttpConfig, nodeHttpContext } = config
  if (nodeHttpConfig.disableLog) {
    throw error
  }

  nodeHttpContext.set(NODE_HTTP_CONTEXT.RES_TS, new Date().getTime())

  if (response) {
    _logResponseError(error)
  } else {
    _logRequestError(error)
  }
  throw error
}

/** @ignore */
function _logRequest(config: NodeHttpRequestConfig): void {
  const {
    url = '',
    method = '',
    headers = {},
    data = {},
    nodeHttpConfig
  } = config
  const { disableBodyLog } = nodeHttpConfig

  const axiosRetry = config['axios-retry']

  const message = `[NodeHttpRequest] ${method} ${url}`
  const logObject = {
    type: 'NODE_HTTP',
    message,
    req: {
      httpVersion: '',
      ipAddress: '',
      url,
      method,
      headers: { ...headers },
      body: (!disableBodyLog && data) || ''
    }
  }

  const logFunc = console.httpInfo || console.info
  logFunc(logObject)

  if (!axiosRetry && DEBUG.enableDevLogs) {
    const devLogObj = { url, method, data }
    console.debug('Dev: [NodeHttpRequest]', devLogObj)
  }
}

/** @ignore */
function _logResponse(response: NodeHttpResponse): void {
  const { status: statusCode, headers = {}, data = {}, config } = response

  const {
    method = '',
    url = '',
    nodeHttpConfig,
    nodeHttpContext
  } = config || {}
  const { disableBodyLog } = nodeHttpConfig
  const status = http.STATUS_CODES[statusCode]

  const msg = `[NodeHttpResponse] | ${method} ${url} | ${statusCode} ${status}`

  const resTime = nodeHttpContext.get(NODE_HTTP_CONTEXT.RES_TS)
  const reqTime = nodeHttpContext.get(NODE_HTTP_CONTEXT.REQ_TS)
  const responseTime = resTime - reqTime
  const logObject = {
    type: 'NODE_HTTP',
    message: msg,
    res: {
      statusCode,
      status,
      headers: { ...headers },
      body: (!disableBodyLog && data) || '',
      responseMessage: '',
      responseTime
    }
  }

  const logFunc = console.httpSuccess || console.info
  logFunc(logObject)

  if (DEBUG.enableDevLogs) {
    const devLogObj = { statusCode, status, data }
    const logFunc = console.success || console.debug
    logFunc('Dev: [NodeHttpResponse]', devLogObj)
  }
}

/** @ignore */
function _logRequestError(error: any): void {
  const { message = '', config = {} } = error
  const {
    url = '',
    method = '',
    headers = {},
    data,
    nodeHttpConfig
  } = config as NodeHttpRequestConfig
  const { disableBodyLog } = nodeHttpConfig

  const msg = `[NodeHttpRequestError] ${method} ${url} | ${message}`
  const logObject = {
    type: 'NODE_HTTP',
    message: msg,
    req: {
      httpVersion: '',
      ipAddress: '',
      url,
      method,
      headers: { ...headers },
      body: (!disableBodyLog && data) || ''
    }
  }

  const logFunc = console.httpError || console.error
  logFunc(logObject)
}

/** @ignore */
function _logResponseError(error: any): void {
  const { config = {}, response = {} } = error

  const {
    status: statusCode,
    headers = {},
    data = {}
  } = response as NodeHttpResponse

  const {
    method = '',
    url = '',
    nodeHttpConfig,
    nodeHttpContext
  } = config as NodeHttpRequestConfig

  const { disableBodyLog } = nodeHttpConfig
  const status = http.STATUS_CODES[statusCode] || ''

  const msg = `[NodeHttpResponseError] | ${method} ${url} | ${statusCode} ${status}`
  const resTime = nodeHttpContext.get(NODE_HTTP_CONTEXT.RES_TS)
  const reqTime = nodeHttpContext.get(NODE_HTTP_CONTEXT.REQ_TS)
  const responseTime = resTime - reqTime
  const logObject: ResponseLog = {
    type: 'NODE_HTTP',
    message: msg,
    res: {
      statusCode,
      status,
      headers: { ...headers },
      body: (!disableBodyLog && data) || '',
      responseMessage: '',
      responseTime
    }
  }

  const logFunc = console.httpError || console.error
  logFunc(logObject)

  if (DEBUG.enableDevLogs) {
    const devLogObj = { statusCode, status, data }
    console.error('Dev: [NodeHttpResponseError]', devLogObj)
  }
}
