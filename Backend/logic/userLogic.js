import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import Friendship from '../database/friendship.js'
import User from '../database/user.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function normalizeInterests(interests) {
  if (!Array.isArray(interests)) {
    return []
  }

  const normalized = interests
    .map((interest) => String(interest).trim())
    .filter(Boolean)

  return normalized.filter((interest, index) => {
    const lowerInterest = interest.toLowerCase()
    return normalized.findIndex((item) => item.toLowerCase() === lowerInterest) === index
  })
}

function getPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    profile: user.profile,
  }
}

function createToken(user) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' })
}

function buildAuthResponse(message, user) {
  return {
    message,
    token: createToken(user),
    user: getPublicUser(user),
  }
}

function validateProfile(profile) {
  const interests = normalizeInterests(profile?.interests)

  return Boolean(
    profile &&
      String(profile.fullName || '').trim() &&
      profile.age !== undefined &&
      profile.age !== null &&
      interests.length >= 3
  )
}

export async function signupUser({ email, password, profile }) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !password) {
    return { status: 400, body: { message: 'Email and password are required.' } }
  }

  if (password.length < 8) {
    return { status: 400, body: { message: 'Password must be at least 8 characters.' } }
  }

  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser) {
    return { status: 409, body: { message: 'An account with this email already exists.' } }
  }

  if (!validateProfile(profile)) {
    return { status: 400, body: { message: 'Profile information is required.' } }
  }

  const interests = normalizeInterests(profile.interests)

  const user = await User.create({
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
    profile: {
      fullName: String(profile.fullName).trim(),
      age: Number(profile.age),
      schoolOrWork: String(profile.schoolOrWork || '').trim(),
      bio: String(profile.bio || '').trim(),
      interests,
      profileImage: String(profile.profileImage || '').trim(),
    },
  })

  return {
    status: 201,
    body: buildAuthResponse('Account created successfully', user),
  }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const user = await User.findOne({ email: normalizedEmail })

  if (!user) {
    return { status: 401, body: { message: 'Invalid Email' } }
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    return { status: 401, body: { message: 'Invalid Password' } }
  }

  return {
    status: 200,
    body: buildAuthResponse('Login successful', user),
  }
}

export async function getUserById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { status: 400, body: { message: 'Invalid user id.' } }
  }

  const user = await User.findById(id)

  if (!user) {
    return { status: 404, body: { message: 'User not found.' } }
  }

  return {
    status: 200,
    body: { user: getPublicUser(user) },
  }
}

export async function getUserByToken(authorizationHeader) {
  const token = String(authorizationHeader || '').replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return { status: 401, body: { message: 'Authorization token is required.' } }
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(payload.id)

    if (!user) {
      return { status: 404, body: { message: 'User not found.' } }
    }

    return {
      status: 200,
      body: { user: getPublicUser(user) },
    }
  } catch (error) {
    return {
      status: 401,
      body: { message: 'Invalid or expired token.', detail: error.message },
    }
  }
}

export async function updateUserProfileByToken(authorizationHeader, profile) {
  const token = String(authorizationHeader || '').replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return { status: 401, body: { message: 'Authorization token is required.' } }
  }

  if (!validateProfile(profile)) {
    return { status: 400, body: { message: 'Profile information is required.' } }
  }

  const age = Number(profile.age)

  if (!Number.isInteger(age) || age < 16 || age > 100) {
    return { status: 400, body: { message: 'Please enter a valid age.' } }
  }

  const interests = normalizeInterests(profile.interests)

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findByIdAndUpdate(
      payload.id,
      {
        profile: {
          fullName: String(profile.fullName).trim(),
          age,
          schoolOrWork: String(profile.schoolOrWork || '').trim(),
          bio: String(profile.bio || '').trim(),
          interests,
          profileImage: String(profile.profileImage || '').trim(),
        },
      },
      { new: true, runValidators: true }
    )

    if (!user) {
      return { status: 404, body: { message: 'User not found.' } }
    }

    return {
      status: 200,
      body: {
        message: 'Profile updated successfully',
        user: getPublicUser(user),
      },
    }
  } catch {
    return { status: 401, body: { message: 'Invalid or expired token.' } }
  }
}

export async function listNearbyUsersByToken(authorizationHeader) {
  const token = String(authorizationHeader || '').replace(/^Bearer\s+/i, '').trim()
  let currentUserId = null
  let currentInterests = []

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET)
      currentUserId = payload.id
      const currentUser = await User.findById(currentUserId)
      currentInterests = normalizeInterests(currentUser?.profile?.interests)
    } catch {
      currentUserId = null
      currentInterests = []
    }
  }

  const query = currentUserId ? { _id: { $ne: currentUserId } } : {}
  const users = await User.find(query).sort({ updatedAt: -1 }).limit(100)
  const friendships = currentUserId
    ? await Friendship.find({
        $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      })
    : []
  const friendshipByUserId = new Map()

  friendships.forEach((friendship) => {
    const otherUserId =
      String(friendship.requester) === String(currentUserId)
        ? String(friendship.recipient)
        : String(friendship.requester)

    friendshipByUserId.set(otherUserId, friendship.status)
  })

  return {
    status: 200,
    body: {
      users: users
        .map((user) => {
          const userInterests = normalizeInterests(user.profile?.interests)
          const sharedInterests = currentInterests.length
            ? userInterests.filter((interest) =>
                currentInterests.some(
                  (currentInterest) => currentInterest.toLowerCase() === interest.toLowerCase()
                )
              )
            : []

          return {
            ...getPublicUser(user),
            sharedInterests,
            matchScore: sharedInterests.length,
            friendStatus: friendshipByUserId.get(String(user.id)) || 'none',
          }
        })
        .filter((user) => user.friendStatus !== 'blocked')
        .filter((user) => !currentInterests.length || user.sharedInterests.length > 0)
        .sort((firstUser, secondUser) => secondUser.matchScore - firstUser.matchScore)
        .slice(0, 20)
        .map((user, index) => ({
          ...user,
          distance: Number((2.4 + index * 0.4).toFixed(1)),
        })),
    },
  }
}
