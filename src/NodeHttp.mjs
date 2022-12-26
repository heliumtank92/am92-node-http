import axios from 'axios'
import axiosRetry from 'axios-retry'
import Interceptors from './Interceptors/index.mjs'
import NodeHttpError from './NodeHttpError.mjs'
import { AXIOS_RETRY } from './CONSTANTS.mjs'

export default class NodeHttp {
  constructor (config = {}) {
    // Configurations
    const { axiosConfig = {}, axiosRetryConfig = {} } = config
    const axiosRetryConf = { ...AXIOS_RETRY, ...axiosRetryConfig }

    // Create Axios Instance & Attach Axios Retry
    this.client = axios.create(axiosConfig)
    axiosRetry(this.client, axiosRetryConf)

    // Use Request & Response Interceptors to Axios Client
    this.useRequestInterceptor = this.client.interceptors.request.use
    this.useResponseInterceptor = this.client.interceptors.response.use

    // Eject Request & Response Interceptors to Axios Client
    this.ejectRequestInterceptor = this.client.interceptors.request.eject
    this.ejectResponseInterceptor = this.client.interceptors.response.eject

    // Use Default Interceptors
    this.#useDefaultInterceptors()

    // Bind Functions
    this.request = this.request.bind(this)
  }

  #useDefaultInterceptors () {
    Interceptors.forEach(interceptor => {
      if (interceptor.request) {
        this.useRequestInterceptor(...interceptor.request)
      }

      if (interceptor.response) {
        this.useResponseInterceptor(...interceptor.response)
      }
    })
  }

  async request (options = {}) {
    try {
      const response = await this.client.request(options)
      return response
    } catch (error) {
      throw new NodeHttpError(error)
    }
  }
}
