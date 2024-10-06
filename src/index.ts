import express from "express";
import serverConfig from "./config/server.config";
import apiRouter from "./routes";
import sampleQueueProducer from "./producers/sampleQueueProducer";
import SampleWorker from "./workers/sampleWorker";

const app = express();

app.use("/api", apiRouter);

app.listen(serverConfig.port, () => {
  console.log(`Server started on port ${serverConfig.port}`);

  SampleWorker("SampleQueue");

  sampleQueueProducer("SampleJob", {
    name: "sample",
    company: "LetsCode",
    id: 1,
    data: "sample data",
  });
});
