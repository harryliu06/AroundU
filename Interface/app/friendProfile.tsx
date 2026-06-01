import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
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
import { apiFetch } from '../utils/api'

const COVER_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'

type FriendStatus = 'none' | 'pending' | 'accepted' | 'blocked'

export default function UserProfile() {
  const params = useLocalSearchParams<{
    userId?: string
    token?: string
    fullName?: string
    bio?: string
    interests?: string
    profileImage?: string
    friendStatus?: FriendStatus
  }>()
  const [friendMessage, setFriendMessage] = useState<string | null>(null)
  const [isAddingFriend, setIsAddingFriend] = useState(false)
  const [friendStatus, setFriendStatus] = useState<FriendStatus>(
    params.friendStatus === 'accepted' ||
      params.friendStatus === 'pending' ||
      params.friendStatus === 'blocked'
      ? params.friendStatus
      : 'none'
  )
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const fullName = params.fullName || 'FULL NAME PLACEHOLDER'
  const bio =
    params.bio ||
    'BIOGRAPHY PLACEHOLDER'
  const rawProfileImage = params.profileImage?.trim()
  const profileImage =
    rawProfileImage &&
    rawProfileImage !== 'undefined' &&
    rawProfileImage !== 'null' &&
    /^(https?:|file:|data:)/.test(rawProfileImage)
      ? rawProfileImage
      : null
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AU'

  let interests = ['Biking', 'Music', 'YouTube', 'Horror Films', 'Photography']

  try {
    const parsedInterests = JSON.parse(params.interests || '[]')

    if (Array.isArray(parsedInterests) && parsedInterests.length > 0) {
      interests = parsedInterests.map((interest) => String(interest))
    }
  } catch {
    interests = ['Biking', 'Music', 'YouTube', 'Horror Films', 'Photography']
  }

  useEffect(() => {
    const loadFriendStatus = async () => {
      if (!params.userId || !params.token) return

      setIsCheckingStatus(true)

      try {
        const response = await apiFetch(`/friends/${params.userId}/status`, {
          headers: {
            Authorization: `Bearer ${params.token}`,
          },
        })
        const data = await response.json()

        if (response.ok && ['none', 'pending', 'accepted', 'blocked'].includes(data.status)) {
          setFriendStatus(data.status)
        }
      } finally {
        setIsCheckingStatus(false)
      }
    }

    void loadFriendStatus()
  }, [params.token, params.userId])

  const friendButtonLabel =
    friendStatus === 'accepted'
      ? 'Friends'
      : friendStatus === 'pending'
        ? 'Requested'
        : friendStatus === 'blocked'
          ? 'Blocked'
          : 'Add Friend'
  const friendButtonIcon =
    friendStatus === 'accepted'
      ? 'check'
      : friendStatus === 'pending'
        ? 'clock-o'
        : friendStatus === 'blocked'
          ? 'ban'
          : 'user-plus'

  const handleAddFriend = async () => {
    if (!params.userId || !params.token) {
      setFriendMessage('Friend data is missing.')
      return
    }

    if (friendStatus !== 'none') return

    setIsAddingFriend(true)
    setFriendMessage(null)

    try {
      const response = await apiFetch(`/friends/${params.userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${params.token}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setFriendMessage(data.message || 'Could not add friend.')
        return
      }

      setFriendMessage(data.message || 'Friend request sent.')
      setFriendStatus(data.friendship?.status === 'accepted' ? 'accepted' : 'pending')
    } catch {
      setFriendMessage('Network error. Please try again later.')
    } finally {
      setIsAddingFriend(false)
    }
  }

  const handleBlockUser = async () => {
    if (!params.userId || !params.token) {
      setFriendMessage('Friend data is missing.')
      return
    }

    if (friendStatus === 'blocked') return

    setIsAddingFriend(true)
    setFriendMessage(null)

    try {
      const response = await apiFetch(`/blocked-users/${params.userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${params.token}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setFriendMessage(data.message || 'Could not block user.')
        return
      }

      setFriendStatus('blocked')
      setFriendMessage(data.message || 'User blocked.')
    } catch {
      setFriendMessage('Network error. Please try again later.')
    } finally {
      setIsAddingFriend(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverWrap}>
          <Image source={{ uri: COVER_IMAGE }} style={styles.coverImage} />
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonInactive]}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={24} color="#111111" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.avatarWrap}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </View>

          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.meta}>{interests.slice(0, 3).join(', ')}</Text>

          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonInactive]}
              disabled={isAddingFriend || isCheckingStatus || friendStatus !== 'none'}
              onPress={() => {
                void handleAddFriend()
              }}
            >
              {isAddingFriend || isCheckingStatus ? (
                <ActivityIndicator color="#2563eb" />
              ) : (
                <>
                  <FontAwesome
                    name={friendButtonIcon}
                    size={15}
                    color="#2563eb"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.secondaryButtonText}>{friendButtonLabel}</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonInactive]}
              disabled={isAddingFriend || isCheckingStatus || friendStatus === 'blocked'}
              onPress={() => {
                void handleBlockUser()
              }}
            >
              <FontAwesome name="ban" size={15} color="#6b7280" style={styles.buttonIcon} />
              <Text style={styles.mutedButtonText}>
                {friendStatus === 'blocked' ? 'Blocked' : 'Block'}
              </Text>
            </Pressable>
          </View>

          {friendMessage ? (
            <Text
              style={[
                styles.friendMessage,
                (friendMessage.includes('sent') ||
                  friendMessage.includes('already') ||
                  friendMessage.includes('request')) &&
                  styles.friendSuccess,
              ]}
            >
              {friendMessage}
            </Text>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.infoText}>{bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tagRow}>
              {interests.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 34,
    backgroundColor: '#f8fafc',
  },
  coverWrap: {
    height: 188,
    backgroundColor: '#e5e7eb',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: -61,
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: '#36A7F8',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    lineHeight: 19,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 18,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  secondaryButton: {
    width: '48%',
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  mutedButtonText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  buttonIcon: {
    marginRight: 7,
  },
  section: {
    width: '100%',
    marginBottom: 22,
  },
  sectionTitle: {
    width: '100%',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#4b5563',
  },
  tagRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tagChip: {
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    lineHeight: 17,
    color: '#0369a1',
    fontWeight: '700',
  },
  buttonInactive: {
    opacity: 0.72,
  },
  friendMessage: {
    width: '100%',
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 18,
  },
  friendSuccess: {
    color: '#0369a1',
  },
})
