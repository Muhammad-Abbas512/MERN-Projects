import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";



export const socketAuthMiddleware = async (socket, next) => {

    try{
        const token = socket.handshake.headers.cookie?.split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

        if(!token){
            return next(new Error("Authentication error: Token not found"));
        }

        //verify the token
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if(!decoded){
            return next(new Error("Authentication error: Invalid token"));
        }


        //find the user in the database
        const user = await userModel.findById(decoded.id).select("-password");
        if(!user){
            return next(new Error("Authentication error: User not found"));
        }


        //attach the user to the socket object
        socket.user = user;
        socket.userId = user._id.toString();

        console.log("Socket authenticated user:", user.username);

        next();

    }catch(error){
        return next(new Error("Authentication error: " + error.message));
    }

}