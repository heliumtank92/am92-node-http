import http from 'http'

// TODO: Change import from api-logger pacakge when published
const ApiLogger = {
  error: () => undefined,
  trace: () => undefined
}

const LogInterceptor = {
  request: [requestSuccess, requestError, { synchronous: true }],
  response: [responseSuccess, responseError, { synchronous: true }]
}

export default LogInterceptor

function requestSuccess (config) {
  const logObject = _buildRequestLogMeta(config)
  ApiLogger.trace(logObject)
  return config
}

function requestError (error) {
  const logObject = _buildRequestLogMeta(error)
  ApiLogger.error(logObject)
  throw error
}

function responseSuccess (response) {
  const logObject = _buildResponseLogMeta(response)
  ApiLogger.trace(logObject)
  return response
}

function responseError (error) {
  const logObject = _buildResponseLogMeta(error)
  ApiLogger.error(logObject)
  throw error
}

function _buildRequestLogMeta (config = {}) {
  const {
    url = '',
    method = '',
    headers = {},
    data = {}
  } = config

  const message = `[NodeHttp|Request] ${method} ${url}`
  const logObject = {
    type: 'NODE_HTTP',
    message,
    req: {
      httpVersion: '',
      ipAddress: '',
      url,
      method,
      headers: JSON.stringify(headers),
      body: JSON.stringify(data)
    }
  }

  return logObject
}

function _buildResponseLogMeta (response) {
  const {
    message,
    status: statusCode = 500,
    headers = {},
    data = {},
    config = {}
  } = response

  const { method = '', url = '' } = config
  const status = http.STATUS_CODES[statusCode]

  const msg = `[NodeHttp|Response] | ${method} ${url} | ${statusCode} ${status} | ${message}`
  const logObject = {
    type: 'NODE_HTTP',
    message: msg,
    res: {
      statusCode,
      status,
      headers: JSON.stringify(headers),
      body: JSON.stringify(data),
      responseMessage: '',
      responseTime: -1 // TODO: Handle Request Time Setting
    }
  }

  return logObject
}
