import express from "express";
import bodyParser from "body-parser";
import serverConfig from "./config/server.config";
import apiRouter from "./routes";
import SampleWorker from "./workers/sampleWorker";
import runJava from "./containers/runJavaDocker";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use("/api", apiRouter);

app.listen(serverConfig.port, () => {
  console.log(`Server started on port ${serverConfig.port}`);

  SampleWorker("SampleQueue");

  const code = `
  import java.util.*;
  public class Main {
    
    public static void main(String[] args) {
      Scanner scn = new Scanner(System.in);
      int n = scn.nextInt();
      System.out.println(n);
      for(int i = 0; i < n; i++) {
        System.out.println(i);
      }
    }

  }
  `;

  runJava(code, "10");
});
