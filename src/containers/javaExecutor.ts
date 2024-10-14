import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";
import { JAVA_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";

class JavaExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string
  ): Promise<ExecutionResponse> {
    console.log("Initialising a new java container");

    console.log(code, inputTestCase, outputTestCase);

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

    try {
      const codeResponse: string = await this.fetchDecodedStream(
        loggerStream,
        rawLogBuffer
      );

      if (codeResponse.trim() === outputTestCase.trim()) {
        return {
          output: codeResponse,
          status: "COMPLETED",
        };
      } else {
        return {
          output: codeResponse,
          status: "WA",
        };
      }
    } catch (error) {
      if (error === "TLE") {
        await javaDockerContainer.kill();
      }
      return {
        output: error as string,
        status: "ERROR",
      };
    } finally {
      // remove the container
      await javaDockerContainer.remove({ force: true });
    }
  }

  fetchDecodedStream(
    loggerStream: NodeJS.ReadableStream,
    rawLogBuffer: Buffer[]
  ): Promise<string> {
    return new Promise((res, rej) => {
      const timeout = setTimeout(() => {
        console.log("Timed out");
        rej("TLE");
      }, 2000);

      loggerStream.on("end", () => {
        clearTimeout(timeout);
        console.log(rawLogBuffer);
        const completeBuffer = Buffer.concat(rawLogBuffer);
        const decodedStream = decodeDockerStream(completeBuffer);
        console.log(decodedStream);
        console.log(decodedStream.stdout);
        if (decodedStream.stderr) {
          rej(decodedStream.stderr);
        } else {
          res(decodedStream.stdout);
        }
      });
    });
  }
}

export default JavaExecutor;
