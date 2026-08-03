import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOTP, getOtpHtml } from "../utils/utils.js";
import otpModel from "../models/otp.model.js";
import cloudinary from "../utils/cloudinary.js";


export async function register(req, res){

    const { username, email, password } = req.body;


    const isUserExist = await userModel.findOne({ 
        $or:[
            {username},
            {email}
        ]
    });

    if(isUserExist){
        return res.status(409).json({
            message: "User already exists"
        });
    }

    const hashPassword = crypto.createHash("sha256").update(password).digest("hex");

    const user = await userModel.create({
        username,
        email,
        password: hashPassword
    });

    const otp = generateOTP();
    const html = getOtpHtml(otp);

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await otpModel.create({
       email,
       user: user._id,
       otpHash

    })

    await sendEmail(email, "Verify your email", `Your OTP is ${otp}`, html);


 

    res.status(201).json({
        message: "User registered successfully",
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    });

}

export async function login(req,res){
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if(!user){
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    if(!user.verified){
        return res.status(401).json({
            message: "Please verify your email before logging in"
        })
    }

    const hashPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid = hashPassword === user.password;

    if(!isPasswordValid){
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,{
        expiresIn: "15m"
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000  //7 days limit
    });


    res.status(200).json({
        message: "User logged in successfully",
        user: {
            username: user.username,
            email: user.email
        },
        accessToken,
    });
}

export async function getMe(req, res){

    const token = req.headers.authorization?.split(" ")[1];


    if(!token){
        return res.status(401).json({
            message: "token not found"
        })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id)

    res.status(200).json({
        message: "User fetched successfully",
        user: {
            username: user.username,
            email: user.email
        }
    })

}


export async function refreshToken(req, res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoke: false
    })

    if(!session){
        return res.status(400).json({
            message: "invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, {
        expiresIn: "15m"
    })

    const newRefreshToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, {
        expiresIn: "7d" 
    })

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    
    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();


    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000  //7 days limit
    });

    res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken
    })
}


export async function logout(req, res){

    const refereshToken = req.cookies.refreshToken;

    if(!refereshToken){
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }


    const refreshTokenHash = crypto.createHash("sha256").update(refereshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoke: false
    })

    if(!session){
        return res.status(400).json({
            message: "invalid refresh token"
        })
    }

    session.revoke = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "Logged out successfully"
    })
}



export async function logoutAll(req, res){
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    await sessionModel.updateMany({
        user: decoded.id,
        revoke: false
    }, {
        revoke: true
    })

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "Logged out from all devices successfully"
    })
}


export async function verifyEmail(req, res){

    const {otp, email} = req.body;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await otpModel.findOne({
        email,
        otpHash
    })

    if(!otpDoc){
        return res.status(400).json({
            message: "Invalid OTP"
        })
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user, { verified: true }, { new: true });


    await otpModel.deleteMany({ 
        user: otpDoc.user
     });

    res.status(200).json({
        message: "Email verified successfully",
        user:{
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    });

}


export async function updateProfile(req, res){
    try{

        const {profilePic} = req.body;
        if(!profilePic){
            return res.status(400).json({
                message: "Profile picture is required"
            })
        }

        const userId = req.user._id;
      const uploadResponse =  await cloudinary.uploader.upload(profilePic);

     const updatedUser = await userModel.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true});

     res.status(200).json({
        updatedUser
     })





        
    } catch (error) {
        res.status(500).json({
            message: "Error updating profile"
        })
    }
}
