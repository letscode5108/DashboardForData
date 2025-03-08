import e from 'express';
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/authentication.controller.js";
import { verifyJWT } from "../middleware/authentication.middleware.js";

const router = e.Router();

router.post('/register', registerUser); 
router.post('/login', loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.post('/refresh', refreshAccessToken);

export default router;