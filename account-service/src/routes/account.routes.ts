import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../shared/asyncHandler';
import * as controller from '../controllers/account.controller';

const router = Router();

router.use(authenticate);

router.post('/', asyncHandler(controller.create));
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
