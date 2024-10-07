export const PYTHON_IMAGE = "python:3.8-slim";
export const JAVA_IMAGE = "openjdk:24-jdk-slim";
export const CPP_IMAGE = "gcc:latest";

export const submission_queue = "SubmissionQueue";
// this will represent header size of docker stream
// docker stream header will contain data about type of stream i.e. stdout or stderr
// and the length of the stream
export const DOCKER_STREAM_HEADER_SIZE = 8;
