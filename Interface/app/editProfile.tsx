import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import { getAuthSession, getHomeParams, saveAuthSession } from '../utils/authStorage'
import { apiFetch } from '../utils/api'

type ProfileForm = {
  fullName: string
  age: string
  schoolOrWork: string
  bio: string
}

function validate(form: ProfileForm, selectedInterests: string[]): string | null {
  if (!form.fullName.trim() || !form.age.trim()) {
    return 'Name and age are required.'
  }

  const age = Number(form.age)

  if (!Number.isInteger(age) || age < 16 || age > 100) {
    return 'Please enter a valid age.'
  }

  if (selectedInterests.length < 3) {
    return 'Choose at least 3 interests.'
  }

  return null
}

export default function EditProfile() {
  const [form, setForm] = useState<ProfileForm>({
    fullName: '',
    age: '',
    schoolOrWork: '',
    bio: '',
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [interestInput, setInterestInput] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      !isSubmitting &&
      form.fullName.trim() !== '' &&
      form.age.trim() !== '' &&
      selectedInterests.length >= 3
    )
  }, [form.age, form.fullName, isSubmitting, selectedInterests.length])

  useEffect(() => {
    const loadProfile = async () => {
      const session = await getAuthSession()

      if (!session) {
        router.replace('/login')
        return
      }

      setToken(session.token)
      setForm({
        fullName: session.user.profile?.fullName ?? '',
        age: session.user.profile?.age ? String(session.user.profile.age) : '',
        schoolOrWork: session.user.profile?.schoolOrWork ?? '',
        bio: session.user.profile?.bio ?? '',
      })
      setSelectedInterests(session.user.profile?.interests ?? [])
      setIsLoading(false)
    }

    void loadProfile()
  }, [])

  const updateForm = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (message) setMessage(null)
  }

  const addInterest = () => {
    const nextInterest = interestInput.trim()

    if (!nextInterest) {
      return
    }

    setSelectedInterests((prev) => {
      const alreadyAdded = prev.some(
        (interest) => interest.toLowerCase() === nextInterest.toLowerCase()
      )

      if (alreadyAdded) {
        return prev
      }

      return [...prev, nextInterest]
    })
    setInterestInput('')
    if (message) setMessage(null)
  }

  const removeInterest = (interest: string) => {
    setSelectedInterests((prev) => prev.filter((item) => item !== interest))
    if (message) setMessage(null)
  }

  const handleSave = async () => {
    const validationError = validate(form, selectedInterests)

    if (validationError) {
      setMessage(validationError)
      return
    }

    if (!token) {
      setMessage('Please log in again.')
      return
    }

    setMessage(null)
    setIsSubmitting(true)

    try {
      const response = await apiFetch('/me', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            fullName: form.fullName.trim(),
            age: form.age.trim(),
            schoolOrWork: form.schoolOrWork.trim(),
            bio: form.bio.trim(),
            interests: selectedInterests,
          },
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Could not update profile.')
        return
      }

      await saveAuthSession(token, data.user)
      router.replace({
        pathname: '/home',
        params: getHomeParams(token, data.user),
      })
    } catch {
      setMessage('Network error. Please try again later.')
    } finally {
      setIsSubmitting(false)
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              style={({ pressed }) => [styles.topBarButton, pressed && styles.buttonInactive]}
              onPress={() => router.back()}
            >
              <FontAwesome name="angle-left" size={24} color="#111111" />
            </Pressable>

            <Text style={styles.brand}>Edit Profile</Text>

            <View style={styles.topBarSpacer} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.avatarButton, pressed && styles.buttonInactive]}
            onPress={() => setMessage('Profile photo upload is not wired yet.')}
          >
            <FontAwesome name="user" size={38} color="#36A7F8" />
            <View style={styles.cameraBadge}>
              <FontAwesome name="camera" size={12} color="#ffffff" />
            </View>
          </Pressable>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <TextInput
              style={[styles.input, styles.sectionFirstInput]}
              placeholder="Full name"
              placeholderTextColor="#9ca3af"
              value={form.fullName}
              editable={!isSubmitting}
              onChangeText={(value) => updateForm('fullName', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={form.age}
              editable={!isSubmitting}
              onChangeText={(value) => updateForm('age', value.replace(/\D/g, ''))}
            />

            <TextInput
              style={styles.input}
              placeholder="School or work"
              placeholderTextColor="#9ca3af"
              value={form.schoolOrWork}
              editable={!isSubmitting}
              onChangeText={(value) => updateForm('schoolOrWork', value)}
            />

            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Short bio"
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              maxLength={160}
              value={form.bio}
              editable={!isSubmitting}
              onChangeText={(value) => updateForm('bio', value)}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <Text style={styles.sectionHint}>{selectedInterests.length}/3 minimum</Text>
            </View>

            <View style={styles.interestInputRow}>
              <TextInput
                style={[styles.input, styles.interestInput]}
                placeholder="Add an interest"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                returnKeyType="done"
                value={interestInput}
                editable={!isSubmitting}
                onChangeText={setInterestInput}
                onSubmitEditing={addInterest}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.addInterestButton,
                  (!interestInput.trim() || pressed) && styles.buttonInactive,
                ]}
                disabled={!interestInput.trim() || isSubmitting}
                onPress={addInterest}
              >
                <FontAwesome name="plus" size={14} color="#ffffff" />
              </Pressable>
            </View>

            <View style={styles.interestGrid}>
              {selectedInterests.map((interest) => (
                <Pressable
                  key={interest}
                  style={({ pressed }) => [
                    styles.interestChip,
                    pressed && styles.buttonInactive,
                  ]}
                  disabled={isSubmitting}
                  onPress={() => removeInterest(interest)}
                >
                  <Text style={styles.interestText}>{interest}</Text>
                  <FontAwesome name="times" size={12} color="#0369a1" />
                </Pressable>
              ))}
            </View>

            <Text style={[styles.message, message ? styles.errorMessage : null]}>
              {message ?? ' '}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (!canSubmit || pressed) && styles.buttonInactive,
              ]}
              disabled={!canSubmit}
              onPress={() => {
                void handleSave()
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
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
  avatarButton: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#36A7F8',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111111',
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  sectionFirstInput: {
    marginTop: 12,
  },
  bioInput: {
    height: 86,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#111111',
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6b7280',
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  interestInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  interestInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  addInterestButton: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: '#36A7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestChip: {
    minHeight: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  interestText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#0369a1',
    marginRight: 7,
  },
  message: {
    marginTop: 4,
    marginBottom: 10,
    minHeight: 18,
    color: '#0369a1',
    fontSize: 14,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#b91c1c',
  },
  primaryButton: {
    height: 40,
    borderRadius: 9,
    backgroundColor: '#36A7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonInactive: {
    opacity: 0.72,
  },
})
