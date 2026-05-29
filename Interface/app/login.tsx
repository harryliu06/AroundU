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
import FontAwesome from '@expo/vector-icons/FontAwesome'

import { router } from 'expo-router'

const API_URL = 'http://192.168.1.181:8000'

type LoginForm = {
  email: string
  password: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: LoginForm): string | null {
  if (!form.email.trim() || !form.password.trim()) {
    return 'Email and password are required.'
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    return 'Please enter a valid email address.'
  }

  return null
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return !isSubmitting && form.email.trim() !== '' && form.password.trim() !== ''
  }, [form.email, form.password, isSubmitting])

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'An error occurred while logging in.')
        return
      }

      const profileImage = data.user?.profile?.profileImage

      router.replace({
        pathname: '/home',
        params: {
          userId: String(data.user?.id ?? ''),
          token: data.token,
          fullName: data.user?.profile?.fullName,
          bio: data.user?.profile?.bio,
          interests: JSON.stringify(data.user?.profile?.interests ?? []),
          ...(profileImage ? { profileImage } : {}),
        },
      })
    } catch (e) {
      setError('Network error. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    setStatusMessage(null)
    const validationError = validate(form)

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)

    // small UI delay to show loading indicator
    await new Promise((resolve) => setTimeout(resolve, 400))

    await handleLogin()
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter your email to sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={form.email}
              editable={!isSubmitting}
              onChangeText={(value) => {
                setForm((prev) => ({ ...prev, email: value }))
                if (error) setError(null)
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              autoComplete="password"
              secureTextEntry
              value={form.password}
              editable={!isSubmitting}
              onChangeText={(value) => {
                setForm((prev) => ({ ...prev, password: value }))
                if (error) setError(null)
              }}
            />

            <Text style={[styles.message, error ? styles.errorMessage : null]}>
              {error ?? statusMessage ?? ' '}
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
                <Text style={styles.primaryButtonText}>Login</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [styles.socialButton, pressed && styles.buttonInactive]}
              disabled={isSubmitting}
              onPress={() => setStatusMessage('Google sign-in is not wired yet.')}
            >
              <FontAwesome
                name="google"
                size={18}
                color="#ffffff"
                style={styles.socialIconSpacing}
              />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.socialButton, pressed && styles.buttonInactive]}
              disabled={isSubmitting}
              onPress={() => setStatusMessage('Apple sign-in is not wired yet.')}
            >
              <FontAwesome
                name="apple"
                size={20}
                color="#ffffff"
                style={styles.socialIconSpacing}
              />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </Pressable>

            <Pressable
              style={styles.forgotButton}
              onPress={() => setStatusMessage('Password reset flow not implemented.') }
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.signupText}>Don't have account? </Text>
            <Pressable onPress={() => router.push('/createProfile')}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#8a8a8a',
  },
  socialButton: {
    height: 40,
    borderRadius: 9,
    backgroundColor: '#36A7F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  socialIconSpacing: {
    marginRight: 8,
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  forgotButton: {
    alignItems: 'center',
  },
  forgotText: {
    marginTop: 8,
    color: '#2563eb',
    textAlign: 'center',
    fontWeight: '600',
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
  footerRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#6b7280',
  },
  signupLink: {
    color: '#2563eb',
    fontWeight: '700',
    marginLeft: 4,
  },
})
