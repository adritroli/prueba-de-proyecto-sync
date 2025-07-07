import { Request, Response } from "express";

export function errorHandler(err: Error & { status?: number }, req: Request, res: Response) {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err : undefined,
  });
}
