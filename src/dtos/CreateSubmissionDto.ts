import { z } from "zod";

// export interface CreateSumbissionDto {
//   userID: string;
//   problemId: string;
//   code: string;
//   language: string;
// }

export type CreateSumbissionDto = z.infer<typeof createSubmissionZodSchema>;

export const createSubmissionZodSchema = z
  .object({
    userID: z.string(),
    problemId: z.string(),
    code: z.string(),
    language: z.string(),
  })
  .strict();
