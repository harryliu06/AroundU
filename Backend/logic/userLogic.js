import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { addUser, findUserByEmail, findUserById } from './userStore.js'

const JWT_SECRET = 'secret_key'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
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
  return Boolean(profile?.fullName && profile?.age && Array.isArray(profile?.interests))
}

export async function signupUser({ email, password, profile }) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !password) {
    return { status: 400, body: { message: 'Email and password are required.' } }
  }

  if (password.length < 8) {
    return { status: 400, body: { message: 'Password must be at least 8 characters.' } }
  }

  if (findUserByEmail(normalizedEmail)) {
    return { status: 409, body: { message: 'An account with this email already exists.' } }
  }

  if (!validateProfile(profile)) {
    return { status: 400, body: { message: 'Profile information is required.' } }
  }

  const user = addUser({
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
    profile: {
      fullName: String(profile.fullName).trim(),
      age: Number(profile.age),
      schoolOrWork: String(profile.schoolOrWork || '').trim(),
      bio: String(profile.bio || '').trim(),
      interests: profile.interests.map((interest) => String(interest)).filter(Boolean),
    },
  })

  return {
    status: 201,
    body: buildAuthResponse('Account created successfully', user),
  }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const user = findUserByEmail(normalizedEmail)

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

export function getUserById(id) {
  const user = findUserById(Number(id))

  if (!user) {
    return { status: 404, body: { message: 'User not found.' } }
  }

  return {
    status: 200,
    body: { user: getPublicUser(user) },
  }
}
