import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefination";
import { SubmissionPayload } from "../types/submissionPayload";
import createExecutor from "../utils/ExecutorFactory";
import { ExecutionResponse } from "../types/codeExecutorStrategy";
import evaluatorQueueProducer from "../producers/evaluatorQueueProducer";

export default class SubmissionJob implements IJob {
  name: string;

  payload: Record<string, SubmissionPayload>;
  constructor(payload: Record<string, SubmissionPayload>) {
    this.payload = payload;
    this.name = this.constructor.name;
  }

  handle = async (job?: Job) => {
    console.log("job handler called");
    if (job) {
      const key = Object.keys(this.payload)[0];
      //   console.log(this.payload[key].language);
      const codeLanguage = this.payload[key].language;
      const code = this.payload[key].code;
      const inputCase = this.payload[key].inputCase;
      const outputTestCase = this.payload[key].outputCase;
      //   if (codeLanguage === "CPP") {
      //     const response = await runCpp(
      //       this.payload[key].code,
      //       this.payload[key].inputCase
      //     );
      //     console.log("Evaluated response is: ", response);
      //   }
      // }
      const strategy = createExecutor(codeLanguage);
      if (strategy != null) {
        const response: ExecutionResponse = await strategy.execute(
          code,
          inputCase,
          outputTestCase
        );

        evaluatorQueueProducer({
          response,
          userId: this.payload[key].userId,
          submissionId: this.payload[key].submissionId,
        });

        if (response.status === "COMPLETED") {
          console.log("Code executed successfully");
          console.log(response);
        } else {
          console.log("Code execution failed");
          console.log(response);
        }
      }
    }
  };

  failed = (job?: Job) => {
    console.log("job failed");
    if (job) {
      console.log(job.data);
    }
  };
}
