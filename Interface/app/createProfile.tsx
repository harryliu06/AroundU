import { useMemo, useState } from 'react'
import {
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

type ProfileForm = {
  fullName: string
  age: string
  schoolOrWork: string
  bio: string
}

const INTERESTS = [
  'Coffee',
  'Gaming',
  'Fitness',
  'Music',
  'Movies',
  'Study',
  'Food',
  'Sports',
  'Art',
]

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

export default function CreateProfile() {
  const [form, setForm] = useState<ProfileForm>({
    fullName: '',
    age: '',
    schoolOrWork: '',
    bio: '',
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return form.fullName.trim() !== '' && form.age.trim() !== '' && selectedInterests.length >= 3
  }, [form.age, form.fullName, selectedInterests.length])

  const updateForm = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (message) setMessage(null)
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest)
      }

      return [...prev, interest]
    })
    if (message) setMessage(null)
  }

  const handleSubmit = () => {
    const validationError = validate(form, selectedInterests)

    if (validationError) {
      setMessage(validationError)
      return
    }

    router.push('/createAccount')
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
          <View style={styles.header}>
            <Text style={styles.brand}>AroundU</Text>
            <Text style={styles.title}>Create Profile</Text>
            <Text style={styles.subtitle}>Tell people nearby a little about you</Text>
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
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#9ca3af"
              value={form.fullName}
              onChangeText={(value) => updateForm('fullName', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={form.age}
              onChangeText={(value) => updateForm('age', value.replace(/\D/g, ''))}
            />

            <TextInput
              style={styles.input}
              placeholder="School or work"
              placeholderTextColor="#9ca3af"
              value={form.schoolOrWork}
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
              onChangeText={(value) => updateForm('bio', value)}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <Text style={styles.sectionHint}>{selectedInterests.length}/3 minimum</Text>
            </View>

            <View style={styles.interestGrid}>
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest)

                return (
                  <Pressable
                    key={interest}
                    style={({ pressed }) => [
                      styles.interestChip,
                      isSelected && styles.interestChipSelected,
                      pressed && styles.buttonInactive,
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        isSelected && styles.interestTextSelected,
                      ]}
                    >
                      {interest}
                    </Text>
                  </Pressable>
                )
              })}
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
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  brand: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '400',
    color: '#111111',
    marginBottom: 20,
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
    marginTop: 10,
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
  interestChip: {
    minWidth: 92,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  interestChipSelected: {
    borderColor: '#36A7F8',
    backgroundColor: '#36A7F8',
  },
  interestText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#111111',
  },
  interestTextSelected: {
    color: '#ffffff',
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
