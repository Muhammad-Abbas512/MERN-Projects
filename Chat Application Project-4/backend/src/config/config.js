import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if(!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment variables');
}

if(!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

if(!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not defined in the environment variables');
}

if(!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET is not defined in the environment variables');
}

if(!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('GOOGLE_REFRESH_TOKEN is not defined in the environment variables');
}

if(!process.env.GOOGLE_USER) {
    throw new Error('GOOGLE_USER is not defined in the environment variables');
}

if(!process.env.IMAGEKIT_PUBLIC_API_KEY) {
    throw new Error('IMAGEKIT_PUBLIC_API_KEY is not defined in the environment variables');
}

if(!process.env.IMAGEKIT_PRIVATE_API_KEY) {
    throw new Error('IMAGEKIT_PRIVATE_API_KEY is not defined in the environment variables');
}

if(!process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error('IMAGEKIT_URL_ENDPOINT is not defined in the environment variables');
}

const config = {
    mongoURI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_USER: process.env.GOOGLE_USER,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    IMAGEKIT_PUBLIC_API_KEY: process.env.IMAGEKIT_PUBLIC_API_KEY,
    IMAGEKIT_PRIVATE_API_KEY: process.env.IMAGEKIT_PRIVATE_API_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    ARCJET_API_KEY: process.env.ARCJET_API_KEY,
    ARCJET_ENV: process.env.ARCJET_ENV || 'development',
    
}

export default config;