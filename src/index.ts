import express from "express";
import serverConfig from "./config/server.config";
import apiRouter from "./routes";

const app = express();

app.use("/api", apiRouter);

app.listen(serverConfig.port, () => {
  console.log(`Server started on port ${serverConfig.port}`);
});
