import { Router } from 'express'
import { UserController } from 'controller'
import { authorize } from 'middleware/authorize'

const router = Router()

// Get All Users
router.get('/', authorize(['ADMIN']), UserController.getAllUsers)

// Get One USer
router.get('/:id', authorize(), UserController.getOneById)

// Edit Existing User
router.patch('/:id', authorize(), UserController.editUser)

// Delete Existing User
router.delete('/:id', authorize(), UserController.deleteUser)

export default router
