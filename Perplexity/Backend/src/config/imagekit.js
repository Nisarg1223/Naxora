import ImageKit from "imagekit";

// Lazy-initialize ImageKit so that dotenv has time to load env vars
// before the SDK reads them. This avoids the ESM hoisting issue where
// import statements run before dotenv.config() in Server.js.
let _imagekit = null;

function getImageKit() {
  if (!_imagekit) {
    _imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return _imagekit;
}

export default getImageKit;