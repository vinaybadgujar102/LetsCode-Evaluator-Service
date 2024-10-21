import EvaluationQueue from "../queues/evaluationQueue";

export default async function (payload: Record<string, unknown>) {
  await EvaluationQueue.add("EvaluationJob", payload);
  console.log("Evaluation Job added to queue");
}
