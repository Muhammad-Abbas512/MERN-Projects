import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";



export async function protectedRoute(req, res, next) {
    try{

        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({
                message: "Unauthorized - no token provided"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({
                message: "Unauthorized - invalid token"
            });
        }

        const user = await userModel.findById(decoded.id).select("-password");
        if(!user){
            return res.status(404).json({
                message: "Unauthorized - user not found"
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }

}