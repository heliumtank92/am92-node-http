import http from 'http'
import logger, { httpLogger } from '../../../ApiLogger/am92-api-logger/src/logger.mjs'

// TODO: Change import from api-logger pacakge when published
// const httpLogger = {
//   error: () => undefined,
//   trace: () => undefined
// }
const isProduction = process.env.NODE_ENV === 'production'

const LogInterceptor = {
  request: [requestSuccess, requestError, { synchronous: true }],
  response: [responseSuccess, responseError, { synchronous: true }]
}

export default LogInterceptor

function requestSuccess (config) {
  _logRequest(config)
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
    diableBodyLog
  } = config

  const axiosRetry = config['axios-retry']

  const message = `[NodeHttp|Request] ${method} ${url}`
  const logObject = {
    type: 'NODE_HTTP',
    message,
    req: {
      httpVersion: '',
      ipAddress: '',
      url,
      method,
      headers,
      body: (!diableBodyLog && data) || ''
    }
  }

  httpLogger.trace(logObject)

  if (!isProduction && !axiosRetry) {
    const devLogObj = { url, method, headers, data }
    logger.debug('Dev: [NodeHttp|Request]', JSON.stringify(devLogObj, null, 2))
  }
}

async function _logResponse (response, logLevel) {
  const {
    status: statusCode,
    headers = {},
    data = {},
    config = {}
  } = response

  const { method = '', url = '', diableBodyLog } = config
  const status = http.STATUS_CODES[statusCode]

  const label = logLevel === 'error' ? '[NodeHttp|ResponseError]' : '[NodeHttp|Response]'
  const msg = `${label} | ${method} ${url} | ${statusCode} ${status}`
  const logObject = {
    type: 'NODE_HTTP',
    message: msg,
    res: {
      statusCode,
      status,
      headers,
      body: (!diableBodyLog && data) || '',
      responseMessage: '',
      responseTime: -1 // TODO: Handle Request Time Setting
    }
  }

  httpLogger.success(logObject)

  if (!isProduction) {
    const devLogObj = { statusCode, status, headers, data }
    logger.debug('Dev: [NodeHttp|Response]', JSON.stringify(devLogObj, null, 2))
  }
}

async function _logRequestError (error = {}) {
  const { message = '', config = {} } = error
  const {
    url = '',
    method = '',
    headers = {},
    data,
    diableBodyLog
  } = config

  const msg = `[NodeHttp|RequestError] ${method} ${url} | ${message}`
  const logObject = {
    type: 'NODE_HTTP',
    message: msg,
    req: {
      httpVersion: '',
      ipAddress: '',
      url,
      method,
      headers,
      body: (!diableBodyLog && data) || ''
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

  const { method = '', url = '', diableBodyLog } = config
  const status = http.STATUS_CODES[statusCode]

  const msg = `[NodeHttp|ResponseError] | ${method} ${url} | ${statusCode} ${status}`
  const logObject = {
    type: 'NODE_HTTP',
    message: msg,
    res: {
      statusCode,
      status,
      headers,
      body: (!diableBodyLog && data) || '',
      responseMessage: '',
      responseTime: -1 // TODO: Handle Request Time Setting
    }
  }

  httpLogger.error(logObject)

  if (!isProduction) {
    const devLogObj = { statusCode, status, headers, data }
    logger.debug('Dev: [NodeHttp|ResponseError]', JSON.stringify(devLogObj, null, 2))
  }
}
