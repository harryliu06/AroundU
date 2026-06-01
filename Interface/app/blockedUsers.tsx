import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import { apiJson } from '../utils/api'
import { getAuthSession } from '../utils/authStorage'

type BlockedUser = {
  id: string
  profile?: {
    fullName?: string
    interests?: string[]
  }
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'AU'
  )
}

export default function BlockedUsers() {
  const [token, setToken] = useState<string | null>(null)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [message, setMessage] = useState('Loading blocked users...')
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  const loadBlockedUsers = async (authToken: string) => {
    try {
      const { response, data } = await apiJson('/blocked-users', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        setMessage(data.message || 'Could not load blocked users.')
        return
      }

      const users = Array.isArray(data.blockedUsers) ? data.blockedUsers : []
      setBlockedUsers(users)
      setMessage(users.length ? '' : 'No blocked users.')
    } catch {
      setMessage('Network error loading blocked users.')
    }
  }

  useEffect(() => {
    const load = async () => {
      const session = await getAuthSession()

      if (!session) {
        router.replace('/login')
        return
      }

      setToken(session.token)
      await loadBlockedUsers(session.token)
    }

    void load()
  }, [])

  const handleUnblock = async (userId: string) => {
    if (!token) return

    setUnblockingId(userId)

    try {
      const { response, data } = await apiJson(`/blocked-users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setMessage(data.message || 'Could not unblock user.')
        return
      }

      await loadBlockedUsers(token)
    } catch {
      setMessage('Network error unblocking user.')
    } finally {
      setUnblockingId(null)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.topBarButton, pressed && styles.buttonInactive]}
            onPress={() => router.back()}
          >
            <FontAwesome name="angle-left" size={24} color="#111111" />
          </Pressable>
          <Text style={styles.brand}>Blocked Users</Text>
          <View style={styles.topBarSpacer} />
        </View>

        {message ? <Text style={styles.emptyText}>{message}</Text> : null}

        <View style={styles.list}>
          {blockedUsers.map((user) => {
            const fullName = user.profile?.fullName || 'AroundU User'
            const interests = user.profile?.interests || []

            return (
              <View key={user.id} style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitials}>{getInitials(fullName)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{fullName}</Text>
                  <Text style={styles.userMeta} numberOfLines={1}>
                    {interests.slice(0, 3).join(', ') || 'Blocked profile'}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.unblockButton, pressed && styles.buttonInactive]}
                  disabled={unblockingId === user.id}
                  onPress={() => {
                    void handleUnblock(user.id)
                  }}
                >
                  {unblockingId === user.id ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.unblockText}>Unblock</Text>
                  )}
                </Pressable>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
  },
  topBar: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 24,
  },
  topBarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarSpacer: {
    width: 38,
    height: 38,
  },
  brand: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111111',
  },
  list: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
  },
  userRow: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 9,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#36A7F8',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  userName: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  userMeta: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  unblockButton: {
    height: 36,
    borderRadius: 9,
    backgroundColor: '#36A7F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  unblockText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonInactive: {
    opacity: 0.72,
  },
})
