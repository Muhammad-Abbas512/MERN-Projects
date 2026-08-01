const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    image: String,
    caption: String
})

const postModel = mongoose.model('Post', postSchema)

module.exports = postModel;


/*

post = {
    image: "https://example.com/image.jpg",
    caption: "This is a sample caption."
}

user = {
    username: "john_doe",
    email: "john.doe@example.com",
    password: "securepassword123",
    posts = [ post1, post2, post3 ]
}


notes connection

*/