import aj from "../utils/Arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";


export const arcjectProtection = async (req, res, next) => {
    try {

        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({
                    message: " Rate limit exceed. Too many requests. Please try again later."
                })
            }
            else if (decision.reason.isBot()) {
                return res.status(403).json({
                    message: "Access denied. Bot traffic is not allowed."
                })
            } else {
                return res.status(403).json({
                    message: "Access denied. Suspicious activity detected."
                })
            }
        }



        // check for spoofed bots
        if(decision.results.some(isSpoofedBot)){
            return res.status(403).json({
                error: "Spoofed bot traffic detected.",
                message: "Access denied. Spoofed bot traffic is not allowed."
            })
        }

        next();


    } catch (error) {
        console.error("Error in arcjetProtection middleware:", error);
        next();
    }
}