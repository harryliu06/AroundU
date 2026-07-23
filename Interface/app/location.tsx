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
import {
  DEFAULT_DISCOVERY_RADIUS_MILES,
  getDiscoveryRadiusMiles,
  saveDiscoveryRadiusMiles,
} from '../utils/locationPreferences'

const RADIUS_PRESETS = [1, 3, 5, 10, 15]

export default function LocationSettings() {
  const [radius, setRadius] = useState(DEFAULT_DISCOVERY_RADIUS_MILES)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadRadius = async () => {
      const savedRadius = await getDiscoveryRadiusMiles()
      setRadius(savedRadius)
      setIsLoading(false)
    }

    void loadRadius()
  }, [])

  const updateRadius = (nextRadius: number) => {
    setRadius(Math.min(25, Math.max(1, nextRadius)))
    if (message) setMessage(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const savedRadius = await saveDiscoveryRadiusMiles(radius)
      setRadius(savedRadius)
      setMessage('Location radius saved.')
    } catch {
      setMessage('Could not save location radius.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color="#36A7F8" />
      </SafeAreaView>
    )
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

          <Text style={styles.brand}>Location</Text>

          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.panel}>
          <View style={styles.radiusHeader}>
            <View>
              <Text style={styles.sectionTitle}>Discovery Radius</Text>
              <Text style={styles.sectionHint}>Show people within this distance</Text>
            </View>
            <View style={styles.radiusBadge}>
              <Text style={styles.radiusBadgeText}>{radius} mi</Text>
            </View>
          </View>

          <View style={styles.stepperRow}>
            <Pressable
              style={({ pressed }) => [
                styles.stepperButton,
                radius <= 1 && styles.buttonDisabled,
                pressed && styles.buttonInactive,
              ]}
              disabled={radius <= 1}
              onPress={() => updateRadius(radius - 1)}
            >
              <FontAwesome name="minus" size={14} color="#36A7F8" />
            </Pressable>

            <View style={styles.radiusTrack}>
              <View style={[styles.radiusFill, { width: `${(radius / 25) * 100}%` }]} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.stepperButton,
                radius >= 25 && styles.buttonDisabled,
                pressed && styles.buttonInactive,
              ]}
              disabled={radius >= 25}
              onPress={() => updateRadius(radius + 1)}
            >
              <FontAwesome name="plus" size={14} color="#36A7F8" />
            </Pressable>
          </View>

          <View style={styles.presetRow}>
            {RADIUS_PRESETS.map((preset) => (
              <Pressable
                key={preset}
                style={({ pressed }) => [
                  styles.presetChip,
                  radius === preset && styles.presetChipActive,
                  pressed && styles.buttonInactive,
                ]}
                onPress={() => updateRadius(preset)}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    radius === preset && styles.presetChipTextActive,
                  ]}
                >
                  {preset} mi
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.helperText}>
          Smaller radius gives closer matches. Larger radius gives more people nearby.
        </Text>

        <Text style={[styles.message, message?.startsWith('Could') && styles.errorMessage]}>
          {message ?? ' '}
        </Text>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonInactive]}
          disabled={isSaving}
          onPress={() => {
            void handleSave()
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Radius</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  panel: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 9,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  sectionHint: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  radiusBadge: {
    minWidth: 58,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  radiusBadgeText: {
    color: '#0369a1',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepperButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  radiusFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#36A7F8',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  presetChip: {
    minHeight: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  presetChipActive: {
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
  },
  presetChipText: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: '#0369a1',
  },
  helperText: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  message: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    minHeight: 18,
    color: '#0369a1',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  errorMessage: {
    color: '#b91c1c',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 327,
    height: 40,
    borderRadius: 9,
    backgroundColor: '#36A7F8',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonInactive: {
    opacity: 0.72,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
})
