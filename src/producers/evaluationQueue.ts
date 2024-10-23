import { Queue } from "bullmq";
import redisConnection from "../config/redisConfig";

export const evaluationQueue = new Queue("EvaluationQueue", {
  connection: redisConnection,
});
