import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Auth service is running");
});

app.get("/docs-json", (req, res) => {
  res.json(swaggerSpec);
});

app.use("/auth", authRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
