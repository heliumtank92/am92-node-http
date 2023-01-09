import { SERVICE } from './CONFIG.mjs'

const { DEBUG: debug } = process.env

const DEBUG_ID = 'nodeHttp'
const debugAll = debug === '*' || debug?.includes(`${DEBUG_ID}:*`)
const debugFeatures = new RegExp(`${DEBUG_ID}:([A-Za-z0-9,]*);?`).exec(debug)
const debugFeaturesList = (debugFeatures && debugFeatures[1]) || []

const DEBUG = {
  enableDevLogs: false
}

const DEBUG_ENABLED_FEATURES = []

const DEBUG_FEATURES = Object.keys(DEBUG)
for (const feature of DEBUG_FEATURES) {
  const debugFeature = debugFeaturesList.includes(feature)
  DEBUG[feature] = debugAll || debugFeature

  if (DEBUG[feature]) {
    DEBUG_ENABLED_FEATURES.push(feature)
  }
}

if (DEBUG_ENABLED_FEATURES.length) {
  console.warn((`[${SERVICE} NodeHttp] Debugging Features Enabled: ${DEBUG_ENABLED_FEATURES.join(', ')}`))
}

export default DEBUG
