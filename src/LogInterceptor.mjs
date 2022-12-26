const LogInterceptor = {
  requestSuccess,
  requestError,
  responseSuccess,
  responseError
}

export default LogInterceptor

const logger = {}

function requestSuccess (config) {
  const logObject = _buildRequestLogMeta(config)
  logger.trace(logObject)
  return config
}

function requestError (error) {
  const logObject = _buildRequestLogMeta(error)
  logger.error(logObject)
  throw error
}

function responseSuccess (response) {
  const logObject = _buildResponseLogMeta(response)
  logger.trace(logObject)
  return response
}

function responseError (error) {
  const logObject = _buildResponseLogMeta(error)
  logger.error(logObject)
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
    status = 500,
    statusText = '',
    headers = {},
    data = {},
    request = {}
  } = response
  const { method = '', url = '' } = request

  const message = `[NodeHttp|Response] | ${method} ${url} | ${status} ${statusText}`
  const logObject = {
    type: 'NODE_HTTP',
    message,
    res: {
      statusCode: status,
      status: statusText,
      headers: JSON.stringify(headers),
      body: JSON.stringify(data),
      responseMessage: '',
      responseTime: -1 // TODO: Handle Request Time Setting
    }
  }

  return logObject
}
