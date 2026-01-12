const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const { convert } = require("pdf-poppler");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    let text = "";

    if (!fs.existsSync("images")) fs.mkdirSync("images");

    await convert(req.file.path, {
      format: "png",
      out_dir: "images",
      out_prefix: "page"
    });

    const files = fs.readdirSync("images");

    for (const file of files) {
      const result = await Tesseract.recognize(
        path.join("images", file),
        "eng"
      );
      text += result.data.text + "\n";
    }

    res.json({ success: true, text });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 3000);
