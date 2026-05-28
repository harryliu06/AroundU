import { useMemo, useState } from 'react'
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
import { router, useLocalSearchParams } from 'expo-router'

const API_URL = 'http://192.168.1.181:8000'

type AccountForm = {
  email: string
  password: string
  confirmPassword: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: AccountForm): string | null {
  if (!form.email.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
    return 'Email and password are required.'
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    return 'Please enter a valid email address.'
  }

  if (form.password.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  if (form.password !== form.confirmPassword) {
    return 'Passwords do not match.'
  }

  return null
}

export default function CreateAccount() {
  const profileParams = useLocalSearchParams<{
    fullName?: string
    age?: string
    schoolOrWork?: string
    bio?: string
    interests?: string
  }>()
  const [form, setForm] = useState<AccountForm>({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      !isSubmitting &&
      form.email.trim() !== '' &&
      form.password.trim() !== '' &&
      form.confirmPassword.trim() !== ''
    )
  }, [form.confirmPassword, form.email, form.password, isSubmitting])

  const updateForm = (key: keyof AccountForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (message) setMessage(null)
  }

  const getProfileInterests = () => {
    try {
      const parsed = JSON.parse(profileParams.interests || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const handleSubmit = async () => {
    const validationError = validate(form)
    const profileInterests = getProfileInterests()

    if (validationError) {
      setMessage(validationError)
      return
    }

    if (!profileParams.fullName || !profileParams.age || profileInterests.length === 0) {
      setMessage('Please complete your profile first.')
      return
    }

    setMessage(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          profile: {
            fullName: profileParams.fullName,
            age: profileParams.age,
            schoolOrWork: profileParams.schoolOrWork,
            bio: profileParams.bio,
            interests: profileInterests,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Could not create account.')
        return
      }

      router.replace({
        pathname: '/userProfile',
        params: {
          fullName: data.user.profile.fullName,
          bio: data.user.profile.bio,
          interests: JSON.stringify(data.user.profile.interests),
        },
      })
    } catch {
      setMessage('Network error. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start with your login details</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={form.email}
              editable={!isSubmitting}
              onChangeText={(value) => updateForm('email', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              autoComplete="new-password"
              secureTextEntry
              value={form.password}
              editable={!isSubmitting}
              onChangeText={(value) => updateForm('password', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#9ca3af"
              autoComplete="new-password"
              secureTextEntry
              value={form.confirmPassword}
              editable={!isSubmitting}
              onChangeText={(value) => updateForm('confirmPassword', value)}
            />

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
                void handleSubmit()
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Login</Text>
              </Pressable>
            </View>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  form: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    marginTop: 12,
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
  message: {
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
  footerRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
  },
  footerLink: {
    color: '#2563eb',
    fontWeight: '700',
    marginLeft: 4,
  },
})
