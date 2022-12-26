import NodeHttpError from '../NodeHttpError.mjs'

const ErrorInterceptor = {
  request: [null, requestError, { synchronous: true }],
  response: [null, responseError, { synchronous: true }]
}

export default ErrorInterceptor

function requestError (error) {
  const { message, request } = error

  if (request) {
    const eMap = {
      message,
      errorCode: 'NODE_HTTP::REQUEST'
    }

    throw new NodeHttpError(request, eMap)
  }

  throw new NodeHttpError(error)
}

function responseError (error) {
  const { response } = error
  const { status = 500, data: body } = response
  const { statusCode, message, data, error: err } = body
  const e = err || body

  const eMap = {
    statusCode: statusCode || status,
    message: message || error.message,
    errorCode: 'NODE_HTTP::RESPONSE',
    data
  }

  throw new NodeHttpError(e, eMap)
}
