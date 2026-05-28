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

const COVER_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
const PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=400&q=80',
]

export default function UserProfile() {
  const params = useLocalSearchParams<{
    fullName?: string
    bio?: string
    interests?: string
  }>()
  const fullName = params.fullName || 'FULL NAME PLACEHOLDER'
  const bio =
    params.bio ||
    'BIOGRAPHY PLACEHOLDER'

  let interests = ['Biking', 'Music', 'YouTube', 'Horror Films', 'Photography']

  try {
    const parsedInterests = JSON.parse(params.interests || '[]')

    if (Array.isArray(parsedInterests) && parsedInterests.length > 0) {
      interests = parsedInterests.map((interest) => String(interest))
    }
  } catch {
    interests = ['Biking', 'Music', 'YouTube', 'Horror Films', 'Photography']
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
            <Image source={{ uri: '../assets/profile-placeholder.jpg' }} style={styles.avatarImage} />
          </View>

          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.meta}>{interests.slice(0, 3).join(', ')}</Text>


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

          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.galleryRow}>
            {GALLERY_IMAGES.map((image) => (
              <Image key={image} source={{ uri: image }} style={styles.galleryImage} />
            ))}
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
    overflow: 'hidden',
    marginTop: -61,
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  messageButton: {
    width: '100%',
    height: 44,
    borderRadius: 10,
    backgroundColor: '#36A7F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
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
  galleryRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  galleryImage: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  buttonInactive: {
    opacity: 0.72,
  },
})
