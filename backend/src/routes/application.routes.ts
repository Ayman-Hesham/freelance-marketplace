import { Router } from 'express';
import { createApplication, getApplicationsByFreelancerId, getApplicationsByJobId, updateApplicationAndJobStatus } from '../controllers/application.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, createApplication);
router.get('/by-freelancer/:id', protect, getApplicationsByFreelancerId);
router.get('/by-job/:id', protect, getApplicationsByJobId);
router.put('/:id', protect, updateApplicationAndJobStatus);


export const applicationRouter = router;

