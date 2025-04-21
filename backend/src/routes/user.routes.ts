import { Router } from 'express';
import { registerUser, loginUser, logoutUser, deleteUser, getCurrentUser, updateProfile, getFileDownloadUrl } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/', registerUser);
router.post('/login', loginUser);

router.get('/current', protect, getCurrentUser);
router.post('/logout', protect, logoutUser);
router.put('/update-profile', protect, updateProfile);
router.get('/file/:key', protect, getFileDownloadUrl);
router.delete('/:id', protect, deleteUser);

export const userRouter = router;

