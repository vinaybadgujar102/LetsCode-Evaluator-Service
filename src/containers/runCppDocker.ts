import { CPP_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";

async function runCpp(code: string, inputTestCase: string) {
  console.log("Initialising a new Cpp container");
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
  )}' > main.cpp && g++ main.cpp -o main && echo '${inputTestCase.replace(
    /'/g,
    `'\\"`
  )}' | ./main`;

  const cppDockerContainer = await createContainer(CPP_IMAGE, [
    "/bin/bash",
    "-c",
    runCommand,
  ]);

  // starting the container
  await cppDockerContainer.start();

  console.log("Container started");

  const loggerStream = await cppDockerContainer.logs({
    stdout: true,
    stderr: true,
    timestamps: false,
    follow: true, // whether the logs are streamed or returned as a string
  });

  loggerStream.on("data", (chunk) => {
    rawLogBuffer.push(chunk);
  });

  const response = await new Promise((res) => {
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
  await cppDockerContainer.remove({ force: true });
  return response;
}

export default runCpp;
