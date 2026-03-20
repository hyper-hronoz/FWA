import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("User service is running");
});

app.get("/docs-json", (req, res) => {
  res.json(swaggerSpec);
});

app.use("/user", userRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});