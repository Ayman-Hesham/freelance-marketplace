import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getJobs, createJob, getJobById, filterJobs, getJobsByClientId, searchJobs, deleteJob } from '../controllers/job.controller';

const router = Router();

router.get('/filter', protect, filterJobs);
router.get('/search', protect, searchJobs);
router.get('/client/:id', protect, getJobsByClientId);

router.get('/', protect, getJobs);
router.post('/', protect, createJob);
router.get('/:id', protect, getJobById);
router.delete('/:id', protect, deleteJob);

export const jobRouter = router;
