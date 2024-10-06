/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodSchema } from "zod";
import { NextFunction, Request, Response } from "express";

export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        ...req.body,
      });

      next();
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: "Invalid request params recieved",
        data: {},
        error: error,
      });
    }
  };
