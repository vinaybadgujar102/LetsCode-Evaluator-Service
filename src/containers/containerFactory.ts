/* eslint-disable @typescript-eslint/no-explicit-any */
import Docker from "dockerode";

async function createContainer(imageName: string, cmdExecutable: string[]) {
  const docker = new Docker();

  // Check if the image exists locally
  try {
    await docker.getImage(imageName).inspect();
    console.log(`Image ${imageName} exists locally.`);
  } catch (err) {
    console.log(
      `Image ${imageName} not found locally. Pulling from registry...`
    );
    console.log(err);
    await new Promise((resolve, reject) => {
      docker.pull(imageName, (err: Error, stream: NodeJS.ReadableStream) => {
        if (err) {
          console.error(`Failed to pull image ${imageName}:`, err);
          return reject(err);
        }
        docker.modem.followProgress(
          stream,
          (err, output) => {
            if (err) {
              console.error(`Error during image pull:`, err);
              return reject(err);
            }
            console.log(`Successfully pulled image ${imageName}`);
            resolve(output);
          },
          (event) => {
            // Optional: handle progress events
            console.log(event.status);
          }
        );
      });
    });
  }

  // Proceed to create the container
  const container = await docker.createContainer({
    Image: imageName,
    Cmd: cmdExecutable,
    Tty: false,
    AttachStderr: true, // to enable error streams
    AttachStdout: true, // to enable output streams
    AttachStdin: true, // to enable input streams
    OpenStdin: true, // keep the input stream open even no interaction is there
    HostConfig: {
      Memory: 1024 * 1024 * 512, // 512 MB
    },
  });

  return container;
}

export default createContainer;
