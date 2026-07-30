import express from 'express';
import { updateUserAvatar } from '../controllers/userController.js';
import { upload } from '../middleware/multer.js';
import { authenticate } from '../middleware/authenticate.js'; // Ваша мідлвара авторизації

const userRouter = express.Router();

// КРИТЕРІЙ: Захист маршруту (authenticate) та обробка 'avatar' через middleware upload
userRouter.patch(
  '/users/me/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
);

export default userRouter;
