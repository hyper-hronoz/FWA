import express from "express";
import cors from "cors";
import girlRoutes from "./routes/girlRoutes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger";

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Girls service is running");
});


app.get("/docs-json", (req, res) => {
  res.json(swaggerSpec);
});


app.use("/girls", girlRoutes);


app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const PORT = 3002;

app.listen(PORT, () => {
  console.log(`Girls service running on port ${PORT}`);
});