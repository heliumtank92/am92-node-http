import http from 'http'
import logger, { httpLogger } from '@am92/api-logger'
import DEBUG from './DEBUG.mjs'

const LogInterceptor = {
  request: [requestSuccess, requestError],
  response: [responseSuccess, responseError]
}

export default LogInterceptor

function requestSuccess (config) {
  _logRequest(config)

  // To Generate TimeStamp
  config.timestamp = new Date().getTime()
  return config
}

function requestError (error) {
  _logRequestError(error)
  throw error
}

function responseSuccess (response) {
  _logResponse(response)
  return response
}

function responseError (error) {
  const { response } = error
  if (response) {
    _logResponseError(error)
  } else {
    _logRequestError(error)
  }
  throw error
}

async function _logRequest (config = {}) {
  const {
    url = '',
    method = '',
    headers = {},
    data = {},
    disableBodyLog
  } = config

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
      headers,
      body: (!disableBodyLog && data) || ''
    }
  }

  httpLogger.trace(logObject)

  if (!axiosRetry && DEBUG.enableDevLogs) {
    const devLogObj = { url, method, data }
    logger.debug('Dev: [NodeHttpRequest]', JSON.stringify(devLogObj, null, 2))
  }
}

async function _logResponse (response) {
  const {
    status: statusCode,
    headers = {},
    data = {},
    config = {}
  } = response

  const { method = '', url = '', disableBodyLog, timestamp } = config
  const status = http.STATUS_CODES[statusCode]
  const now = new Date().getTime()

  const msg = `[NodeHttpResponse] | ${method} ${url} | ${statusCode} ${status}`
  const logObject = {
    type: 'NODE_HTTP',
    message: msg,
    res: {
      statusCode,
      status,
      headers,
      body: (!disableBodyLog && data) || '',
      responseMessage: '',
      responseTime: now - timestamp
    }
  }

  httpLogger.success(logObject)

  if (DEBUG.enableDevLogs) {
    const devLogObj = { statusCode, status, data }
    logger.success('Dev: [NodeHttpResponse]', JSON.stringify(devLogObj, null, 2))
  }
}

async function _logRequestError (error = {}) {
  const { message = '', config = {} } = error
  const {
    url = '',
    method = '',
    headers = {},
    data,
    disableBodyLog
  } = config

  const msg = `[NodeHttpRequestError] ${method} ${url} | ${message}`
  const logObject = {
    type: 'NODE_HTTP',
    message: msg,
    req: {
      httpVersion: '',
      ipAddress: '',
      url,
      method,
      headers,
      body: (!disableBodyLog && data) || ''
    }
  }

  httpLogger.error(logObject)
}

async function _logResponseError (error) {
  const {
    config = {},
    response = {}
  } = error

  const {
    status: statusCode,
    headers = {},
    data = {}
  } = response

  const { method = '', url = '', disableBodyLog } = config
  const status = http.STATUS_CODES[statusCode]

  const msg = `[NodeHttpResponseError] | ${method} ${url} | ${statusCode} ${status}`
  const logObject = {
    type: 'NODE_HTTP',
    message: msg,
    res: {
      statusCode,
      status,
      headers,
      body: (!disableBodyLog && data) || '',
      responseMessage: '',
      responseTime: -1 // TODO: Handle Request Time Setting
    }
  }

  httpLogger.error(logObject)

  if (DEBUG.enableDevLogs) {
    const devLogObj = { statusCode, status, data }
    logger.error('Dev: [NodeHttpResponseError]', JSON.stringify(devLogObj, null, 2))
  }
}
