// import Docker from 'dockerode';
// import { TestCases } from '../types/testCases';
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
    console.log("Python executor called");
    console.log(code, inputTestCase, outputTestCase);

    const rawLogBuffer: Buffer[] = [];

    console.log("Initialising a new Python docker container");
    console.log(`Code received is \n ${code.replace(/'/g, `'\\"`)}`);
    const runCommand = `echo '${code.replace(
      /'/g,
      `'\\"`
    )}' > test.py && echo '${inputTestCase.replace(
      /'/g,
      `'\\"`
    )}' | python3 test.py`;
    console.log(runCommand);

    const pythonDockerContainer = await createContainer(PYTHON_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);

    // starting / booting the corresponding docker container
    await pythonDockerContainer.start();

    console.log("Started the docker container");

    const loggerStream = await pythonDockerContainer.logs({
      stdout: true,
      stderr: true,
      timestamps: false,
      follow: true, // whether the logs are streamed or returned as a string
    });

    // Attach events on the stream objects to start and stop reading
    loggerStream.on("data", (chunk) => {
      rawLogBuffer.push(chunk);
    });

    try {
      const codeResponse: string = await this.fetchDecodedStream(
        loggerStream,
        rawLogBuffer
      );

      // Compare output with expected outputTestCase
      if (codeResponse.trim() === outputTestCase.trim()) {
        return { output: codeResponse, status: "SUCCESS" };
      } else {
        return { output: codeResponse, status: "WA" }; // Wrong Answer
      }
    } catch (error) {
      console.log("Error occurred", error);
      if (error === "TLE") {
        await pythonDockerContainer.kill();
      }
      return { output: error as string, status: "ERROR" };
    } finally {
      await pythonDockerContainer.remove();
    }
  }

  fetchDecodedStream(
    loggerStream: NodeJS.ReadableStream,
    rawLogBuffer: Buffer[]
  ): Promise<string> {
    return new Promise((res, rej) => {
      const timeout = setTimeout(() => {
        console.log("Timeout called");
        rej("TLE");
      }, 2000);
      loggerStream.on("end", () => {
        // This callback executes when the stream ends
        clearTimeout(timeout);
        console.log(rawLogBuffer);
        const completeBuffer = Buffer.concat(rawLogBuffer);
        const decodedStream = decodeDockerStream(completeBuffer);

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
