import Docker from "dockerode";

async function createContainer(imageName: string, cmdExecutable: string[]) {
  const docker = new Docker();

  const container = await docker.createContainer({
    Image: imageName,
    Cmd: cmdExecutable,
    Tty: false,
    AttachStderr: true, // to enable error streams
    AttachStdout: true, // to enable output streams
    AttachStdin: true, // to enable input streams
    OpenStdin: true, // keep the input stream open even no interaction is there
  });

  return container;
}

export default createContainer;
