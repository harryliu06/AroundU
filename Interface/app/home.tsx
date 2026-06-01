import { useEffect, useState } from 'react'
import {
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

type NearbyUser = {
  id: string
  name: string
  tags: string[]
  allTags: string[]
  distance: number
  image?: string
  bio: string
  friendStatus: 'none' | 'pending' | 'accepted'
}

const MAP_PINS = [
  { id: 1, top: 34, left: 50, color: '#36A7F8' },
  { id: 2, top: 72, left: 142, color: '#ef4444' },
  { id: 3, top: 42, left: 232, color: '#36A7F8' },
  { id: 4, top: 112, left: 268, color: '#ef4444' },
  { id: 5, top: 116, left: 106, color: '#36A7F8' },
]

function formatTags(tags: string[]) {
  return tags.map((tag) => `#${tag}`).join(', ')
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

export default function Home() {
  const currentUser = useLocalSearchParams<{
    userId?: string
    token?: string
    fullName?: string
    bio?: string
    interests?: string
    profileImage?: string
  }>()
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [nearbyMessage, setNearbyMessage] = useState('Loading nearby users...')

  useEffect(() => {
    const loadNearbyUsers = async () => {
      try {
        const response = await apiFetch('/nearby-users', {
          headers: currentUser.token
            ? {
                Authorization: `Bearer ${currentUser.token}`,
              }
            : undefined,
        })
        const data = await response.json()

        if (!response.ok) {
          setNearbyMessage(data.message || 'Could not load nearby users.')
          return
        }

        const users = Array.isArray(data.users) ? data.users : []
        setNearbyUsers(
          users.map((user: any) => {
            const profileInterests = Array.isArray(user.profile?.interests)
              ? user.profile.interests
              : []
            const sharedInterests = Array.isArray(user.sharedInterests)
              ? user.sharedInterests
              : []

            return {
              id: String(user.id),
              name: user.profile?.fullName || 'AroundU User',
              tags: sharedInterests.length ? sharedInterests : profileInterests,
              allTags: profileInterests,
              distance: Number(user.distance ?? 0),
              image: user.profile?.profileImage || undefined,
              bio:
                user.profile?.bio ||
                `${user.profile?.fullName || 'This user'} is nearby and looking to meet people with similar interests.`,
              friendStatus:
                user.friendStatus === 'accepted' || user.friendStatus === 'pending'
                  ? user.friendStatus
                  : 'none',
            }
          })
        )
        setNearbyMessage(users.length ? '' : 'No nearby users share your interests yet.')
      } catch {
        setNearbyMessage('Network error loading nearby users.')
      }
    }

    void loadNearbyUsers()
  }, [currentUser.token])

  const openCurrentUserProfile = () => {
    router.push({
      pathname: '/userProfile',
      params: {
        userId: currentUser.userId,
        token: currentUser.token,
        fullName: currentUser.fullName,
        bio: currentUser.bio,
        interests: currentUser.interests,
        ...(currentUser.profileImage ? { profileImage: currentUser.profileImage } : {}),
      },
    })
  }

  const openSettings = () => {
    router.push({
      pathname: '/settings',
      params: {
        userId: currentUser.userId,
        token: currentUser.token,
        fullName: currentUser.fullName,
        bio: currentUser.bio,
        interests: currentUser.interests,
        ...(currentUser.profileImage ? { profileImage: currentUser.profileImage } : {}),
      },
    })
  }

  const openMessages = () => {
    router.push({
      pathname: '/messages',
      params: {
        token: currentUser.token,
      },
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.brand}>AroundU</Text>
          <View style={styles.topBarActions}>
            <Pressable
              style={({ pressed }) => [styles.topBarButton, pressed && styles.buttonInactive]}
              onPress={openSettings}
            >
              <FontAwesome name="gear" size={18} color="#111111" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.topBarButton, pressed && styles.buttonInactive]}
              onPress={openMessages}
            >
              <FontAwesome name="comments-o" size={18} color="#111111" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.topBarButton, pressed && styles.buttonInactive]}
              onPress={openCurrentUserProfile}
            >
              <FontAwesome name="user" size={18} color="#111111" />
            </Pressable>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Nearby People</Text>
          <Text style={styles.subtitle}>Discover people around you with shared interests</Text>
        </View>

        <View style={styles.mapPanel}>
          <View style={[styles.road, styles.roadOne]} />
          <View style={[styles.road, styles.roadTwo]} />
          <View style={[styles.road, styles.roadThree]} />
          <View style={styles.park}>
            <Text style={styles.parkText}>Aldrich Park</Text>
          </View>
          <Text style={styles.mapLabel}>University of California, Irvine</Text>

          {MAP_PINS.map((pin) => (
            <View
              key={pin.id}
              style={[
                styles.pin,
                {
                  top: pin.top,
                  left: pin.left,
                  backgroundColor: pin.color,
                },
              ]}
            >
              <FontAwesome name="map-marker" size={15} color="#ffffff" />
            </View>
          ))}

          <View style={styles.mapToolbar}>
            <Pressable style={styles.mapIconButton}>
              <FontAwesome name="location-arrow" size={14} color="#111111" />
            </Pressable>
            <Pressable style={styles.mapIconButton}>
              <FontAwesome name="sliders" size={14} color="#111111" />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Users</Text>
          <Text style={styles.sectionHint}>{nearbyUsers.length} online</Text>
        </View>

        <View style={styles.list}>
          {nearbyMessage ? <Text style={styles.emptyText}>{nearbyMessage}</Text> : null}

          {nearbyUsers.map((user) => (
            <Pressable
              key={user.id}
              style={({ pressed }) => [styles.userRow, pressed && styles.buttonInactive]}
              onPress={() =>
                router.push({
                  pathname: '/friendProfile',
                  params: {
                    userId: user.id,
                    token: currentUser.token,
                    fullName: user.name,
                    interests: JSON.stringify(user.allTags),
                    bio: user.bio,
                    friendStatus: user.friendStatus,
                    ...(user.image ? { profileImage: user.image } : {}),
                  },
                })
              }
            >
              <View style={styles.avatar}>
                {user.image ? (
                  <Image source={{ uri: user.image }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitials}>{getInitials(user.name)}</Text>
                )}
              </View>

              <View style={styles.userInfo}>
                <View style={styles.userTitleRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  {user.friendStatus === 'accepted' ? (
                    <View style={styles.friendBadge}>
                      <Text style={styles.friendBadgeText}>Friends</Text>
                    </View>
                  ) : user.friendStatus === 'pending' ? (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Requested</Text>
                    </View>
                  ) : (
                    <Text style={styles.distanceText}>{user.distance.toFixed(1)} mi</Text>
                  )}
                </View>
                <Text style={styles.tagsText} numberOfLines={1}>
                  {formatTags(user.tags)}
                </Text>
              </View>

              <Pressable
                style={styles.sendButton}
                onPress={() =>
                  router.push({
                    pathname: '/chat',
                    params: {
                      fullName: user.name,
                      friendId: user.id,
                      token: currentUser.token,
                      ...(user.image ? { profileImage: user.image } : {}),
                    },
                  })
                }
              >
                <FontAwesome name="paper-plane-o" size={16} color="#36A7F8" />
              </Pressable>
            </Pressable>
          ))}
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
  brand: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400',
    color: '#111111',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 20,
    color: '#111111',
    textAlign: 'center',
  },
  mapPanel: {
    width: '100%',
    maxWidth: 327,
    height: 178,
    alignSelf: 'center',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#eef7fb',
    overflow: 'hidden',
    marginBottom: 24,
  },
  road: {
    position: 'absolute',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dde2',
  },
  roadOne: {
    top: 45,
    left: -28,
    width: 210,
    transform: [{ rotate: '-24deg' }],
  },
  roadTwo: {
    top: 91,
    right: -36,
    width: 260,
    transform: [{ rotate: '18deg' }],
  },
  roadThree: {
    bottom: 28,
    left: 20,
    width: 250,
    transform: [{ rotate: '-8deg' }],
  },
  park: {
    position: 'absolute',
    top: 44,
    left: 132,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#d8f3dc',
    borderWidth: 1,
    borderColor: '#b7e4c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parkText: {
    color: '#5f7f67',
    fontSize: 10,
    textAlign: 'center',
  },
  mapLabel: {
    position: 'absolute',
    bottom: 34,
    left: 138,
    width: 118,
    color: '#555555',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  pin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapToolbar: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  mapIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6b7280',
  },
  list: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
  },
  userRow: {
    minHeight: 82,
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
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: '#36A7F8',
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: '#36A7F8',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  userName: {
    flex: 1,
    color: '#111111',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  distanceText: {
    color: '#0369a1',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  friendBadge: {
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  friendBadgeText: {
    color: '#0369a1',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  pendingBadge: {
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingBadgeText: {
    color: '#6b7280',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  tagsText: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInactive: {
    opacity: 0.72,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
})
