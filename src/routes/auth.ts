import { AuthController } from 'controller'
import { Router } from 'express'
import { authorize } from 'middleware/authorize'

const router = Router()

// Register
router.post('/register', AuthController.signup)

// Login
router.post('/login', AuthController.login)

// Logout
router.post('/logout', AuthController.logout)

// Change Password
router.post('/change-password', authorize(), AuthController.changePassword)

// Authorize with request cookies
router.get('/refresh-authorize', AuthController.refreshAuthorize)

export default router
