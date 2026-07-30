const express = require('express');
const cors = require('cors');
const multer = require('multer');
const uploadFile = require('./services/storage.service');
const postModel = require('./db/models/post.model');

const app = express();

app.use(cors());
app.use(express.json()); //middleware for raw format

const upload = multer({ storage: multer.memoryStorage() }); // Configure multer to store files in memory

app.post('/create-post', upload.single("image"), async (req, res) => {

    const result = await uploadFile(req.file.buffer);

    const post = await postModel.create({
        caption: req.body.caption,
        image: result.url
    });

    return res.status(201).json({
        message: "Post created successfully",
        post
    })
});


app.get("/posts", async (req, res) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const totalPosts = await postModel.countDocuments();
    const posts = await postModel.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    return res.status(200).json({
        message: "Posts fetched successfully",
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page
    })
})

app.delete("/posts/:id", async (req, res) => {
    try {
        const deletedPost = await postModel.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete post" });
    }
})

module.exports = app;