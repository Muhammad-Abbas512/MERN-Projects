import {Router} from 'express';
import * as authController from '../controller/auth.controller.js';
import {protectedRoute} from '../middlewares/auth.middleware.js';


const authRouter = Router();


// POST /api/auth/register 
authRouter.post("/register", authController.register);

// post /api/auth/login
authRouter.post("/login", authController.login);


// GET /api/auth/get-me
authRouter.get("/get-me", authController.getMe);



// /api/auth/refresh-token
authRouter.get("/refresh-token", authController.refreshToken);

// /api/auth/logout
authRouter.get("/logout", authController.logout);

// /api/auth/logout-all
authRouter.get("/logout-all", authController.logoutAll);


// POST /api/auth/verify-email
authRouter.post("/verify-email", authController.verifyEmail);


authRouter.post("/update-profile", protectedRoute, authController.updateProfile);

authRouter.get("/check", protectedRoute, (req, res) =>{
    res.status(200).json({
        user: req.user
    })
});


export default authRouter;