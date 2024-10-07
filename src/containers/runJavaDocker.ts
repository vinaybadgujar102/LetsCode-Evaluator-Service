import { JAVA_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";

async function runJava(code: string, inputTestCase: string) {
  console.log("Initialising a new java container");
  const rawLogBuffer: Buffer[] = [];
  // const pythonDockerContainer = await createContainer("python:3.8-slim", [
  //   "python",
  //   "-c",
  //   code,
  //   "stty -echo",
  // ]);

  const runCommand = `echo '${code.replace(
    /'/g,
    `'\\"`
  )}' > Main.java && javac Main.java && echo '${inputTestCase.replace(
    /'/g,
    `'\\"`
  )}' | java Main`;

  const javaDockerContainer = await createContainer(JAVA_IMAGE, [
    "/bin/bash",
    "-c",
    runCommand,
  ]);

  // starting the container
  await javaDockerContainer.start();

  console.log("Container started");

  const loggerStream = await javaDockerContainer.logs({
    stdout: true,
    stderr: true,
    timestamps: false,
    follow: true, // whether the logs are streamed or returned as a string
  });

  loggerStream.on("data", (chunk) => {
    rawLogBuffer.push(chunk);
  });

  await new Promise((res) => {
    loggerStream.on("end", () => {
      console.log(rawLogBuffer);
      const completeBuffer = Buffer.concat(rawLogBuffer);
      const decodedStream = decodeDockerStream(completeBuffer);
      console.log(decodedStream);
      console.log(decodedStream.stdout);
      res(decodedStream);
    });
  });

  // remove the container
  await javaDockerContainer.remove({ force: true });
}

export default runJava;
