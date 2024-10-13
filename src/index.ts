import express from "express";
import bodyParser from "body-parser";
import serverConfig from "./config/server.config";
import apiRouter from "./routes";
import SampleWorker from "./workers/sampleWorker";
import SubmissionWorker from "./workers/submissionWorker";
import { submission_queue } from "./utils/constants";
import submissionQueueProducer from "./producers/submissionQueueProducer";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use("/api", apiRouter);

app.listen(serverConfig.port, () => {
  console.log(`Server started on port ${serverConfig.port}`);

  SampleWorker("SampleQueue");
  SubmissionWorker(submission_queue);

  // const code = `
  // #include <iostream>
  // using namespace std;

  // int main() {
  // int x;
  //   cin >> x;
  //   cout << x;
  //   for(int i=0;i<x;i++) {
  //     cout << i;
  //     cout << endl;
  //     }
  // }
  // `;

  // submissionQueueProducer({
  //   "1234": {
  //     language: "CPP",
  //     inputCase: "10",
  //     code: code,
  //   },
  // });

  // runCpp(code, "10");
});
