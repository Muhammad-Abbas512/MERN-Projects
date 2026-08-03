import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { arcjectProtection } from "../middlewares/arcjet.middeware.js";

const authRouter = Router();

// Apply Arcjet to all auth routes
authRouter.use(arcjectProtection);

// Register
authRouter.post("/register", authController.register);

// Login
authRouter.post("/login", authController.login);

// Verify Email
authRouter.post("/verify-email", authController.verifyEmail);

// Logout
authRouter.post("/logout", protectedRoute, authController.logout);

// Logout from all devices
authRouter.post("/logout-all", protectedRoute, authController.logoutAll);

// Refresh Access Token
authRouter.get("/refresh-token", authController.refreshToken);

// Current Logged-in User
authRouter.get("/get-me", protectedRoute, authController.getMe);

// Update Profile
authRouter.put("/update-profile", protectedRoute, authController.updateProfile);

// Check Authentication
authRouter.get("/check", protectedRoute, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default authRouter;