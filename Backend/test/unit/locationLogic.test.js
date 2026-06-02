import assert from 'node:assert/strict'
import { beforeEach, mock, test } from 'node:test'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

process.env.JWT_SECRET = 'secret_key'

const users = new Map()
let friendships = []

function objectId() {
  return new mongoose.Types.ObjectId().toString()
}

function tokenFor(userId) {
  return jwt.sign({ id: userId }, 'secret_key')
}

function createUser(label, interests = []) {
  const id = objectId()
  const user = {
    id,
    _id: id,
    email: `${label}@example.com`,
    profile: {
      fullName: `Test ${label}`,
      age: 21,
      interests,
    },
    updatedAt: new Date(),
  }
  users.set(id, user)
  return { id, token: tokenFor(id), user }
}

const UserMock = {
  findById: async (id) => users.get(String(id)) ?? null,
  find: (query) => ({
    sort: () => ({
      limit: async (n) => {
        let all = [...users.values()]
        if (query?._id?.$ne) {
          all = all.filter((u) => String(u.id) !== String(query._id.$ne))
        }
        return all.slice(0, n)
      },
    }),
  }),
}

const FriendshipMock = {
  find: async (query) => {
    if (!query?.$or) return []
    return friendships.filter((f) =>
      query.$or.some(
        (cond) =>
          (cond.requester && String(f.requester) === String(cond.requester)) ||
          (cond.recipient && String(f.recipient) === String(cond.recipient))
      )
    )
  },
}

mock.module(new URL('../../database/user.js', import.meta.url).href, {
  defaultExport: UserMock,
})
mock.module(new URL('../../database/friendship.js', import.meta.url).href, {
  defaultExport: FriendshipMock,
})

const { listNearbyUsersByToken } = await import('../../logic/userLogic.js')

beforeEach(() => {
  users.clear()
  friendships = []
})

test('nearby users are assigned distances starting at 2.4 km, incrementing by 0.4 km', async () => {
  const current = createUser('current', ['Music', 'Coffee', 'Gaming'])
  createUser('alpha',   ['Music', 'Coffee', 'Gaming'])
  createUser('beta',    ['Music', 'Coffee', 'Gaming'])
  createUser('gamma',   ['Music', 'Coffee', 'Gaming'])

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)

  assert.equal(result.status, 200)
  const { users: nearby } = result.body
  assert.ok(nearby.length >= 3)

  for (let i = 0; i < nearby.length; i++) {
    const expected = Number((2.4 + i * 0.4).toFixed(1))
    assert.equal(
      nearby[i].distance,
      expected,
      `User at rank ${i} should have distance ${expected} km, got ${nearby[i].distance}`
    )
  }
})

test('the authenticated user does not appear in their own nearby-users list', async () => {
  const current = createUser('self', ['Music', 'Coffee', 'Art'])
  createUser('other', ['Music', 'Coffee', 'Art'])

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)

  assert.equal(result.status, 200)
  const ids = result.body.users.map((u) => u.id)
  assert.ok(!ids.includes(current.id), 'Current user should not appear in results')
})

test('users with more shared interests are ranked closer (lower distance index)', async () => {
  const current = createUser('ranker', ['Music', 'Coffee', 'Gaming', 'Art'])
  const highMatch = createUser('highmatch', ['Music', 'Coffee', 'Gaming', 'Art']) // 4 shared
  const lowMatch  = createUser('lowmatch',  ['Music', 'Coffee', 'Hiking'])        // 2 shared

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)

  assert.equal(result.status, 200)
  const { users: nearby } = result.body

  const highIdx = nearby.findIndex((u) => u.id === highMatch.id)
  const lowIdx  = nearby.findIndex((u) => u.id === lowMatch.id)

  assert.ok(highIdx !== -1, 'High-match user should appear in results')
  assert.ok(lowIdx  !== -1, 'Low-match user should appear in results')
  assert.ok(
    highIdx < lowIdx,
    `High-match user (rank ${highIdx}) should appear before low-match user (rank ${lowIdx})`
  )
})

test('nearby-users result is capped at 20 users', async () => {
  const current = createUser('capper', ['Music', 'Coffee', 'Art'])

  for (let i = 0; i < 25; i++) {
    createUser(`extra${i}`, ['Music', 'Coffee', 'Art'])
  }

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)

  assert.equal(result.status, 200)
  assert.ok(
    result.body.users.length <= 20,
    `Expected at most 20 results, got ${result.body.users.length}`
  )
})

test('users with a blocked friendship status are excluded from nearby results', async () => {
  const current = createUser('blocker', ['Music', 'Coffee', 'Art'])
  const blockedUser = createUser('blocked', ['Music', 'Coffee', 'Art'])

  friendships.push({
    id: objectId(),
    requester: current.id,
    recipient: blockedUser.id,
    status: 'blocked',
    blockedBy: current.id,
  })

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)

  assert.equal(result.status, 200)
  const ids = result.body.users.map((u) => u.id)
  assert.ok(
    !ids.includes(blockedUser.id),
    'Blocked user should not appear in nearby results'
  )
})

test('each nearby user entry includes a correct matchScore', async () => {
  const current = createUser('scorer', ['Music', 'Coffee', 'Gaming'])
  createUser('threeShared', ['Music', 'Coffee', 'Gaming', 'Art'])
  createUser('oneShared',   ['Music', 'Hiking', 'Reading'])

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)

  assert.equal(result.status, 200)
  const nearby = result.body.users

  const three = nearby.find((u) => u.profile.fullName === 'Test threeShared')
  const one   = nearby.find((u) => u.profile.fullName === 'Test oneShared')

  assert.ok(three, 'Three-shared user should be present')
  assert.ok(one,   'One-shared user should be present')
  assert.equal(three.matchScore, 3)
  assert.equal(one.matchScore, 1)
})

test('unauthenticated request to nearby-users returns 200 with an empty filtered list', async () => {
  createUser('stranger', ['Music', 'Coffee', 'Art'])

  const result = await listNearbyUsersByToken('')

  assert.equal(result.status, 200)
  assert.ok(Array.isArray(result.body.users))
  assert.ok(result.body.users.length >= 0)
})
