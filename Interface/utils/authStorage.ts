import AsyncStorage from '@react-native-async-storage/async-storage'

const AUTH_TOKEN_KEY = 'aroundu.authToken'
const AUTH_USER_KEY = 'aroundu.authUser'

export type StoredUser = {
  id: string
  email?: string
  profile?: {
    fullName?: string
    age?: number
    schoolOrWork?: string
    bio?: string
    interests?: string[]
    profileImage?: string
  }
}

export async function saveAuthSession(token: string, user: StoredUser) {
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_KEY, token],
    [AUTH_USER_KEY, JSON.stringify(user)],
  ])
}

export async function getAuthSession() {
  const values = await AsyncStorage.multiGet([AUTH_TOKEN_KEY, AUTH_USER_KEY])
  const token = values.find(([key]) => key === AUTH_TOKEN_KEY)?.[1] ?? null
  const userJson = values.find(([key]) => key === AUTH_USER_KEY)?.[1] ?? null

  if (!token || !userJson) {
    return null
  }

  try {
    return {
      token,
      user: JSON.parse(userJson) as StoredUser,
    }
  } catch {
    await clearAuthSession()
    return null
  }
}

export async function clearAuthSession() {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY])
}

export function getHomeParams(token: string, user: StoredUser) {
  return {
    userId: String(user.id ?? ''),
    token,
    fullName: user.profile?.fullName ?? '',
    bio: user.profile?.bio ?? '',
    interests: JSON.stringify(user.profile?.interests ?? []),
    ...(user.profile?.profileImage ? { profileImage: user.profile.profileImage } : {}),
  }
}
