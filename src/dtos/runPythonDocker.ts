import createContainer from "../containers/containerFactory";

async function runPython(code: string) {
  console.log("Initialising a new python container");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawLogBuffer: any[] = [];
  const pythonDockerContainer = await createContainer("python:3.8-slim", [
    "python",
    "-c",
    code,
    "stty -echo",
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

  loggerStream.on("end", () => {
    console.log(rawLogBuffer);
  });

  return pythonDockerContainer;
}

export default runPython;
