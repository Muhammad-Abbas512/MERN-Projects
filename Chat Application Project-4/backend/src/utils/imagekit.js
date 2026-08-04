import ImageKit from "@imagekit/nodejs";
import config from "../config/config.js";

const imagekit = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_API_KEY
});

export default imagekit;