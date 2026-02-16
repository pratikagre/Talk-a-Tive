const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|pdf/;
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb("Images and PDFs only!");
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post("/", upload.single("file"), (req, res) => {
    // Generate URL - Assuming server runs on localhost:5000
    // In production this should be an env var or relative path handling
    const filePath = `/${req.file.filename}`;
    res.send({
        filePath: filePath,
        fileType: req.file.mimetype.startsWith('image') ? 'image' : 'file'
    });
});

module.exports = router;
