import { Request, Response } from "express";
import { CreateSumbissionDto } from "../dtos/CreateSubmissionDto";

export function addSubmission(req: Request, res: Response) {
  const submissionDto = req.body as CreateSumbissionDto;

  //TODO: Add validation using zod

  return res.status(201).json({
    success: true,
    error: {},
    message: "Submission collected successfully",
    data: submissionDto,
  });
}
