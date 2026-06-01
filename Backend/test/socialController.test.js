import assert from 'node:assert/strict'
import test from 'node:test'

import { signupUser, getUserByToken } from '../logic/userLogic.js'
import {
  blockUser,
  listBlockedUsers,
  unblockUser,
  sendMessage,
} from '../controllers/socialController.js'

function mockResponse() {
  return {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code
      return this
    },

    json(body) {
      this.body = body
      return this
    },
  }
}

async function createTestUser(label) {
  const email = `${label}-${Date.now()}-${Math.random()}@example.com`

  const signupResult = await signupUser({
    email,
    password: 'password123',
    profile: {
      fullName: `Test ${label}`,
      age: 21,
      interests: ['Music', 'Coffee', 'Gaming'],
    },
  })

  assert.ok([200, 201].includes(signupResult.status))

  const token = signupResult.body.token
  assert.ok(token)

  const userResult = await getUserByToken(token)
  assert.equal(userResult.status, 200)

  const user = userResult.body.user ?? userResult.body

  return {
    token,
    user,
    id: String(user.id ?? user._id),
  }
}

function listContainsUser(blockedUsers, userId) {
  return blockedUsers.some((user) => {
    const id = String(user.id ?? user._id ?? user.userId)
    return id === String(userId)
  })
}

