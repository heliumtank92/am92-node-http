import http from 'http'
import DEBUG from './DEBUG.mjs'

const LogInterceptor = {
  request: [requestSuccess, requestError],
  response: [responseSuccess, responseError]
}

export default LogInterceptor

function requestSuccess (config) {
  config.timestamp = new Date().getTime()
  process.setImmediate(() => _logRequest(config))
  return config
}

function requestError (error) {
  process.setImmediate(() => _logRequestError(error))
  throw error
}

function responseSuccess (response) {
  response.now = new Date().getTime()
  process.setImmediate(() => _logResponse(response))
  return response
}

function responseError (error) {
  error.now = new Date().getTime()
  const { response } = error
  if (response) {
    process.setImmediate(() => _logResponseError(error))
  } else {
    process.setImmediate(() => _logRequestError(error))
  }
  throw error
}

function _logRequest (config = {}) {
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

  const logFunc = console.httpInfo || console.info
  logFunc(logObject)

  if (!axiosRetry && DEBUG.enableDevLogs) {
    const devLogObj = { url, method, data }
    console.debug('Dev: [NodeHttpRequest]', devLogObj)
  }
}

function _logResponse (response) {
  const {
    status: statusCode,
    headers = {},
    data = {},
    config = {},
    now
  } = response

  const { method = '', url = '', disableBodyLog, timestamp } = config
  const status = http.STATUS_CODES[statusCode]

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

  const logFunc = console.httpSuccess || console.info
  logFunc(logObject)

  if (DEBUG.enableDevLogs) {
    const devLogObj = { statusCode, status, data }
    const logFunc = console.success || console.debug
    logFunc('Dev: [NodeHttpResponse]', devLogObj)
  }
}

function _logRequestError (error = {}) {
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

  const logFunc = console.httpError || console.error
  logFunc(logObject)
}

function _logResponseError (error) {
  const {
    config = {},
    response = {},
    now
  } = error

  const {
    status: statusCode,
    headers = {},
    data = {}
  } = response

  const { method = '', url = '', disableBodyLog, timestamp } = config
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
      responseTime: now - timestamp
    }
  }

  const logFunc = console.httpError || console.error
  logFunc(logObject)

  if (DEBUG.enableDevLogs) {
    const devLogObj = { statusCode, status, data }
    console.error('Dev: [NodeHttpResponseError]', devLogObj)
  }
}
