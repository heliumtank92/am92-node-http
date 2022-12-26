const DEFAULT_ERROR_MSG = 'Node Http Error'
const DEFAULT_ERROR_STATUS_CODE = 500
const DEFAULT_ERROR_CODE = 'NODE_HTTP_ERROR'

export default class NodeHttpError extends Error {
  constructor (e = {}, eMap) {
    if (e._isCustomError && !eMap) { return e }

    super()

    const { message, statusCode, errorCode, data } = eMap || {}
    const {
      message: eMessage,
      msg: eMsg,
      statusCode: eStatusCode,
      errorCode: eErrorCode = 'NODE_HTTP::UNKWON',
      code: eCode
    } = e

    const {
      npm_package_name: pkgName = '',
      npm_package_version: pkgVersion = ''
    } = process.env
    const service = `${pkgName}@${pkgVersion}`

    this._isCustomError = true
    this._isNodeHttpError = true
    this.service = service
    this.message = message || eMessage || eMsg || DEFAULT_ERROR_MSG
    this.statusCode = statusCode || eStatusCode || DEFAULT_ERROR_STATUS_CODE
    this.errorCode = errorCode || eErrorCode || eCode || DEFAULT_ERROR_CODE
    this.data = data
    this.error = {
      ...e,
      message: eMessage || this.message,
      errorCode: eErrorCode || this.errorCode
    }
  }
}
