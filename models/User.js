import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    phone: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    profilePic: {
        type: String,
    },
    coverPic: {
        type: String,
    },
    bio: {
        type: String,
    }
})
const User = mongoose.model("User", userSchema);
export default User