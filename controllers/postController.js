import Post from '../models/Post.js';
import cloudinary from '../config/cloudinery.js';
import Notification from '../models/Notifiaction.js';


export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const { id } = req.user;
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "Posts"
        });

        const newPost = new Post({
            content,
            author: id,
            image: result.secure_url,
            likes:{}
        });

        const savedPost = await newPost.save();
        const populatedPost = await Post.findById(savedPost._id)
            .populate('author', 'username profilePic')
            .populate('comments.author', 'username profilePic')
            .exec();
        
        res.status(201).json(populatedPost);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};


export const getPosts = async (req, res) => {
    try {
        // const userId = req.user.id;
        // const user = await User.findById(userId).populate('friends');
        
        // const friendIds = user.friends?.map((friend) => friend._id);

        // const posts = await Post.find({ author: { $in: [...friendIds, user._id] } })
        //     .populate('author', 'username image')
        //     .populate('comments.author', 'username image')
        //     .sort({ createdAt: 'desc' })
        //     .exec();
        const posts = await Post.find()
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            .exec();
        
           
        res.status(200).json(posts);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { loggedInUserId } = req.body;
        const post = await Post.findById(id);

        const isLiked = post.likes.get(loggedInUserId);

        if (isLiked) {
            post.likes.delete(loggedInUserId);
        } else {
            post.likes.set(loggedInUserId, true);
            const notification = new Notification({
                type: "like",
                user: post.author,
                friend: loggedInUserId,
                postId: post._id,
                content: 'Liked your post'
            })
            await notification.save();
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { likes: post.likes },
            { new: true }
        );

        const populatedPost = await Post.findById(updatedPost._id)
            .populate('author', 'username profilePic')
            .populate('comments.author', 'username profilePic')
            .exec();

        res.status(200).json(populatedPost);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};


export const commentPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, loggedInUserId } = req.body;
        const post = await Post.findById(id);
        post.comments.unshift({ text: comment, author: loggedInUserId, isDelete: false });
        const notification = new Notification({
            type: "Comment",
            user: post.author,
            friend: loggedInUserId,
            postId: post._id,
            content: 'commented on your post'
        })
        await notification.save();
        const savedPost = await post.save();
        
        const populatedPost = await Post.findById(savedPost._id)
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .exec();

        res.status(201).json(populatedPost);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

export const getUserPost = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const posts = await Post.find({ author: id })
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            .exec();
        
        res.status(200).json(posts)
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}