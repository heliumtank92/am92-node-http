import { SERVICE } from './CONFIG'
import { Debug, DebugKeys } from './TYPES'

/** @ignore */
const { DEBUG: debug } = process.env

/** @ignore */
const DEBUG_ID = 'nodeHttp'

/** @ignore */
const debugAll = debug === '*' || debug?.includes(`${DEBUG_ID}:*`)

/** @ignore */
const debugFeatures = new RegExp(`${DEBUG_ID}:([A-Za-z0-9,]*);?`).exec(
  debug || ''
)

/** @ignore */
const debugFeaturesList =
  (debugFeatures && debugFeatures[1]) || ([] as string[])

/** @ignore */
const DEBUG: Debug = {
  enableDevLogs: false
}

/** @ignore */
const DEBUG_ENABLED_FEATURES: DebugKeys[] = []

/** @ignore */
const DEBUG_FEATURES = Object.keys(DEBUG) as DebugKeys[]

for (const feature of DEBUG_FEATURES) {
  const debugFeature = debugFeaturesList.includes(feature)
  DEBUG[feature] = debugAll || debugFeature

  if (DEBUG[feature]) {
    DEBUG_ENABLED_FEATURES.push(feature)
  }
}

if (DEBUG_ENABLED_FEATURES.length) {
  console.warn(
    `[${SERVICE} NodeHttp] Debugging Features Enabled: ${DEBUG_ENABLED_FEATURES.join(
      ', '
    )}`
  )
}

export default DEBUG
