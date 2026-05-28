import { getUserById, loginUser, signupUser } from '../logic/userLogic.js'

export async function signup(req, res) {
  const result = await signupUser(req.body)

  res.status(result.status).json(result.body)
}

export async function login(req, res) {
  const result = await loginUser(req.body)

  res.status(result.status).json(result.body)
}

export function getUser(req, res) {
  const result = getUserById(req.params.id)

  res.status(result.status).json(result.body)
}
