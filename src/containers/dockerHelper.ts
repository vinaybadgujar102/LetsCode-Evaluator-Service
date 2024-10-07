import DockerStreamOutput from "../types/dockerStreamOutput";
import { DOCKER_STREAM_HEADER_SIZE } from "../utils/constants";

export function decodeDockerStream(buffer: Buffer): DockerStreamOutput {
  let offset = 0; // this keeps track of the current position in the buffer while parsing

  // the output that will store the accumulated stoud and stderr output as the strings
  const output: DockerStreamOutput = {
    stdout: "",
    stderr: "",
  };

  // loop until offset reaches end of the buffer
  while (offset < buffer.length) {
    // typeOfString is read from buffer and has value of type of stream
    const typeOfString = buffer[offset];

    // this holds the length of the value
    // we will read this variable on an offset of 4 bytes of the chunk
    const length = buffer.readUInt32BE(offset + 4);

    // as now we have read the header, we can move forward to the value of the chunk
    offset += DOCKER_STREAM_HEADER_SIZE;

    if (typeOfString === 1) {
      // stdout stream
      output.stdout += buffer.toString("utf-8", offset, offset + length);
    } else if (typeOfString === 2) {
      // stderr stream
      output.stderr += buffer.toString("utf-8", offset, offset + length);
    }

    offset += length; // move the offset to next chunk
  }

  return output;
}
