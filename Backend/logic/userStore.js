import bcrypt from 'bcrypt'

const users = [
  {
    id: 1,
    email: 'user@example.com',
    password: await bcrypt.hash('password123', 10),
    profile: {
      fullName: 'Demo User',
      age: 22,
      schoolOrWork: 'AroundU',
      bio: 'This is a demo account.',
      interests: ['Coffee', 'Music', 'Food'],
    },
  },
]

let nextUserId = 2

export function findUserByEmail(email) {
  return users.find((user) => user.email === email)
}

export function findUserById(id) {
  return users.find((user) => user.id === id)
}

export function addUser(user) {
  const userWithId = {
    ...user,
    id: nextUserId,
  }

  nextUserId += 1
  users.push(userWithId)

  return userWithId
}
