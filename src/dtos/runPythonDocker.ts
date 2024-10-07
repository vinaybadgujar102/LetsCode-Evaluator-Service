import createContainer from "../containers/containerFactory";

async function runPython(code: string) {
  console.log("Initialising a new python container");

  const pythonDockerContainer = await createContainer("python:3.8-slim", [
    "python",
    "-c",
    code,
    "stty -echo",
  ]);

  // starting the container
  await pythonDockerContainer.start();

  console.log("Container started");

  return pythonDockerContainer;
}

export default runPython;
