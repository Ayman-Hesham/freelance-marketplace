import { Router } from 'express';
import { acceptApplication, acceptDeliverable, createApplication, getApplicationsByFreelancerId, getApplicationsByJobId, getLastApplication, requestCorrection, submitDeliverable } from '../controllers/application.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, createApplication);
router.get('/by-freelancer/:id', protect, getApplicationsByFreelancerId);
router.get('/by-job/:id', protect, getApplicationsByJobId);
router.put('/:id/accept', protect, acceptApplication);
router.put('/:id/submit-deliverable', protect, submitDeliverable);
router.put('/:id/request-correction', protect, requestCorrection);
router.put('/:id/accept-deliverable', protect, acceptDeliverable);
router.get('/last/:id', protect, getLastApplication);

export const applicationRouter = router;

