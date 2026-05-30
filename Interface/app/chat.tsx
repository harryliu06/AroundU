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

const API_URL = 'http://192.168.1.181:8000'

type Message = {
  id: string
  text: string
  time: string
  sender: 'me' | 'them'
}

const MEETUP_OPTIONS = [
  {
    id: 'directions',
    icon: 'map-signs',
    title: 'Meet-up directions',
    action: 'directions',
    message: 'I will come to your location. Can you share your location so I can find you?',
  },
  {
    id: 'location',
    icon: 'location-arrow',
    title: 'Share location',
    action: 'location',
    message: 'I can share my current location for the meet-up.',
  },
  {
    id: 'spot',
    icon: 'coffee',
    title: 'Suggest a spot',
    action: 'message',
    message: 'Want to meet at a nearby coffee spot?',
  },
] as const

export default function Chat() {
  const params = useLocalSearchParams<{
    friendId?: string
    fullName?: string
    profileImage?: string
    token?: string
  }>()
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const messagesScrollRef = useRef<ScrollView | null>(null)

  const fullName = params.fullName || 'Nearby User'
  const friendId = params.friendId
  const token = params.token
  const canPersistChat = Boolean(friendId && token)
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

  useEffect(() => {
    const loadMessages = async () => {
      if (!canPersistChat) {
        setStatusMessage(null)
        return
      }

      try {
        const response = await fetch(`${API_URL}/chats/${friendId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()

        if (!response.ok) {
          setMessages([])
          setStatusMessage(data.message || 'Add this user as a friend to save chat history.')
          return
        }

        const loadedMessages = Array.isArray(data.messages) ? data.messages : []
        setMessages(
          loadedMessages.map((message: any) => ({
            id: String(message._id || message.id),
            text: String(message.text || ''),
            time: message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : 'Now',
            sender: String(message.sender) === String(friendId) ? 'them' : 'me',
          }))
        )
        setStatusMessage(
          loadedMessages.length ? null : 'You are friends now. Start the saved conversation.'
        )
      } catch {
        setStatusMessage('Network error loading chat history.')
      }
    }

    void loadMessages()
  }, [canPersistChat, friendId, token])

  const persistMessage = async (text: string) => {
    if (!canPersistChat) return false

    try {
      const response = await fetch(`${API_URL}/chats/${friendId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })
      const data = await response.json()

      if (!response.ok) {
        setStatusMessage(data.message || 'Message was not saved.')
        return false
      }

      setStatusMessage(null)
      return data.message
    } catch {
      setStatusMessage('Network error. Message was not saved.')
      return false
    }
  }

  const handleSend = async () => {
    const text = messageText.trim()

    if (!text) return

    const savedMessage = await persistMessage(text)

    setMessages((prev) => [
      ...prev,
      {
        id: savedMessage ? String(savedMessage._id || savedMessage.id) : `local-${Date.now()}`,
        sender: 'me',
        text,
        time: savedMessage?.createdAt
          ? new Date(savedMessage.createdAt).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'Now',
      },
    ])
    setMessageText('')
    setIsOptionsOpen(false)
  }

  const sendChatMessage = async (text: string) => {
    const savedMessage = await persistMessage(text)

    setMessages((prev) => [
      ...prev,
      {
        id: savedMessage ? String(savedMessage._id || savedMessage.id) : `local-${Date.now()}`,
        sender: 'me',
        text,
        time: savedMessage?.createdAt
          ? new Date(savedMessage.createdAt).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'Now',
      },
    ])
  }

  const handleMeetupOption = async (option: (typeof MEETUP_OPTIONS)[number]) => {
    if (option.action === 'directions') {
      setIsOptionsOpen(false)
      Keyboard.dismiss()
      router.push({
        pathname: '/meetupDirections',
        params: {
          fullName,
          ...(profileImage ? { profileImage } : {}),
        },
      })
      return
    }

    sendChatMessage(option.message)
    setIsOptionsOpen(false)
    Keyboard.dismiss()
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
              {statusMessage ? <Text style={styles.chatStatus}>{statusMessage}</Text> : null}

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

            {isOptionsOpen ? (
              <View style={styles.optionsBox}>
                {MEETUP_OPTIONS.map((option) => (
                  <Pressable
                    key={option.id}
                    style={({ pressed }) => [styles.optionRow, pressed && styles.buttonInactive]}
                    onPress={() => {
                      void handleMeetupOption(option)
                    }}
                  >
                    <View style={styles.optionIcon}>
                      <FontAwesome name={option.icon} size={15} color="#36A7F8" />
                    </View>
                    <Text style={styles.optionText}>{option.title}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.composer}>
              <Pressable
                style={({ pressed }) => [
                  styles.composerIcon,
                  isOptionsOpen && styles.composerIconActive,
                  pressed && styles.buttonInactive,
                ]}
                onPress={() => setIsOptionsOpen((prev) => !prev)}
              >
                <FontAwesome name="plus" size={15} color="#36A7F8" />
              </Pressable>
              <TextInput
                style={styles.input}
                placeholder="Message"
                placeholderTextColor="#9ca3af"
                value={messageText}
                onChangeText={(value) => {
                  setMessageText(value)
                  if (isOptionsOpen) setIsOptionsOpen(false)
                }}
                onFocus={() => {
                  setIsOptionsOpen(false)
                  scrollToLatestMessage()
                }}
                returnKeyType="send"
                onSubmitEditing={() => {
                  void handleSend()
                }}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  (!messageText.trim() || pressed) && styles.buttonInactive,
                ]}
                disabled={!messageText.trim()}
                onPress={() => {
                  void handleSend()
                }}
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
  chatStatus: {
    alignSelf: 'center',
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 18,
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
  optionsBox: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  optionRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionText: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
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
  composerIconActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#36A7F8',
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
