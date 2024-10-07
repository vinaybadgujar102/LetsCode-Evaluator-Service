import express from "express";
import bodyParser from "body-parser";
import serverConfig from "./config/server.config";
import apiRouter from "./routes";
import SampleWorker from "./workers/sampleWorker";
import runPython from "./containers/runPythonDocker";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use("/api", apiRouter);

app.listen(serverConfig.port, () => {
  console.log(`Server started on port ${serverConfig.port}`);

  SampleWorker("SampleQueue");

  const code = `x = input()
print("value of x is",x)
for i in range(int(x)):
  print(i) 
  `;

  runPython(code, "10");
});
