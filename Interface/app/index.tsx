import { useEffect, useState } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import {
  clearAuthSession,
  getAuthSession,
  getHomeParams,
  saveAuthSession,
} from '../utils/authStorage'
import { apiJson } from '../utils/api'

export default function Index() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getAuthSession()

      if (!session) {
        router.replace('/login')
        setIsCheckingAuth(false)
        return
      }

      try {
        const { response, data } = await apiJson('/me', {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        })

        if (!response.ok) {
          await clearAuthSession()
          router.replace('/login')
          return
        }

        await saveAuthSession(session.token, data.user)
        router.replace({
          pathname: '/home',
          params: getHomeParams(session.token, data.user),
        })
      } catch {
        router.replace({
          pathname: '/home',
          params: getHomeParams(session.token, session.user),
        })
      } finally {
        setIsCheckingAuth(false)
      }
    }

    void checkAuth()
  }, [])

  return (
    <SafeAreaView style={styles.safeArea}>
      {isCheckingAuth ? <ActivityIndicator color="#36A7F8" /> : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
})
