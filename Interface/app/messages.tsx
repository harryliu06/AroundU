import { useEffect, useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams } from 'expo-router'
import { getAuthSession } from '../utils/authStorage'

const API_URL = 'http://192.168.1.181:8000'

type Friend = {
  id: string
  profile?: {
    fullName?: string
    bio?: string
    interests?: string[]
    profileImage?: string
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

export default function Messages() {
  const params = useLocalSearchParams<{ token?: string }>()
  const [token, setToken] = useState(params.token || '')
  const [friends, setFriends] = useState<Friend[]>([])
  const [message, setMessage] = useState('Loading message history...')

  useEffect(() => {
    const loadFriends = async () => {
      let authToken = token

      if (!authToken) {
        const session = await getAuthSession()
        authToken = session?.token || ''
        setToken(authToken)
      }

      if (!authToken) {
        router.replace('/login')
        return
      }

      try {
        const response = await fetch(`${API_URL}/friends`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        const data = await response.json()

        if (!response.ok) {
          setMessage(data.message || 'Could not load friends.')
          return
        }

        const loadedFriends = Array.isArray(data.friends) ? data.friends : []
        setFriends(loadedFriends)
        setMessage(loadedFriends.length ? '' : 'No accepted friends yet.')
      } catch {
        setMessage('Network error loading message history.')
      }
    }

    void loadFriends()
  }, [token])

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
          <Text style={styles.brand}>Messages</Text>
          <View style={styles.topBarSpacer} />
        </View>

        {message ? <Text style={styles.emptyText}>{message}</Text> : null}

        <View style={styles.list}>
          {friends.map((friend) => {
            const fullName = friend.profile?.fullName || 'AroundU User'
            const interests = friend.profile?.interests || []

            return (
              <Pressable
                key={friend.id}
                style={({ pressed }) => [styles.friendRow, pressed && styles.buttonInactive]}
                onPress={() =>
                  router.push({
                    pathname: '/chat',
                    params: {
                      friendId: friend.id,
                      token,
                      fullName,
                      ...(friend.profile?.profileImage
                        ? { profileImage: friend.profile.profileImage }
                        : {}),
                    },
                  })
                }
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitials}>{getInitials(fullName)}</Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{fullName}</Text>
                  <Text style={styles.friendMeta} numberOfLines={1}>
                    {interests.slice(0, 3).join(', ') || 'Saved chat history'}
                  </Text>
                </View>
                <FontAwesome name="angle-right" size={18} color="#9ca3af" />
              </Pressable>
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
  friendRow: {
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
  friendInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  friendName: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  friendMeta: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
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
