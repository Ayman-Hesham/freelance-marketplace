import { Router } from 'express';
import { loginUser, logoutUser } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware'

const router = Router();

router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);

export const authRouter = router;

