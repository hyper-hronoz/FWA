import express from "express";
import axios from "axios";
import swaggerUi from "swagger-ui-express";

const app = express();

const SERVICES = [
  "http://service-auth:3001/docs-json",
  "http://service-users:3003/docs-json",
  "http://service-girls:3002/docs-json",
];

app.get("/docs-json", async (req, res) => {
  try {
    const results = await Promise.all(
      SERVICES.map(url => axios.get(url).then(r => r.data))
    );

    const merged = {
      openapi: "3.0.0",
      info: {
        title: "API Gateway",
        version: "1.0.0",
      },
      paths: Object.assign(
        {},
        ...results.map(r => r.paths || {})
      ),
      components: {
        schemas: Object.assign(
          {},
          ...results.map(r => r.components?.schemas || {})
        ),
      },
    };

    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load docs" });
  }
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerUrl: "/docs-json",
  })
);

app.listen(3000, () => {
  console.log("Gateway running on 3000");
});