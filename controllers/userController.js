import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from "../models/User.js";
import cloudinary from '../config/cloudinery.js';
import { OAuth2Client } from "google-auth-library";
import Notification from '../models/Notifiaction.js';


/* REGISTER USER */
export const register = async (req, res) => {
    try {
        const {
            username,
            email,
            phone,
            password

        } = req.body;
        const userExist = await User.findOne({ email: email });
        if (userExist) return res.status(400).json({ msg: "Email already used. " });
        const salt = await bcrypt.genSalt();
       
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: passwordHash,
            phone
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);

        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


/* LOGGING IN */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ msg: "User does not exist. " });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
        delete user.password;
        res.status(200).json({ token, user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

export const getUser =async (req, res) => {
    
    const userId = req.params.id
    try {
        const user = await User.findById(userId);

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const addProfilePic = async (req, res) => {
   try {
       const { userId } = req.body;
       const result = await cloudinary.uploader.upload(req.file.path, {
           folder: "Users"
       });
       const updatedUser = await User.findByIdAndUpdate(
           userId, 
               { profilePic: result.secure_url },
               { new: true }
       )
       
       res.status(200).json(updatedUser);
   } catch (error) {
       res.status(500).json(error)
   }
}

export const getUserSuggestion = async (req, res) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id)
            .lean()
            .select('followings');

        const followings = user?.followings ?? [];

        const users = await User.find({ _id: { $nin: [...followings, id] } })
            .lean()
            .select('username profilePic');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error);
    }
}


export const followUser = async (req, res) => {
    try {
        const { id } = req.user;
        const { friendId } = req.body;
        const friend = await User.findById(friendId);
        if (!friend) {
            return res.status(400).json({ msg: "User does not exist" })
        }
        if (!friend.followers.includes(id)) { // Check if userId is not already in followers
            friend.followers.push(id);
            await friend.save();
            const notification = new Notification({
                type: "follow",
                user: friend._id,
                friend: id,
                content: 'Started Following You'
            })
            await notification.save();
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ msg: "User does not exist" })
        }
        if (!user.followings.includes(friendId)) { // Check if userIdToFollow is not already in following
            user.followings.push(friendId);
            await user.save();
        }
        const updatedUser = await User.findById(id);
        const sugesstions = await User.find({ _id: { $nin: [...updatedUser.followings, id] } });
        res.status(200).json({ sugesstions, updatedUser });
    } catch (error) {
        res.status(500).json(error)
    }
};

export const unFollowUser = async (req, res) => {
    try {
        const { id } = req.user;
        const { friendId } = req.body;
        const friend = await User.findById(friendId);
        if (!friend) {
            return res.status(400).json({ msg: "User does not exist" })
        }
        if (friend.followers.includes(id)) { // Check if userId is already in followers
            const index = friend.followers.indexOf(id);
            friend.followers.splice(index, 1); // Remove it from the array
            await friend.save();
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ msg: "User does not exist" })
        }
        if (user.followings.includes(friendId)) { // Check if userIdToUnFollow is already in following
            const index = user.followings.indexOf(friendId);
            user.followings.splice(index, 1); // Remove it from the array
            await user.save();
        }
        const updatedUser = await User.findById(id);
        const sugesstions = await User.find({ _id: { $nin: [...updatedUser.followings, id] } });
        res.status(200).json({sugesstions, updatedUser});
    } catch (error) {
        res.status(500).json(error)
    }
}

export const editUserProfile = async (req, res) => {

    try {
        const {  bio, phone, userId } = req.body
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                
                bio: bio,
                phone: phone
            },
            { new: true }
        )

        res.status(200).json(updatedUser)
    } catch {
        res.status(500).json(error)
    }
}
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const  verify = async(client_id, jwtToken)=> {
    const client = new OAuth2Client(client_id);
    // Call the verifyIdToken to
    // varify and decode it
    const ticket = await client.verifyIdToken({
        idToken: jwtToken,
        audience: client_id,
    });
    // Get the JSON with all the user info
    const payload = ticket.getPayload();
    // This is a JSON object that contains
    // all the user info
    return payload;
}
export const googleLogin = async (req, res) => {

    try {
        const { token } = req.body
        const { name, email, picture } = await verify(CLIENT_ID, token);
        const user = await User.findOne({ email: email });
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
            res.status(200).json({token, user})
        } else {
            const newUser = new User({
                username : name,
                email,
                profilePic: picture
            });

            const svedUser = await newUser.save();
            const token = jwt.sign({ id: svedUser._id }, process.env.SECRET_KEY);
            res.status(200).json({ token, user: svedUser })
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: "Invalid token" });
    }
}


export const getNotifications = async (req, res)=>{
    try {
        const { id } = req.user;
        const notifiactions = await Notification.find({ user: id })
            .populate('friend', 'username profilePic')
            .populate('postId', 'image')
            .sort({ createdAt: -1 })
            .exec();
        res.status(200).json(notifiactions);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


export const getAllUsers = async (req, res) => {
    try {
        const { id } = req.user;
        const users = await User.find().select('username profilePic')
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json(err)
    }
}