import express from "express";
import bodyParser from "body-parser";
import serverConfig from "./config/server.config";
import apiRouter from "./routes";
import SampleWorker from "./workers/sampleWorker";
import runCpp from "./containers/runCppDocker";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use("/api", apiRouter);

app.listen(serverConfig.port, () => {
  console.log(`Server started on port ${serverConfig.port}`);

  SampleWorker("SampleQueue");

  const code = `
  #include <iostream>
  using namespace std;

  int main() {
  int x;
    cin >> x;
    cout << x;
    for(int i=0;i<x;i++) {
      cout << i;
      cout << endl;
      }
  }
  `;

  runCpp(code, "10");
});
