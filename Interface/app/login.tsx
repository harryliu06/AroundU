import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import {router} from 'expo-router'

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

      router.replace('/')
    } catch (error) {
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
    await new Promise((resolve) => setTimeout(resolve, 900))

    setError(null)
    setIsSubmitting(false)
    
    await handleLogin()
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Fahhhhh</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={form.email}
            editable={!isSubmitting}
            onChangeText={(value) => {
              setForm((prev) => ({ ...prev, email: value }))
              if (error) {
                setError(null)
              }
            }}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            autoComplete="current-password"
            secureTextEntry
            value={form.password}
            editable={!isSubmitting}
            onChangeText={(value) => {
              setForm((prev) => ({ ...prev, password: value }))
              if (error) {
                setError(null)
              }
            }}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!canSubmit || pressed) && styles.buttonDisabled,
          ]}
          disabled={!canSubmit}
          onPress={() => {
            void handleSubmit()
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </Pressable>

        <Text style={[styles.message, error ? styles.errorMessage : null]}>
          {error ?? statusMessage ?? ' '}
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    marginTop: 12,
    minHeight: 20,
    color: '#0369a1',
    fontSize: 14,
  },
  errorMessage: {
    color: '#b91c1c',
  },
})
