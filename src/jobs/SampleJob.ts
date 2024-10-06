import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefination";

export default class SampleJob implements IJob {
  name: string;

  payload: Record<string, unknown> | undefined;
  constructor(payload: Record<string, unknown>) {
    this.payload = payload;
    this.name = this.constructor.name;
  }

  handle = () => {
    console.log("job handler called");
  };

  failed = (job?: Job) => {
    console.log("job failed");
    if (job) {
      console.log(job.data);
    }
  };
}
