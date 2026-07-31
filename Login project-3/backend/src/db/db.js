const mongoose = require('mongoose');


async function connectDB(){
    try{

        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected successfully");
    }catch(err){
        console.log("Error connecting to database", err);
    }
}

module.exports = connectDB;