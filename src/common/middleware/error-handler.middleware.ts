import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export const errorHandlerMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode =
    error instanceof AppError
      ? error.statusCode
      : error instanceof ZodError || error instanceof multer.MulterError
        ? 400
        : res.statusCode >= 400
          ? res.statusCode
          : 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error",
    ...(error instanceof AppError && error.code ? { code: error.code } : {}),
    ...(error instanceof AppError && error.details
      ? { details: error.details }
      : {}),
  });
};
