import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams } from 'expo-router'

type Message = {
  id: number
  text: string
  time: string
  sender: 'me' | 'them'
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    sender: 'them',
    text: 'Hey, I saw we both like music and coffee.',
    time: '9:41 AM',
  },
  {
    id: 2,
    sender: 'me',
    text: 'Nice. I am always down to find a good coffee spot nearby.',
    time: '9:42 AM',
  },
  {
    id: 3,
    sender: 'them',
    text: 'There is a cafe near campus that usually has live music on Fridays.',
    time: '9:44 AM',
  },
]

export default function Chat() {
  const params = useLocalSearchParams<{
    fullName?: string
    profileImage?: string
  }>()
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const messagesScrollRef = useRef<ScrollView | null>(null)

  const fullName = params.fullName || 'Nearby User'
  const rawProfileImage = params.profileImage?.trim()
  const profileImage =
    rawProfileImage &&
    rawProfileImage !== 'undefined' &&
    rawProfileImage !== 'null' &&
    /^(https?:|file:|data:)/.test(rawProfileImage)
      ? rawProfileImage
      : null
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

  const scrollToLatestMessage = (animated = true) => {
    setTimeout(() => {
      messagesScrollRef.current?.scrollToEnd({ animated })
    }, 50)
  }

  useEffect(() => {
    scrollToLatestMessage()
  }, [messages.length])

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      scrollToLatestMessage()
    })

    return () => {
      showSubscription.remove()
    }
  }, [])

  const handleSend = () => {
    const text = messageText.trim()

    if (!text) return

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: 'me',
        text,
        time: 'Now',
      },
    ])
    setMessageText('')
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.iconButton, pressed && styles.buttonInactive]}
              onPress={() => router.back()}
            >
              <FontAwesome name="angle-left" size={24} color="#111111" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.contact, pressed && styles.buttonInactive]}
              onPress={() =>
                router.push({
                  pathname: '/userProfile',
                  params: {
                    fullName,
                    ...(profileImage ? { profileImage } : {}),
                  },
                })
              }
            >
              <View style={styles.avatar}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitials}>{initials}</Text>
                )}
              </View>
              <View style={styles.contactText}>
                <Text style={styles.name} numberOfLines={1}>
                  {fullName}
                </Text>
                <Text style={styles.status}>Active nearby</Text>
              </View>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.buttonInactive]}>
              <FontAwesome name="ellipsis-v" size={18} color="#111111" />
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardArea}
          >
            <ScrollView
              ref={messagesScrollRef}
              style={styles.messages}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollToLatestMessage(false)}
            >
              <Text style={styles.dayLabel}>Today</Text>

              {messages.map((message) => {
                const isMine = message.sender === 'me'

                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageRow,
                      isMine ? styles.myMessageRow : styles.theirMessageRow,
                    ]}
                  >
                    {!isMine ? (
                      <View style={styles.smallAvatar}>
                        {profileImage ? (
                          <Image source={{ uri: profileImage }} style={styles.smallAvatarImage} />
                        ) : (
                          <Text style={styles.smallAvatarInitials}>{initials}</Text>
                        )}
                      </View>
                    ) : null}

                    <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                      <Text style={[styles.messageText, isMine && styles.myMessageText]}>
                        {message.text}
                      </Text>
                      <Text style={[styles.messageTime, isMine && styles.myMessageTime]}>
                        {message.time}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </ScrollView>

            <View style={styles.composer}>
              <Pressable style={styles.composerIcon}>
                <FontAwesome name="plus" size={15} color="#36A7F8" />
              </Pressable>
              <TextInput
                style={styles.input}
                placeholder="Message"
                placeholderTextColor="#9ca3af"
                value={messageText}
                onChangeText={setMessageText}
                onFocus={() => scrollToLatestMessage()}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  (!messageText.trim() || pressed) && styles.buttonInactive,
                ]}
                disabled={!messageText.trim()}
                onPress={handleSend}
              >
                <FontAwesome name="paper-plane" size={15} color="#ffffff" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  header: {
    height: 104,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  keyboardArea: {
      flex: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  contactText: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  status: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 17,
    marginTop: 2,
  },
  messages: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messagesContent: {
    paddingHorizontal: 18,
      paddingTop: 18,
  },
  dayLabel: {
    alignSelf: 'center',
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 18,
  },
  messageRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 14,
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 8,
    marginTop: 4,
  },
  smallAvatarImage: {
    width: '100%',
    height: '100%',
  },
  smallAvatarInitials: {
    color: '#36A7F8',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '76%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  theirBubble: {
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 6,
  },
  myBubble: {
    backgroundColor: '#36A7F8',
    borderTopRightRadius: 6,
  },
  messageText: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 21,
  },
  myMessageText: {
    color: '#ffffff',
  },
  messageTime: {
    color: '#6b7280',
    fontSize: 11,
    lineHeight: 14,
    marginTop: 5,
  },
  myMessageTime: {
    color: '#e0f2fe',
    textAlign: 'right',
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  composerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    paddingHorizontal: 14,
    color: '#111111',
    fontSize: 15,
    backgroundColor: '#ffffff',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#36A7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  buttonInactive: {
    opacity: 0.72,
  },
})
