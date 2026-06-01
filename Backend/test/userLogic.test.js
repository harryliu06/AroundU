import assert from 'node:assert/strict'
import test from 'node:test'

import { signupUser } from '../logic/userLogic.js'

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
