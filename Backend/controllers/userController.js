import {
  getUserById,
  getUserByToken,
  loginUser,
  signupUser,
  updateUserProfileByToken,
} from '../logic/userLogic.js'

export async function signup(req, res) {
  try {
    const result = await signupUser(req.body)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while creating account.' })
  }
}

export async function login(req, res) {
  try {
    const result = await loginUser(req.body)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while logging in.' })
  }
}

export async function getUser(req, res) {
  try {
    const result = await getUserById(req.params.id)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while fetching user.' })
  }
}

export async function getCurrentUser(req, res) {
  try {
    const result = await getUserByToken(req.headers.authorization)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while fetching current user.' })
  }
}

export async function updateCurrentUser(req, res) {
  try {
    const result = await updateUserProfileByToken(req.headers.authorization, req.body.profile ?? req.body)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while updating profile.' })
  }
}

export async function nearbyUsers(req, res) {
  try {
    // Placeholder for nearby users logic
    res.json({ message: 'Nearby users endpoint - to be implemented' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while fetching nearby users.' })
  }
}
