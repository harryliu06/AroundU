import assert from 'node:assert/strict'
import test from 'node:test'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import app from '../../app.js'
import User from '../../database/user.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

async function withTestServer(runTest) {
  const server = app.listen(0)
  const port = server.address().port
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    await runTest(baseUrl)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}

test('POST /signup creates an account and returns auth data', async () => {
  const originalFindOne = User.findOne
  const originalCreate = User.create

  try {
    User.findOne = async () => null
    User.create = async (user) => ({
      id: 'signup-user-id',
      email: user.email,
      profile: user.profile,
    })

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'Route.User@example.com',
          password: 'password123',
          profile: {
            fullName: 'Route User',
            age: 21,
            interests: ['Music', 'Coffee', 'Gaming'],
          },
        }),
      })
      const data = await response.json()

      assert.equal(response.status, 201)
      assert.equal(data.message, 'Account created successfully')
      assert.equal(data.user.email, 'route.user@example.com')
      assert.ok(data.token)
    })
  } finally {
    User.findOne = originalFindOne
    User.create = originalCreate
  }
})

test('POST /login returns a token for valid credentials', async () => {
  const originalFindOne = User.findOne
  const hashedPassword = await bcrypt.hash('password123', 10)

  try {
    User.findOne = async () => ({
      id: 'login-user-id',
      email: 'login@example.com',
      password: hashedPassword,
      profile: {
        fullName: 'Login User',
        age: 22,
        interests: ['Study', 'Food', 'Movies'],
      },
    })

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'password123',
        }),
      })
      const data = await response.json()

      assert.equal(response.status, 200)
      assert.equal(data.message, 'Login successful')
      assert.equal(data.user.email, 'login@example.com')
      assert.ok(data.token)
    })
  } finally {
    User.findOne = originalFindOne
  }
})

test('GET /me rejects missing authorization token', async () => {
  await withTestServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/me`)
    const data = await response.json()

    assert.equal(response.status, 401)
    assert.equal(data.message, 'Authorization token is required.')
  })
})

test('GET /me rejects expired authorization token', async () => {
  const expiredToken = jwt.sign({ id: 'expired-user-id' }, JWT_SECRET, { expiresIn: '-1s' })

  await withTestServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    })
    const data = await response.json()

    assert.equal(response.status, 401)
    assert.equal(data.message, 'Invalid or expired token.')
  })
})
