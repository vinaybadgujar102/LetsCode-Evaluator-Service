import express from "express";
import { addSubmission } from "../../controllers/submissionController";
import { validate } from "../../validators/zodValidator";
import { createSubmissionZodSchema } from "../../dtos/CreateSubmissionDto";

const submissionRouter = express.Router();

// @ts-expect-error i dont know why this error is coming
submissionRouter.post("/", validate(createSubmissionZodSchema), addSubmission);

export default submissionRouter;
