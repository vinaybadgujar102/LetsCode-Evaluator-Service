import { evaluationQueue } from "./evaluationQueue";

export default async function (payload: Record<string, unknown>) {
  await evaluationQueue.add("EvaluationJob", payload);
  console.log("Evaluation Job added to queue");
}
