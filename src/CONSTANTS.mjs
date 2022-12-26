import axiosRetry from 'axios-retry'

const AXIOS_RETRY = {
  retryDelay: axiosRetry.exponentialDelay
}

export {
  AXIOS_RETRY
}
