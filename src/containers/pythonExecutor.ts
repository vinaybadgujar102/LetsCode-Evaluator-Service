import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";
import { PYTHON_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";

class PythonExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCase: string,
    outputTestCase: string
  ): Promise<ExecutionResponse> {
    console.log("Initialising a new python container");

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
    )}' > test.py && echo '${inputTestCase.replace(
      /'/g,
      `'\\"`
    )}' | python3 test.py`;

    const pythonDockerContainer = await createContainer(PYTHON_IMAGE, [
      "/bin/bash",
      "-c",
      runCommand,
    ]);

    // starting the container
    await pythonDockerContainer.start();

    console.log("Container started");

    const loggerStream = await pythonDockerContainer.logs({
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
      return {
        output: codeResponse,
        status: "COMPLETED",
      };
    } catch (error) {
      return {
        output: error as string,
        status: "ERROR",
      };
    } finally {
      // remove the container
      await pythonDockerContainer.remove({ force: true });
    }
  }

  fetchDecodedStream(
    loggerStream: NodeJS.ReadableStream,
    rawLogBuffer: Buffer[]
  ): Promise<string> {
    return new Promise((res, rej) => {
      loggerStream.on("end", () => {
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

export default PythonExecutor;
