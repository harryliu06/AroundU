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

test('users with no overlapping interests are excluded while those with at least one are included', async () => {
  const current      = createUser('current',      ['Music', 'Coffee', 'Gaming'])
  const inRadius     = createUser('inRadius',      ['Music', 'Yoga', 'Reading'])   // 1 shared: Music
  const alsoIn       = createUser('alsoIn',        ['Coffee', 'Art', 'Hiking'])    // 1 shared: Coffee
  const outOfRadius  = createUser('outOfRadius',   ['Yoga', 'Painting', 'Chess'])  // 0 shared

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)

  assert.equal(result.status, 200)
  const ids = result.body.users.map((u) => u.id)

  assert.ok(ids.includes(inRadius.id),    'User sharing one interest should be in results')
  assert.ok(ids.includes(alsoIn.id),      'User sharing one interest should be in results')
  assert.ok(!ids.includes(outOfRadius.id),'User with no shared interests should be excluded')
})

test('interest matching is case-insensitive across the full nearby-users pipeline', async () => {
  const current  = createUser('ci-current', ['Music', 'Coffee', 'Art'])
  const caseUser = createUser('ci-other',   ['music', 'COFFEE', 'hiking']) // lowercase/uppercase variants

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)

  assert.equal(result.status, 200)
  const found = result.body.users.find((u) => u.id === caseUser.id)

  assert.ok(found, 'Case-insensitive interest match should include the user')
  assert.ok(
    found.sharedInterests.length >= 2,
    `Expected at least 2 shared interests, got ${found.sharedInterests.length}`
  )
})

test('nearby users carry the correct friendStatus reflecting the existing relationship', async () => {
  const current  = createUser('fs-current', ['Music', 'Coffee', 'Art'])
  const stranger = createUser('fs-stranger',['Music', 'Coffee', 'Hiking'])
  const pending  = createUser('fs-pending', ['Music', 'Coffee', 'Reading'])
  const accepted = createUser('fs-accepted',['Music', 'Coffee', 'Gaming'])

  friendships.push({
    id: objectId(),
    requester: current.id,
    recipient: pending.id,
    status: 'pending',
    blockedBy: null,
  })

  friendships.push({
    id: objectId(),
    requester: accepted.id,
    recipient: current.id,
    status: 'accepted',
    blockedBy: null,
  })

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)
  assert.equal(result.status, 200)

  const nearby = result.body.users
  const find = (id) => nearby.find((u) => u.id === id)

  assert.ok(find(stranger.id),  'Stranger should appear in nearby results')
  assert.ok(find(pending.id),   'Pending user should appear in nearby results')
  assert.ok(find(accepted.id),  'Accepted friend should appear in nearby results')

  assert.equal(find(stranger.id).friendStatus,  'none',     'Stranger should have friendStatus "none"')
  assert.equal(find(pending.id).friendStatus,   'pending',  'Pending user should have friendStatus "pending"')
  assert.equal(find(accepted.id).friendStatus,  'accepted', 'Accepted friend should have friendStatus "accepted"')
})

test('nearby users are sorted by descending match score across the full pipeline', async () => {
  const current   = createUser('sort-current', ['Music', 'Coffee', 'Gaming', 'Art', 'Travel'])
  const fiveMatch = createUser('five',  ['Music', 'Coffee', 'Gaming', 'Art', 'Travel']) // 5
  const twoMatch  = createUser('two',   ['Music', 'Coffee', 'Yoga', 'Chess', 'Dance'])  // 2
  const fourMatch = createUser('four',  ['Music', 'Coffee', 'Gaming', 'Art', 'Dance'])  // 4

  const result = await listNearbyUsersByToken(`Bearer ${current.token}`)
  assert.equal(result.status, 200)

  const nearby = result.body.users
  const ranks = { five: -1, four: -1, two: -1 }

  nearby.forEach((u, i) => {
    if (u.id === fiveMatch.id) ranks.five = i
    if (u.id === fourMatch.id) ranks.four = i
    if (u.id === twoMatch.id)  ranks.two  = i
  })

  assert.ok(ranks.five !== -1, 'Five-match user should be present')
  assert.ok(ranks.four !== -1, 'Four-match user should be present')
  assert.ok(ranks.two  !== -1, 'Two-match user should be present')

  assert.ok(ranks.five < ranks.four, 'Five-match should rank above four-match')
  assert.ok(ranks.four < ranks.two,  'Four-match should rank above two-match')
})
