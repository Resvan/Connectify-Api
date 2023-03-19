import cloudinary from '../config/cloudinery.js';
import Story from '../models/Story.js';
import mongoose from 'mongoose';

export const addStory = async (req, res) => {
    try {
        const { id } = req.user;
        const {fileType} = req.body
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: fileType, folder: "Stories"
        });
        
        const newStory = new Story({
            author: id,
            file: result.secure_url,
            fileType: fileType
        });

        const saveStory = await newStory.save();
        const populatedStory = await Story.findById(saveStory._id)
            .populate('author', 'username profilePic')
            .exec();

        res.status(201).json(populatedStory);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getUserStories = async (req, res) => {
    try {
        const userId = req.user.id;
        const stories = await Story.aggregate([
            { $match: { author: mongoose.Types.ObjectId(userId), isDelete: false } }, // filter by user ID and exclude deleted stories
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                },
            },
            { $unwind: '$author' },
            {
                $project: {
                    _id: 0,
                    author: {
                        _id: 1,
                        username: 1,
                        profilePic: 1,
                    },
                    file: 1,
                    fileType: 1,
                    createdAt: 1,
                },
            },
        ]);



        
        res.status(200).json(stories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

export const getFriendsStories = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(userId);
        const stories = await Story.aggregate([
            { $match: { author: { $ne: mongoose.Types.ObjectId(userId) }, isDelete: false } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$author", stories: { $push: "$$ROOT" } } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'author',
                },
            },
            { $unwind: '$author' },
            {
                $project: {
                    _id: 0,
                    author: {
                        _id: 1,
                        username: 1,
                        profilePic: 1,
                    },
                    stories:1,
                },
            },
            
        ]);
        res.status(200).json(stories)
    } catch (err) {
        
    }
}