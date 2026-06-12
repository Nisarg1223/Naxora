import "dotenv/config";
import axios from "axios";

async function test() {
  const token = process.env.HUGGING_FACE;
  console.log("Token:", token);
  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      { inputs: "a red sports car" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "image/png"
        },
        responseType: "arraybuffer"
      }
    );
    console.log("Success! Status:", response.status, "Length:", response.data.byteLength);
  } catch (error) {
    console.error("Failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", Buffer.from(error.response.data).toString("utf-8"));
    } else {
      console.error(error.message);
    }
  }
}

test();
