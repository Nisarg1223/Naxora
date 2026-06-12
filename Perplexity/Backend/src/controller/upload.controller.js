import fs from "fs";
import path from "path";

export async function uploadImage(req, res) {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image payload provided" });
    }

    // Parse base64 string: "data:image/png;base64,iVBORw0KGgoAAAANS..."
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: "Invalid image base64 format" });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Map MIME type to file extension
    let extension = "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      extension = "jpg";
    } else if (mimeType.includes("gif")) {
      extension = "gif";
    } else if (mimeType.includes("webp")) {
      extension = "webp";
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `upload_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    const fileUrl = `http://localhost:3000/public/uploads/${filename}`;
    return res.status(200).json({
      url: fileUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: error.message });
  }
}
