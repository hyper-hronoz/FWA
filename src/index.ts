import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger";
import userRoutes from "./routes/userRoutes";
import girlRoutes from "./routes/girlRoutes";
import path from "path";
import multer from "multer";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Auth service is running");
});

app.use("/auth", authRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/user", userRoutes);
app.use("/girls", girlRoutes);




app.use("/videos", express.static(path.join(__dirname, "../videos")));

// Настройка multer для загрузки видео
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "videos/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /videos-api/upload:
 *   post:
 *     summary: Загрузить видео для девушки
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Возвращает URL загруженного видео
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 video_url:
 *                   type: string
 */
app.post("/upload-video", upload.single("video"), (req, res) => {
  res.json({ video_url: `/videos/${req.file?.filename}` });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});


