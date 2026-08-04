import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: [true, "username must be unique"]
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "email must be unique"]
    },
    password: {
        type: String,
        required: [true, "password is required"]
    },
    verified: {
        type: Boolean,
        default: false
    },
    profilePic: {
        type: String,
        default: ""
    },
    // Track last read timestamp per chat partner: { [partnerId]: ISO date string }
    lastReadAt: {
        type: Map,
        of: Date,
        default: {}
    }
});

const userModel = mongoose.model("User", userSchema);

export default userModel;