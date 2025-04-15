import { Router } from 'express';
import { registerUser, deleteUser, getCurrentUser } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware'

const router = Router();

router.get('/current', getCurrentUser)
router.post('/', registerUser);
//router.put('/update-password', protect, updatePassword);
router.delete('/:id',  deleteUser);

export const userRouter = router;

