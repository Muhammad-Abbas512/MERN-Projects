const mongoose = require("mongoose");


async function connectDB(){

    await mongoose.connect("mongodb+srv://soomromuhammadabbas671_db_user:4dKvJQGv37a2oAaw@cluster0.ogdo2qu.mongodb.net/Notesapi");
    
    console.log("MongoDB connected successfully");
}


module.exports = connectDB;