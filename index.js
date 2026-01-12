const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Tesseract = require("tesseract.js");
const { fromPath } = require("pdf2pic");

const app = express();
const upload = multer({ dest: "uploads/" });

// Helper: cleanup files
const cleanupFiles = (files) => {
  files.forEach(file => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
};

app.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });

    // Create images folder if not exists
    if (!fs.existsSync("images")) fs.mkdirSync("images");

    const pdfPath = req.file.path;

    // Convert PDF pages to images
    const storeAsImage = fromPath(pdfPath, {
      density: 100,
      savePath: "./images",
      format: "png",
      width: 800,
      height: 1000
    });

    // Convert first page
    const output = await storeAsImage(1); // PDF ka first page
    const imagePath = output.path;

    // OCR Tesseract
    const result = await Tesseract.recognize(imagePath, "eng");
    const text = result.data.text;

    // Cleanup temp files
    cleanupFiles([pdfPath, imagePath]);

    res.json({ success: true, text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("OCR server running...");
});
