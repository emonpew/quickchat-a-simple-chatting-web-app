// src/services/response.service.ts
import { Response } from "express";
import { WebSocket } from "ws";

class ResponseService {
  // Successful Responses
  static success(
    res: Response,
    options: {
      code?: number;
      message?: string;
      data?: any;
      meta?: any;
    } = {}
  ) {
    const {
      code = 200,
      message = "successful",
      data = null,
      meta = null,
    } = options;

    const response: any = {
      status: "success",
      code,
      message,
    };

    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;

    return res.status(code).json(response);
  }

  // Error Responses
  static error(
    res: Response,
    options: {
      code?: number;
      message: string;
      errors?: any[];
      details?: any;
    }
  ) {
    const { code = 500, message, errors = [], details = null } = options;

    const response: any = {
      status: "error",
      code,
      message,
    };

    if (errors.length > 0) response.errors = errors;
    if (details !== null) response.details = details;

    return res.status(code).json(response);
  }

  // Specific Response Helpers
  static created(res: Response, item: string, data?: any) {
    const message = `${item} created successfully`;
    return this.success(res, {
      code: 201,
      message,
      data,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static badRequest(res: Response, message: string, errors?: any[]) {
    return this.error(res, {
      code: 400,
      message,
      errors,
    });
  }

  static unauthorized(res: Response, message = "Authentication required") {
    return this.error(res, {
      code: 401,
      message,
    });
  }

  static forbidden(res: Response, message = "Forbidden") {
    return this.error(res, {
      code: 403,
      message,
    });
  }

  static notFound(res: Response, item?: string) {
    const message = item ? `${item} not found` : "Resource not found";
    return this.error(res, {
      code: 404,
      message,
    });
  }

  static conflict(res: Response, item?: string, details?: any) {
    const message = item ? `${item} already exists` : "content already exists";
    return this.error(res, {
      code: 409,
      message,
      details,
    });
  }

  static validationError(res: Response, message: string, errors: any[]) {
    return this.error(res, {
      code: 422,
      message,
      errors,
    });
  }

  static internalServerError(res: Response, message = "Internal server error") {
    return this.error(res, {
      code: 500,
      message,
    });
  }

  static wsError(error: unknown, ws: WebSocket) {
    console.error("Message handling error:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        payload: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to process message",
        },
      })
    );
  }
}

export default ResponseService;
