import { CPP_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";

class CppExecutor {
  async execute(
    code: string,
    inputTestCase: string
  ): Promise<{ output: string; status: string }> {
    console.log("Initializing a new C++ Docker container");
    const rawLogBuffer: Buffer[] = [];

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

    // Start the container
    await cppDockerContainer.start();
    console.log("Docker container started");

    const loggerStream = await cppDockerContainer.logs({
      stdout: true,
      stderr: true,
      timestamps: false,
      follow: true,
    });

    loggerStream.on("data", (chunk) => {
      rawLogBuffer.push(chunk);
    });

    try {
      const codeResponse: string = await this.fetchDecodedStream(
        loggerStream,
        rawLogBuffer
      );
      return { output: codeResponse, status: "COMPLETED" };
    } catch (error) {
      return { output: error as string, status: "ERROR" };
    } finally {
      await cppDockerContainer.remove({ force: true });
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
        clearTimeout(timeout);
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

export default CppExecutor;
