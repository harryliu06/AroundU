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
import { apiFetch } from '../utils/api'
import { getAuthSession } from '../utils/authStorage'

type FriendRequest = {
  id: string
  requester: {
    id: string
    profile?: {
      fullName?: string
      interests?: string[]
    }
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

export default function Notifications() {
  const [token, setToken] = useState<string | null>(null)
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [message, setMessage] = useState('Loading notifications...')
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const loadRequests = async (authToken: string) => {
    try {
      const response = await apiFetch('/friend-requests', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Could not load friend requests.')
        return
      }

      const incomingRequests = Array.isArray(data.requests) ? data.requests : []
      setRequests(incomingRequests)
      setMessage(incomingRequests.length ? '' : 'No friend requests yet.')
    } catch {
      setMessage('Network error loading notifications.')
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
      await loadRequests(session.token)
    }

    void load()
  }, [])

  const handleAccept = async (requestId: string) => {
    if (!token) return

    setAcceptingId(requestId)

    try {
      const response = await apiFetch(`/friend-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Could not accept request.')
        return
      }

      await loadRequests(token)
    } catch {
      setMessage('Network error accepting request.')
    } finally {
      setAcceptingId(null)
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
          <Text style={styles.brand}>Notifications</Text>
          <View style={styles.topBarSpacer} />
        </View>

        {message ? <Text style={styles.emptyText}>{message}</Text> : null}

        <View style={styles.list}>
          {requests.map((request) => {
            const fullName = request.requester.profile?.fullName || 'AroundU User'
            const interests = request.requester.profile?.interests || []

            return (
              <View key={request.id} style={styles.requestRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitials}>{getInitials(fullName)}</Text>
                </View>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{fullName}</Text>
                  <Text style={styles.requestMeta} numberOfLines={1}>
                    {interests.slice(0, 3).join(', ') || 'Wants to connect'}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.acceptButton, pressed && styles.buttonInactive]}
                  disabled={acceptingId === request.id}
                  onPress={() => {
                    void handleAccept(request.id)
                  }}
                >
                  {acceptingId === request.id ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.acceptText}>Accept</Text>
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
  requestRow: {
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
  requestInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  requestName: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  requestMeta: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  acceptButton: {
    height: 36,
    borderRadius: 9,
    backgroundColor: '#36A7F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  acceptText: {
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
