import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../shared/asyncHandler';
import * as controller from '../controllers/card.controller';

// mergeParams: true permite leer :accountId del router padre.
const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', asyncHandler(controller.create));
router.get('/', asyncHandler(controller.list));

export default router;
