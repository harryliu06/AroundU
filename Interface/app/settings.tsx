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
import { clearAuthSession } from '../utils/authStorage'

type SettingRowProps = {
  icon: string
  title: string
  value?: string
  onPress?: () => void
  isDanger?: boolean
}

function SettingRow({ icon, title, value, onPress, isDanger = false }: SettingRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, pressed && styles.buttonInactive]}
      onPress={onPress}
    >
      <View style={[styles.settingIcon, isDanger && styles.dangerIcon]}>
        <FontAwesome name={icon} size={15} color={isDanger ? '#dc2626' : '#36A7F8'} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, isDanger && styles.dangerText]}>{title}</Text>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
      </View>
      {onPress ? (
        <FontAwesome name="angle-right" size={18} color={isDanger ? '#dc2626' : '#9ca3af'} />
      ) : null}
    </Pressable>
  )
}

export default function Settings() {
  const params = useLocalSearchParams<{
    fullName?: string
    bio?: string
    interests?: string
    profileImage?: string
  }>()

  const fullName = params.fullName || 'AroundU User'
  const rawProfileImage = params.profileImage?.trim()
  const profileImage =
    rawProfileImage &&
    rawProfileImage !== 'undefined' &&
    rawProfileImage !== 'null' &&
    /^(https?:|file:|data:)/.test(rawProfileImage)
      ? rawProfileImage
      : null
  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'AU'

  const handleLogout = async () => {
    await clearAuthSession()
    router.replace('/login')
  }

  const openEditProfile = () => {
    router.push('/editProfile')
  }

  const openNotifications = () => {
    router.push('/notifications')
  }

  const openBlockedUsers = () => {
    router.push('/blockedUsers')
  }

  const openLocationSettings = () => {
    router.push('/location')
  }

  const openPrivacy = () => {
    router.push('/privacy')
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

          <Text style={styles.brand}>Settings</Text>

          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.profilePanel}>
          <View style={styles.avatar}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileSubtitle}>Manage your AroundU account</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.panel}>
            <SettingRow
              icon="user-o"
              title="Profile"
              value="View and edit profile"
              onPress={openEditProfile}
            />
            <SettingRow
              icon="bell-o"
              title="Notifications"
              value="Friend requests and alerts"
              onPress={openNotifications}
            />
            <SettingRow icon="map-marker"
              title="Location"
              value="Nearby discovery settings"
              onPress={openLocationSettings}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.panel}>
            <SettingRow icon="shield" title="Privacy" value="Control who can find you" onPress={openPrivacy} />
            <SettingRow
              icon="ban"
              title="Blocked Users"
              value="Manage blocked profiles"
              onPress={openBlockedUsers}
            />
            <SettingRow icon="question-circle-o" title="Help" value="Support and app info" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.panel}>
            <SettingRow icon="sign-out" title="Log Out" onPress={handleLogout} isDanger />
          </View>
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
  profilePanel: {
    width: '100%',
    maxWidth: 327,
    minHeight: 82,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 9,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 24,
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
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  profileText: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  profileSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  section: {
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  panel: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 9,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  settingRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  settingValue: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  dangerText: {
    color: '#dc2626',
  },
  buttonInactive: {
    opacity: 0.72,
  },
})
