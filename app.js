const express = require("express");
const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Image = require("./imageModel");
require("../Exelon_Circuits_Task/config/dbconnect");

const app = express();
const port = 3000;

app.use(express.json());

// API endpoint for image processing
app.post("/process-image", async (req, res) => {
  console.log("Request Body:", req.body);

  const { imagePath, width, height, quality, format } = req.body;

  if (!imagePath) {
    return res.status(400).json({ error: "Image path is missing" });
  }

  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const randomString = uuidv4().substring(0, 8);
  const filename = `${timestamp}-${randomString}.` + format;
  var imagePathLocal = "";
  let imagePathConverted = imagePath.replace(/\//g, "\\");

  if (fs.existsSync(imagePath)) {
    imagePathLocal = imagePath;
    console.log("if statement");
  } else {
    try {
      // Download the image from the URL
      const response = await axios.get(imagePath, { responseType: "stream" });
      // Set the path to save the local image
      imagePathLocal = path.join(__dirname, filename);
      const writer = fs.createWriteStream(imagePathLocal);
      response.data.pipe(writer);

      // Wait for the image to finish downloading
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } catch (error) {
      console.error("Error downloading or processing image:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  // Resize the downloaded image
  let image = sharp(imagePathLocal).resize(width, height);

  // Change the quality of the image
  if (quality) {
    image = image.jpeg({ quality: parseInt(quality) });
  }

  // Change the format of the image
  if (format) {
    image = image.toFormat(format.toLowerCase());
  }
  const resultImage = new Image({
    name: filename, // Assuming 'filename' is the name of the processed image
    data: fs.readFileSync(imagePathLocal),
    contentType: "image/" + format, // Change this based on the actual image format
  });

  await resultImage.save();

  // Respond with a success message

  res.json({ message: "Image processed and stored successfully" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
