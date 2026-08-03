import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("Cloud name:", JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME));
console.log("API key:", JSON.stringify(process.env.CLOUDINARY_API_KEY));
console.log("API secret:", JSON.stringify(process.env.CLOUDINARY_API_SECRET));