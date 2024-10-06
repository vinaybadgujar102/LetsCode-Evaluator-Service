import express from "express";
import { addSubmission } from "../../controllers/submissionController";
import { validate } from "../../validators/validate";
import { createSubmissionZodSchema } from "../../dtos/CreateSubmissionDto";

const submissionRouter = express.Router();

submissionRouter.post("/", validate(createSubmissionZodSchema), addSubmission);

export default submissionRouter;
