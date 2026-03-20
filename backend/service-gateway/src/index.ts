import express from "express";
import axios from "axios";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(express.json());


app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);



const SERVICES = {
  auth: "http://service-auth:3001",
  users: "http://service-users:3003",
  girls: "http://service-girls:3002",
};


const createProxy = (baseUrl: string) => {
  return async (req: any, res: any) => {
    try {
      const url = `${baseUrl}${req.originalUrl}`;

      const response = await axios({
        method: req.method,
        url,
        data: req.body,
        params: req.query,
        headers: {
          "Content-Type": req.headers["content-type"] || "",
          Authorization: req.headers["authorization"] || "",
        },
        validateStatus: () => true, // важно: не падать на 4xx/5xx
      });

      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error("Gateway error:", error.message);

      res.status(500).json({
        error: "Gateway error",
      });
    }
  };
};


app.use("/auth", createProxy(SERVICES.auth));
app.use("/users", createProxy(SERVICES.users));
app.use("/girls", createProxy(SERVICES.girls));


app.get("/", (req, res) => {
  res.json({ status: "Gateway running" });
});


const SERVICE_DOCS = [
  "http://service-auth:3001/docs-json",
  "http://service-users:3003/docs-json",
  "http://service-girls:3002/docs-json",
];

app.get("/docs-json", async (req, res) => {
  try {
    const results = await Promise.all(
      SERVICE_DOCS.map((url) => axios.get(url).then((r) => r.data))
    );

    const merged = {
      openapi: "3.0.0",
      info: {
        title: "API Gateway",
        version: "1.0.0",
      },
      paths: Object.assign({}, ...results.map((r) => r.paths || {})),
      components: {
        schemas: Object.assign(
          {},
          ...results.map((r) => r.components?.schemas || {})
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

app.use('/videos', express.static('/app/static/videos'));
app.use('/avatars', express.static('/app/static/avatars'));

app.listen(3000, () => {
  console.log("Gateway running on port 3000");
});