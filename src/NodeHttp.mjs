import axios from 'axios'
import axiosRetry from 'axios-retry'
import LogInterceptor from './LogInterceptor.mjs'
import NodeHttpError from './NodeHttpError.mjs'

const DEFAULT_CONFIG = {
  retryDelay: axiosRetry.exponentialDelay
}

export default class NodeHttp {
  constructor (CONFIG = {}) {
    // Configurations
    const config = { ...DEFAULT_CONFIG, ...CONFIG }
    console.log('config', config)

    // Create Axios Instance & Attach Axios Retry
    this.client = axios.create(config)
    axiosRetry(this.client, config)

    // Use Request & Response Interceptors to Axios Client
    this.useRequestInterceptor = this.useRequestInterceptor.bind(this)
    this.useResponseInterceptor = this.useResponseInterceptor.bind(this)

    // Eject Request & Response Interceptors to Axios Client
    this.ejectRequestInterceptor = this.ejectRequestInterceptor.bind(this)
    this.ejectResponseInterceptor = this.ejectResponseInterceptor.bind(this)

    // Use Default Interceptors
    this.#useDefaultInterceptors()

    // Bind Functions
    this.request = this.request.bind(this)
  }

  async request (options = {}) {
    try {
      const response = await this.client.request(options)
      return response
    } catch (error) {
      const { message, response, request, config } = error

      if (response) {
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

      if (request) {
        const eMap = {
          message,
          errorCode: 'NODE_HTTP::REQUEST'
        }

        throw new NodeHttpError(config, eMap)
      }

      throw new NodeHttpError(error)
    }
  }

  #useDefaultInterceptors () {
    this.useRequestInterceptor(LogInterceptor.request)
    this.useResponseInterceptor(LogInterceptor.response)
  }

  useRequestInterceptor (interceptor = []) {
    if (interceptor.length) {
      return this.client.interceptors.request.use(...interceptor)
    }
  }

  useResponseInterceptor (interceptor = []) {
    if (interceptor.length) {
      return this.client.interceptors.response.use(...interceptor)
    }
  }

  ejectRequestInterceptor (index) {
    this.client.interceptors.request.eject(index)
  }

  ejectResponseInterceptor (index) {
    this.client.interceptors.response.eject(index)
  }
}
