import { ItemController } from 'controller'
import { Router } from 'express'
import { authorize } from 'middleware/authorize'

const router = Router()

// Query Items
router.post('/query', ItemController.queryItems)

// Get All Item Types
router.get('/types', ItemController.getAllTypes)

// Get Item
router.get('/', ItemController.getItem)

// Create Item
router.post('/', authorize(['ADMIN']), ItemController.createItem)

// Update Item
router.patch('/', authorize(['ADMIN']), ItemController.updateItem)

// Delete Item

router.delete('/', authorize(['ADMIN']), ItemController.deleteItem)


export default router
