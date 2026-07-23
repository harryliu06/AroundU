import AsyncStorage from '@react-native-async-storage/async-storage'

const DISCOVERY_RADIUS_KEY = 'aroundu.discoveryRadiusMiles'
export const DEFAULT_DISCOVERY_RADIUS_MILES = 3

export async function getDiscoveryRadiusMiles() {
  const storedRadius = await AsyncStorage.getItem(DISCOVERY_RADIUS_KEY)
  const radius = Number(storedRadius)

  if (!Number.isFinite(radius) || radius < 1 || radius > 25) {
    return DEFAULT_DISCOVERY_RADIUS_MILES
  }

  return radius
}

export async function saveDiscoveryRadiusMiles(radius: number) {
  const safeRadius = Math.min(25, Math.max(1, Math.round(radius)))
  await AsyncStorage.setItem(DISCOVERY_RADIUS_KEY, String(safeRadius))
  return safeRadius
}
