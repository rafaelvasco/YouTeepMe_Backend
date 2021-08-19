import { Router } from 'express'
import { UserController } from '@controller/index'
import { authorize } from '@middleware/authorize'

const router = Router()

// Get All Users
router.get('/', authorize(['ADMIN']), UserController.getAllUsers)

// Get One USer
router.get('/', authorize(), UserController.getOneById)

// Edit Existing User
router.patch('/', authorize(), UserController.editUser)

// Delete Existing User
router.delete('/', authorize(), UserController.deleteUser)

export default router
