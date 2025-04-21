import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getJobs } from '../controllers/job.controller';

const router = Router();

router.get('/', protect, getJobs);

export const jobRouter = router;
