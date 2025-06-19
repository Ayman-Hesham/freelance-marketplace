import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getJobs, createJob, getJobById, filterJobs, getJobsByClientId, searchJobs, deleteJob, blockJob } from '../controllers/job.controller';

const router = Router();

router.get('/filter', protect, filterJobs);
router.get('/search', protect, searchJobs);
router.get('/by-client/:id', protect, getJobsByClientId);

router.get('/', protect, getJobs);
router.post('/', protect, createJob);
router.get('/:id', protect, getJobById);
router.delete('/:id', protect, deleteJob);
router.put('/block/:id', protect, blockJob);

export const jobRouter = router;
