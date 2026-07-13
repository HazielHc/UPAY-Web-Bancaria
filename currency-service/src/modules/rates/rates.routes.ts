import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../shared/asyncHandler';
import * as controller from './rates.controller';

const router = Router();

router.use(authenticate);

router.get('/pair', asyncHandler(controller.getPairRate));
router.get('/', asyncHandler(controller.getRatesList));

export default router;
