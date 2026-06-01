import assert from 'node:assert/strict'
import test from 'node:test'

import User from '../database/user.js'
import { getUserByToken, loginUser, signupUser } from '../logic/userLogic.js'

test('signupUser rejects missing email and password', async () => {
  const result = await signupUser({
    email: '',
    password: '',
    profile: {
      fullName: 'Test User',
      age: 21,
      interests: ['Music', 'Coffee', 'Gaming'],
    },
  })

  assert.equal(result.status, 400)
  assert.equal(result.body.message, 'Email and password are required.')
})

test('signupUser rejects passwords shorter than 8 characters', async () => {
  const result = await signupUser({
    email: 'test@example.com',
    password: 'invalid',
    profile: {
      fullName: 'Test User',
      age: 21,
      interests: ['Music', 'Coffee', 'Gaming'],
    },
  })

  assert.equal(result.status, 400)
  assert.equal(result.body.message, 'Password must be at least 8 characters.')
})

test('signupUser rejects duplicate email', async () => {
  const originalFindOne = User.findOne

  try {
    User.findOne = async () => ({
      id: 'existing-user-id',
      email: 'test@example.com',
    })

    const result = await signupUser({
      email: 'test@example.com',
      password: 'password123',
      profile: {
        fullName: 'Test User',
        age: 21,
        interests: ['Music', 'Coffee', 'Gaming'],
      },
    })

    assert.equal(result.status, 409)
    assert.equal(result.body.message, 'An account with this email already exists.')
  } finally {
    User.findOne = originalFindOne
  }
})

test('signupUser accepts a valid email format', async () => {
  const originalFindOne = User.findOne
  const originalCreate = User.create

  try {
    User.findOne = async () => null
    User.create = async (user) => ({
      id: 'new-user-id',
      email: user.email,
      profile: user.profile,
    })

    const result = await signupUser({
      email: 'Student.User@example.com',
      password: 'password123',
      profile: {
        fullName: 'Test User',
        age: 21,
        interests: ['Music', 'Coffee', 'Gaming'],
      },
    })

    assert.equal(result.status, 201)
    assert.equal(result.body.message, 'Account created successfully')
    assert.equal(result.body.user.email, 'student.user@example.com')
    assert.ok(result.body.token)
  } finally {
    User.findOne = originalFindOne
    User.create = originalCreate
  }
})

test('loginUser rejects unknown email', async () => {
  const originalFindOne = User.findOne

  try {
    User.findOne = async () => null

    const result = await loginUser({
      email: 'missing@example.com',
      password: 'password123',
    })

    assert.equal(result.status, 401)
    assert.equal(result.body.message, 'Invalid Email')
  } finally {
    User.findOne = originalFindOne
  }
})

test('getUserByToken rejects missing authorization token', async () => {
  const result = await getUserByToken('')

  assert.equal(result.status, 401)
  assert.equal(result.body.message, 'Authorization token is required.')
})
