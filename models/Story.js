import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    file: {
        type: String,
        required: false
    },
    fileType: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isDelete: {
        type: Boolean,
        default: false
    }
});

const Story = mongoose.model('Story', storySchema);

export default Story;
