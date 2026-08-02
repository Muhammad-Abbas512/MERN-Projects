import mongoose from 'mongoose';
import config from './config.js';


async function connectDB(){

    try{
        await mongoose.connect(config.mongoURI);
        console.log('MongoDB connected successfully');
    }catch(err){
        console.error('Error connecting to MongoDB:', err.message);
    }
}

export default connectDB;