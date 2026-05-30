import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import Friendship from '../database/friendship.js'
import Message from '../database/message.js'
import User from '../database/user.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

function getPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    profile: user.profile,
  }
}

function getToken(authorizationHeader) {
  return String(authorizationHeader || '').replace(/^Bearer\s+/i, '').trim()
}

async function getAuthenticatedUser(authorizationHeader) {
  const token = getToken(authorizationHeader)

  if (!token) {
    return { error: { status: 401, body: { message: 'Authorization token is required.' } } }
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(payload.id)

    if (!user) {
      return { error: { status: 404, body: { message: 'User not found.' } } }
    }

    return { user }
  } catch {
    return { error: { status: 401, body: { message: 'Invalid or expired token.' } } }
  }
}

function normalizeFriendPair(firstUserId, secondUserId) {
  return [String(firstUserId), String(secondUserId)].sort()
}

function getConversationKey(firstUserId, secondUserId) {
  return normalizeFriendPair(firstUserId, secondUserId).join(':')
}

function getParticipantKey(firstUserId, secondUserId) {
  return getConversationKey(firstUserId, secondUserId)
}

async function areFriends(firstUserId, secondUserId) {
  const [firstId, secondId] = normalizeFriendPair(firstUserId, secondUserId)

  return Friendship.exists({
    status: 'accepted',
    $or: [
      { requester: firstId, recipient: secondId },
      { requester: secondId, recipient: firstId },
    ],
  })
}

export async function addFriendByToken(authorizationHeader, friendId) {
  const auth = await getAuthenticatedUser(authorizationHeader)

  if (auth.error) return auth.error

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return { status: 400, body: { message: 'Invalid friend id.' } }
  }

  if (String(auth.user.id) === String(friendId)) {
    return { status: 400, body: { message: 'You cannot add yourself as a friend.' } }
  }

  const friend = await User.findById(friendId)

  if (!friend) {
    return { status: 404, body: { message: 'Friend user not found.' } }
  }

  const participantKey = getParticipantKey(auth.user.id, friend.id)
  const existingFriendship = await Friendship.findOne({
    $or: [
      { participantKey },
      { requester: auth.user.id, recipient: friend.id },
      { requester: friend.id, recipient: auth.user.id },
    ],
  })

  if (existingFriendship?.status === 'accepted') {
    return {
      status: 200,
      body: {
        message: 'You are already friends.',
        friendship: existingFriendship,
        friend: getPublicUser(friend),
      },
    }
  }

  if (existingFriendship?.status === 'pending') {
    return {
      status: 200,
      body: {
        message:
          String(existingFriendship.requester) === String(auth.user.id)
            ? 'Friend request already sent.'
            : 'This user already sent you a friend request.',
        friendship: existingFriendship,
        friend: getPublicUser(friend),
      },
    }
  }

  const friendship = await Friendship.create({
    requester: auth.user.id,
    recipient: friend.id,
    status: 'pending',
    participantKey,
  })

  return {
    status: 201,
    body: {
      message: 'Friend request sent.',
      friendship,
      friend: getPublicUser(friend),
    },
  }
}

export async function listFriendsByToken(authorizationHeader) {
  const auth = await getAuthenticatedUser(authorizationHeader)

  if (auth.error) return auth.error

  const friendships = await Friendship.find({
    status: 'accepted',
    $or: [{ requester: auth.user.id }, { recipient: auth.user.id }],
  })
    .populate('requester')
    .populate('recipient')
    .sort({ updatedAt: -1 })

  const friends = friendships.map((friendship) => {
    const friend =
      String(friendship.requester.id) === String(auth.user.id)
        ? friendship.recipient
        : friendship.requester

    return getPublicUser(friend)
  })

  return {
    status: 200,
    body: { friends },
  }
}

export async function getFriendStatusByToken(authorizationHeader, friendId) {
  const auth = await getAuthenticatedUser(authorizationHeader)

  if (auth.error) return auth.error

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return { status: 400, body: { message: 'Invalid friend id.' } }
  }

  const friendship = await Friendship.findOne({
    participantKey: getParticipantKey(auth.user.id, friendId),
  })

  if (!friendship) {
    return { status: 200, body: { status: 'none' } }
  }

  return {
    status: 200,
    body: {
      status: friendship.status,
      direction: String(friendship.requester) === String(auth.user.id) ? 'outgoing' : 'incoming',
      requestId: friendship.id,
    },
  }
}

export async function listFriendRequestsByToken(authorizationHeader) {
  const auth = await getAuthenticatedUser(authorizationHeader)

  if (auth.error) return auth.error

  const requests = await Friendship.find({
    recipient: auth.user.id,
    status: 'pending',
  })
    .populate('requester')
    .sort({ createdAt: -1 })

  return {
    status: 200,
    body: {
      requests: requests.map((request) => ({
        id: request.id,
        requester: getPublicUser(request.requester),
        createdAt: request.createdAt,
      })),
    },
  }
}

export async function acceptFriendRequestByToken(authorizationHeader, requestId) {
  const auth = await getAuthenticatedUser(authorizationHeader)

  if (auth.error) return auth.error

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return { status: 400, body: { message: 'Invalid request id.' } }
  }

  const friendship = await Friendship.findOneAndUpdate(
    {
      _id: requestId,
      recipient: auth.user.id,
      status: 'pending',
    },
    { status: 'accepted' },
    { new: true }
  ).populate('requester')

  if (!friendship) {
    return { status: 404, body: { message: 'Friend request not found.' } }
  }

  return {
    status: 200,
    body: {
      message: 'Friend request accepted.',
      friendship,
      friend: getPublicUser(friendship.requester),
    },
  }
}

export async function sendMessageByToken(authorizationHeader, friendId, text) {
  const auth = await getAuthenticatedUser(authorizationHeader)

  if (auth.error) return auth.error

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return { status: 400, body: { message: 'Invalid friend id.' } }
  }

  const messageText = String(text || '').trim()

  if (!messageText) {
    return { status: 400, body: { message: 'Message text is required.' } }
  }

  const friendshipExists = await areFriends(auth.user.id, friendId)

  if (!friendshipExists) {
    return { status: 403, body: { message: 'You can only message friends.' } }
  }

  const message = await Message.create({
    conversationKey: getConversationKey(auth.user.id, friendId),
    sender: auth.user.id,
    recipient: friendId,
    text: messageText,
  })

  return {
    status: 201,
    body: { message },
  }
}

export async function listMessagesByToken(authorizationHeader, friendId) {
  const auth = await getAuthenticatedUser(authorizationHeader)

  if (auth.error) return auth.error

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return { status: 400, body: { message: 'Invalid friend id.' } }
  }

  const friendshipExists = await areFriends(auth.user.id, friendId)

  if (!friendshipExists) {
    return { status: 403, body: { message: 'You can only view chats with friends.' } }
  }

  const messages = await Message.find({
    conversationKey: getConversationKey(auth.user.id, friendId),
  }).sort({ createdAt: 1 })

  return {
    status: 200,
    body: { messages },
  }
}
