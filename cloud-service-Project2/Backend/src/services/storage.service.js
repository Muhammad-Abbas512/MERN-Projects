const {ImageKit} = require('@imagekit/nodejs');

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_BASE_URL,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadFile(buffer) {
    const result = await imagekit.files.upload({
        file: buffer.toString("base64"),
        fileName: "image.jpg",
    });

    return result;
}

module.exports = uploadFile;