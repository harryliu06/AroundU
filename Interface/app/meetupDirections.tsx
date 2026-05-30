import { useMemo, useState } from 'react'
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { router, useLocalSearchParams } from 'expo-router'

const TRAVEL_MODES = ['Walk', 'Bike', 'Drive'] as const

const MAP_BLOCKS = [
  { top: 22, left: 18, width: 62, height: 48 },
  { top: 22, left: 104, width: 76, height: 48 },
  { top: 22, left: 206, width: 84, height: 48 },
  { top: 92, left: 18, width: 78, height: 54 },
  { top: 92, left: 120, width: 82, height: 54 },
  { top: 92, left: 226, width: 64, height: 54 },
  { top: 168, left: 18, width: 68, height: 58 },
  { top: 168, left: 110, width: 98, height: 58 },
  { top: 168, left: 232, width: 58, height: 58 },
]

export default function MeetupDirections() {
  const params = useLocalSearchParams<{
    fullName?: string
    profileImage?: string
  }>()
  const [selectedMode, setSelectedMode] = useState<(typeof TRAVEL_MODES)[number]>('Walk')

  const fullName = params.fullName || 'Nearby User'
  const rawProfileImage = params.profileImage?.trim()
  const profileImage =
    rawProfileImage &&
    rawProfileImage !== 'undefined' &&
    rawProfileImage !== 'null' &&
    /^(https?:|file:|data:)/.test(rawProfileImage)
      ? rawProfileImage
      : null
  const firstName = fullName.trim().split(/\s+/)[0] || 'Friend'
  const initials = useMemo(() => {
    return (
      fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'AU'
    )
  }, [fullName])

  const tripMeta =
    selectedMode === 'Walk'
      ? { duration: '8 min', distance: '0.4 mi', arrive: '3:47 PM' }
      : selectedMode === 'Bike'
        ? { duration: '3 min', distance: '0.4 mi', arrive: '3:42 PM' }
        : { duration: '2 min', distance: '0.5 mi', arrive: '3:41 PM' }

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

          <View style={styles.topBarText}>
            <Text style={styles.title}>Meet-Up Directions</Text>
            <Text style={styles.subtitle}>Navigating to {firstName}</Text>
          </View>

          <Pressable style={({ pressed }) => [styles.topBarButton, pressed && styles.buttonInactive]}>
            <FontAwesome name="location-arrow" size={15} color="#36A7F8" />
          </Pressable>
        </View>

        <View style={styles.mapPanel}>
          {MAP_BLOCKS.map((block, index) => (
            <View key={index} style={[styles.mapBlock, block]} />
          ))}

          <View style={[styles.road, styles.roadVerticalLeft]} />
          <View style={[styles.road, styles.roadVerticalRight]} />
          <View style={[styles.road, styles.roadHorizontalTop]} />
          <View style={[styles.road, styles.roadHorizontalMid]} />

          <View style={styles.routeOne} />
          <View style={styles.routeTwo} />
          <View style={styles.routeThree} />

          <View style={styles.destinationLabel}>
            <Text style={styles.destinationText}>{firstName}</Text>
          </View>
          <View style={[styles.mapPin, styles.destinationPin]}>
            <FontAwesome name="map-marker" size={20} color="#ffffff" />
          </View>

          <View style={styles.youLabel}>
            <Text style={styles.youText}>You</Text>
          </View>
          <View style={[styles.mapPin, styles.youPin]}>
            <FontAwesome name="map-marker" size={20} color="#ffffff" />
          </View>
        </View>

        <View style={styles.tripCard}>
          <View>
            <Text style={styles.tripLabel}>Estimated arrival</Text>
            <Text style={styles.tripDuration}>{tripMeta.duration}</Text>
            <Text style={styles.tripDistance}>
              {tripMeta.distance} · {selectedMode}
            </Text>
          </View>
          <View style={styles.arrivalPill}>
            <Text style={styles.arriveLabel}>Arrive by</Text>
            <Text style={styles.arriveTime}>{tripMeta.arrive}</Text>
          </View>
        </View>

        <View style={styles.modeRow}>
          {TRAVEL_MODES.map((mode) => {
            const isSelected = selectedMode === mode

            return (
              <Pressable
                key={mode}
                style={[styles.modeButton, isSelected && styles.modeButtonSelected]}
                onPress={() => setSelectedMode(mode)}
              >
                {mode === 'Walk' ? (
                  <MaterialIcons
                    name="directions-walk"
                    size={16}
                    color={isSelected ? '#ffffff' : '#6b7280'}
                  />
                ) : (
                  <FontAwesome
                    name={mode === 'Bike' ? 'bicycle' : 'car'}
                    size={13}
                    color={isSelected ? '#ffffff' : '#6b7280'}
                  />
                )}
                <Text style={[styles.modeText, isSelected && styles.modeTextSelected]}>
                  {mode}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.requestPanel}>
          <View style={styles.avatar}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </View>
          <View style={styles.requestText}>
            <Text style={styles.requestName}>{fullName}</Text>
            <Text style={styles.requestStatus}>Meet-up request ready</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.chatButton, pressed && styles.buttonInactive]}
            onPress={() =>
              router.push({
                pathname: '/chat',
                params: {
                  fullName,
                  ...(profileImage ? { profileImage } : {}),
                },
              })
            }
          >
            <FontAwesome name="comment-o" size={13} color="#0369a1" />
          </Pressable>
        </View>

        <View style={styles.footerActions}>
          <Pressable style={({ pressed }) => [styles.startButton, pressed && styles.buttonInactive]}>
            <Text style={styles.startButtonText}>Start</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonInactive]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
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
  topBarText: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: '#111111',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  mapPanel: {
    width: '100%',
    maxWidth: 327,
    height: 278,
    alignSelf: 'center',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#eef7fb',
    overflow: 'hidden',
    marginBottom: 14,
  },
  mapBlock: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: '#d8f3dc',
  },
  road: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dde2',
  },
  roadVerticalLeft: {
    top: -10,
    left: 92,
    width: 14,
    height: 304,
  },
  roadVerticalRight: {
    top: -10,
    left: 210,
    width: 14,
    height: 304,
  },
  roadHorizontalTop: {
    top: 76,
    left: -10,
    width: 350,
    height: 14,
  },
  roadHorizontalMid: {
    top: 152,
    left: -10,
    width: 350,
    height: 14,
  },
  routeOne: {
    position: 'absolute',
    top: 80,
    left: 160,
    width: 58,
    height: 80,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: '#36A7F8',
    borderStyle: 'dashed',
    borderTopRightRadius: 8,
  },
  routeTwo: {
    position: 'absolute',
    top: 158,
    left: 214,
    width: 58,
    height: 54,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#36A7F8',
    borderStyle: 'dashed',
    borderTopRightRadius: 8,
  },
  routeThree: {
    position: 'absolute',
    top: 200,
    width: 18,
    height: 34,
    borderColor: '#36A7F8',
    borderStyle: 'dashed',
  },
  destinationLabel: {
    position: 'absolute',
    top: 34,
    left: 122,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  destinationText: {
    color: '#6b7280',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
  youLabel: {
    position: 'absolute',
    right: 38,
    bottom: 48,
    backgroundColor: '#ffffff',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youText: {
    color: '#ef4444',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
  mapPin: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  destinationPin: {
    top: 54,
    left: 144,
    backgroundColor: '#36A7F8',
  },
  youPin: {
    right: 30,
    bottom: 18,
    backgroundColor: '#ef4444',
  },
  tripCard: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    minHeight: 92,
    borderRadius: 9,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  tripLabel: {
    color: '#0369a1',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  tripDuration: {
    color: '#111111',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
  },
  tripDistance: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  arrivalPill: {
    borderRadius: 9,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'flex-end',
  },
  arriveLabel: {
    color: '#6b7280',
    fontSize: 11,
    lineHeight: 14,
  },
  arriveTime: {
    color: '#0369a1',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  modeRow: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  modeButtonSelected: {
    backgroundColor: '#36A7F8',
    borderColor: '#36A7F8',
  },
  modeText: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginLeft: 6,
  },
  modeTextSelected: {
    color: '#ffffff',
  },
  requestPanel: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    minHeight: 74,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 9,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
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
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  requestText: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  requestStatus: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerActions: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  startButton: {
    flex: 1,
    height: 44,
    borderRadius: 9,
    backgroundColor: '#36A7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4d4d8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  buttonInactive: {
    opacity: 0.72,
  },
})
