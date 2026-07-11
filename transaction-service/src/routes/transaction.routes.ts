import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../shared/asyncHandler';
import * as controller from '../controllers/transaction.controller';

const router = Router();

router.use(authenticate);

router.post('/', asyncHandler(controller.createTransfer));
router.get('/', asyncHandler(controller.listTransfers));
router.get('/:id', asyncHandler(controller.getTransfer));

export default router;
