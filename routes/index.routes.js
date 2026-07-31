const express = require("express");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();
const upload = require("../config/multer.config");
const supabase = require("../config/supabaseClient");
const fileModel = require("../models/files.models");

router.get("/", (req, res) => {
  try {
    res.render("index");
  } catch (error) {
    console.error("Render index error:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/home", authMiddleware, async (req, res) => {
  try {
    const userFiles = await fileModel.find({ user: req.user.userId });
    res.render("home", { files: userFiles });
  } catch (error) {
    console.error("Error fetching user files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { data, error } = await supabase.storage
        .from("drive-storage")
        .upload(`${Date.now()}_${req.file.originalname}`, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return res.status(500).json({ error: error.message });
      }

      const newFile = await fileModel.create({
        path: data.path,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: Math.round(req.file.size / 1024),
        user: req.user.userId,
        createdAt: req.file.createdAt,
      });

      res.redirect("/home");
      // res.json(newFile);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/download/:path", authMiddleware, async (req, res) => {
  try {
    const loggedUser = req.user.userId;
    const path = req.params.path;
    const file = await fileModel.findOne({ path, user: loggedUser });
    if (!file) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { data, error } = await supabase.storage
      .from("drive-storage")
      .download(file.path);
    if (error) {
      console.error("Supabase download error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalname}"`,
    );
    res.setHeader("Content-Type", data.type || "application/octet-stream");

    const arrayBuffer = await data.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/file/:id", authMiddleware, async (req, res) => {
  try {
    const file = await fileModel.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!file) {
      return res.status(404).send("File not found");
    }
    res.render("file", { file });
  } catch (error) {
    console.error("View file error:", error);
    res.status(500).send("Internal server error");
  }
});

router.delete("/file/:id", authMiddleware, async (req, res) => {
  try {
    const file = await fileModel.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const { error: storageError } = await supabase.storage
      .from("drive-storage")
      .remove([file.path]);
    if (storageError) {
      console.error("Supabase delete error:", storageError);
      return res.status(500).json({ error: storageError.message });
    }
    await fileModel.deleteOne({ _id: req.params.id });
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
