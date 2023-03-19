import express from "express";
import { getUser, login, register, addProfilePic, getUserSuggestion, followUser, unFollowUser, editUserProfile, googleLogin, getNotifications, getAllUsers } from "../controllers/userController.js";
import { verifyToken } from '../middleware/auth.js';
import upload from "../config/multer.js";
import { createPost, getPosts, likePost, commentPost, getUserPost } from "../controllers/postController.js";
import { addStory, getUserStories, getFriendsStories } from "../controllers/storyController.js";



const router = express.Router();

router.post('/signup', register);
router.post('/login', login);



router.post('/add-post', verifyToken, upload.single('image'), createPost);
router.post('/profile-pic', verifyToken, upload.single('image'), addProfilePic);
router.post('/add-story', verifyToken, upload.single('file'), addStory);



router.get('/getPost', verifyToken, getPosts);
router.get('/user/:id', verifyToken, getUser);
router.get('/user-post/:id', verifyToken, getUserPost);
router.get('/user-stories', verifyToken, getUserStories);
router.get('/firends-stories', verifyToken, getFriendsStories);
router.get('/sugesstion', verifyToken, getUserSuggestion);
router.get('/notifications', verifyToken, getNotifications)
router.get('/get-all-user', verifyToken, getAllUsers)

/* UPDATE */
router.patch("/posts/:id/like", verifyToken, likePost);
router.patch("/posts/:id/comment", verifyToken, commentPost);
router.patch("/add-friend", verifyToken, followUser);
router.patch('/unfollow', verifyToken, unFollowUser)

router.put('/user/profile', verifyToken, editUserProfile)



router.post("/google-login", googleLogin);

export default router;