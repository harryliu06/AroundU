import { useEffect, useState } from 'react'
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as Location from 'expo-location'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams } from 'expo-router'
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { apiJson } from '../utils/api'
import {
  DEFAULT_DISCOVERY_RADIUS_MILES,
  getDiscoveryRadiusMiles,
} from '../utils/locationPreferences'

type Coordinate = {
  latitude: number
  longitude: number
}

type NearbyUser = {
  id: string
  name: string
  tags: string[]
  allTags: string[]
  distance: number
  location?: Coordinate
  image?: string
  bio: string
  friendStatus: 'none' | 'pending' | 'accepted'
}

const DEFAULT_REGION = {
  latitude: 33.6405,
  longitude: -117.8443,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
}

const DEMO_MARKER_OFFSETS = [
  { latitude: 0.0032, longitude: -0.004 },
  { latitude: -0.0024, longitude: 0.0037 },
  { latitude: 0.0018, longitude: 0.0044 },
  { latitude: -0.0036, longitude: -0.0028 },
  { latitude: 0.004, longitude: 0.0015 },
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

function isValidCoordinate(location?: Coordinate): location is Coordinate {
  if (!location) {
    return false
  }

  return (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  )
}

function getMarkerCoordinate(user: NearbyUser, index: number, origin: Coordinate): Coordinate {
  if (isValidCoordinate(user.location)) {
    return user.location
  }

  const offset = DEMO_MARKER_OFFSETS[index % DEMO_MARKER_OFFSETS.length] ?? DEMO_MARKER_OFFSETS[0]

  return {
    latitude: origin.latitude + offset.latitude,
    longitude: origin.longitude + offset.longitude,
  }
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
  const [locationMessage, setLocationMessage] = useState('Checking location access...')
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null)
  const [discoveryRadiusMiles, setDiscoveryRadiusMiles] = useState(DEFAULT_DISCOVERY_RADIUS_MILES)

  useEffect(() => {
    const updateCurrentLocation = async () => {
      if (!currentUser.token) {
        setLocationMessage('Sign in to update your location.')
        return
      }

      const permission = await Location.requestForegroundPermissionsAsync()

      if (permission.status !== 'granted') {
        setLocationMessage('Location access is needed to find nearby people.')
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const coordinates = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }

      setUserLocation(coordinates)

      const { response, data } = await apiJson('/me/location', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      })

      if (!response.ok) {
        setLocationMessage(data.message || 'Could not update your location.')
        return
      }

      setLocationMessage('Location updated.')
    }

    const loadNearbyUsers = async () => {
      try {
        const savedRadius = await getDiscoveryRadiusMiles()
        setDiscoveryRadiusMiles(savedRadius)
        await updateCurrentLocation()

        const { response, data } = await apiJson('/nearby-users', {
          headers: currentUser.token
            ? {
                Authorization: `Bearer ${currentUser.token}`,
              }
            : undefined,
        })

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
              location: isValidCoordinate(user.location)
                ? {
                    latitude: Number(user.location.latitude),
                    longitude: Number(user.location.longitude),
                  }
                : undefined,
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
        setLocationMessage('Could not update location.')
      }
    }

    void loadNearbyUsers()
  }, [currentUser.token])

  const mapCenter = userLocation ?? {
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  }

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
          <Text style={styles.locationStatus}>{locationMessage}</Text>
        </View>

        <View style={styles.mapPanel}>
          <MapView
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={DEFAULT_REGION}
            region={{
              latitude: mapCenter.latitude,
              longitude: mapCenter.longitude,
              latitudeDelta: 0.002,
              longitudeDelta: 0.002,
            }}
            showsUserLocation={Boolean(userLocation)}
            showsMyLocationButton={false}
            toolbarEnabled={false}
          >
            {userLocation ? (
              <>
                <Circle
                  center={userLocation}
                  radius={discoveryRadiusMiles * 1609.34}
                  strokeColor="rgba(54, 167, 248, 0.28)"
                  fillColor="rgba(54, 167, 248, 0.08)"
                />
                <Marker coordinate={userLocation} title="You">
                  <View style={[styles.mapMarker, styles.currentUserMarker]}>
                    <FontAwesome name="user" size={12} color="#ffffff" />
                  </View>
                </Marker>
              </>
            ) : null}

            {nearbyUsers.map((user, index) => (
              <Marker
                key={user.id}
                coordinate={getMarkerCoordinate(user, index, mapCenter)}
                title={user.name}
                description={formatTags(user.tags)}
              >
                <View style={styles.mapMarker}>
                  <Text style={styles.mapMarkerText}>{getInitials(user.name)}</Text>
                </View>
              </Marker>
            ))}
          </MapView>

          <View style={styles.mapToolbar}>
            <Pressable
              style={({ pressed }) => [styles.mapIconButton, pressed && styles.buttonInactive]}
            >
              <FontAwesome name="location-arrow" size={14} color="#111111" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.mapIconButton, pressed && styles.buttonInactive]}
            >
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
  locationStatus: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
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
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#36A7F8',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111111',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  currentUserMarker: {
    backgroundColor: '#ef4444',
  },
  mapMarkerText: {
    color: '#ffffff',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
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
