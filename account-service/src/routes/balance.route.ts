import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../shared/asyncHandler';
import * as controller from '../controllers/balance.controller';

const router = Router();



router.use(authenticate);
router.post('/balance-operations', asyncHandler(controller.applyBalance));
router.get('/accounts/:id/exists', asyncHandler(controller.accountExists));



export default router;