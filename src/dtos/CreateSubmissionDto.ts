import { z } from "zod";

// export interface CreateSumbissionDto {
//   userId: string;
//   problemId: string;
//   code: string;
//   language: string;
// }

export type CreateSumbissionDto = z.infer<typeof createSubmissionZodSchema>;

export const createSubmissionZodSchema = z
  .object({
    userId: z.string(),
    problemId: z.string(),
    code: z.string(),
    language: z.string(),
  })
  .strict();
