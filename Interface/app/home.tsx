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

type NearbyUser = {
  id: number 
  name: string
  tags: string[]
  distance: number
  image: string
}

const NEARBY_USERS: NearbyUser[] = [
  {
    id: 1,
    name: 'Harley Quizel',
    tags: ['Biking', 'Music', 'YouTube'],
    distance: 2.8,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    name: 'Catherine Emily',
    tags: ['Baking', 'Movies', 'Running'],
    distance: 3.0,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    name: 'Carter Smith',
    tags: ['Hiking', 'Reading', 'Cooking'],
    distance: 3.5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 4,
    name: 'Mia Chen',
    tags: ['Reading', 'Music', 'Biking'],
    distance: 4.1,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  },
]

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

export default function Home() {
  const currentUser = useLocalSearchParams<{
    userId?: string
    token?: string
    fullName?: string
    bio?: string
    interests?: string
    profileImage?: string
  }>()

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
          <Text style={styles.sectionHint}>{NEARBY_USERS.length} online</Text>
        </View>

        <View style={styles.list}>
          {NEARBY_USERS.map((user) => (
            <Pressable
              key={user.id}
              style={({ pressed }) => [styles.userRow, pressed && styles.buttonInactive]}
              onPress={() =>
                router.push({
                  pathname: '/friendProfile',
                  params: {
                    fullName: user.name,
                    interests: JSON.stringify(user.tags),
                    bio: `${user.name} is nearby and looking to meet people with similar interests.`,
                    profileImage: user.image,
                  },
                })
              }
            >
              <Image source={{ uri: user.image }} style={styles.avatar} />

              <View style={styles.userInfo}>
                <View style={styles.userTitleRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.distanceText}>{user.distance.toFixed(1)} mi</Text>
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
                      profileImage: user.image,
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
    backgroundColor: '#e5e7eb',
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
})
