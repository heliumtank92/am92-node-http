import axios from 'axios'
import axiosRetry from 'axios-retry'
import LogInterceptor from './LogInterceptor.mjs'
import NodeHttpError from './NodeHttpError.mjs'

export default class NodeHttp {
  constructor (config = {}) {
    const axiosConfig = {}
    const axiosRetryConfig = {}

    // Create Axios Instance
    const client = axios.create(axiosConfig)

    // Attach Axios Retry
    axiosRetry(client, axiosRetryConfig)

    this.client = client

    // Attach Default Interceptors
    this.#attachDefaultInterCeptors()

    // Bind Functions
    this.request = this.request.bind(this)

    // Attach Request & Response Interceptors to Axios Client
    this.attachRequestInterceptors = this.client.interceptors.request.use
    this.attachResponseInterceptors = this.client.interceptors.response.use

    // Eject Request & Response Interceptors to Axios Client
    this.ejectRequestInterceptors = this.client.interceptors.request.eject
    this.ejectResponseInterceptors = this.client.interceptors.response.eject
  }

  #attachDefaultInterCeptors (config = {}) {
    const { logger = {} } = config
    // Attach Log Request Interceptors
    const requestSuccess = LogInterceptor.requestSuccess(logger)
    const requestError = LogInterceptor.requestError(logger)
    this.attachRequestInterceptors(requestSuccess, requestError, { synchronous: true })

    // Attach Log Response Interceptors
    const responseSuccess = LogInterceptor.responseSuccess(logger)
    const responseError = LogInterceptor.responseError(logger)
    this.attachResponseInterceptors(responseSuccess, responseError, { synchronous: true })
  }

  async request (options = {}) {
    try {
      const response = await axios.request(options)
      return response
    } catch (e) {
      const { request, response } = e

      // Handle Axios Response Error
      if (response) {
        const { status = 500, statusText, data: body } = response
        const { statusCode, message, data, error } = body

        const err = error || body
        const eMap = {
          statusCode: statusCode || status,
          message: message || statusText,
          errorCode: 'NODE_HTTP::RESPONSE',
          data
        }
        throw new NodeHttpError(err, eMap)
      }

      // Handle Axios Request Error
      if (request) {
        const eMap = {
          message: e.message,
          errorCode: 'NODE_HTTP::REQUEST'
        }
        throw new NodeHttpError(e.request, eMap)
      }

      // Handle any other form of error
      const eMap = { errorCode: 'NODE_HTTP::UNKWON' }
      throw new NodeHttpError(e, eMap)
    }
  }
}
