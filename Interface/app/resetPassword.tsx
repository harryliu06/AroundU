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
import { router, useLocalSearchParams } from 'expo-router'
import { apiJson } from '../utils/api'

export default function ResetPassword() {
  const params = useLocalSearchParams<{ email?: string }>()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      !isSubmitting &&
      code.trim().length >= 6 &&
      password.trim().length >= 8 &&
      confirmPassword.trim().length >= 8
    )
  }, [code, confirmPassword, password, isSubmitting])

  const handleSubmit = async () => {
    if (!params.email) {
      setMessage('Please request a reset code again.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const { response, data } = await apiJson('/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.email,
          code: code.trim(),
          newPassword: password,
        }),
      })

      if (!response.ok) {
        setMessage(data.message || 'Could not reset password.')
        return
      }

      router.replace('/login')
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

            <Text style={styles.brand}>New Password</Text>

            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Enter Reset Code</Text>
            <Text style={styles.subtitle}>Use the code sent to {params.email || 'your email'}</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              editable={!isSubmitting}
              onChangeText={(value) => {
                setCode(value.replace(/\D/g, ''))
                if (message) setMessage(null)
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#9ca3af"
              autoComplete="new-password"
              secureTextEntry
              value={password}
              editable={!isSubmitting}
              onChangeText={(value) => {
                setPassword(value)
                if (message) setMessage(null)
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#9ca3af"
              autoComplete="new-password"
              secureTextEntry
              value={confirmPassword}
              editable={!isSubmitting}
              onChangeText={(value) => {
                setConfirmPassword(value)
                if (message) setMessage(null)
              }}
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
                <Text style={styles.primaryButtonText}>Reset Password</Text>
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
  container: {
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
  header: {
    alignItems: 'center',
    marginTop: 70,
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
})
