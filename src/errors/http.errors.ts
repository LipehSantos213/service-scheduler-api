export class AppError extends Error {
    statusCode: number
    error: string

    constructor(error: string, message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
    }
}

export class BadRequestError extends AppError {
    constructor(error: string, message: string) {
        super(error, message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(error: string, message: string) {
        super(error, message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(error: string, message: string) {
        super(error, message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(error: string, message: string) {
        super(error, message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(error: string, message: string) {
        super(error, message, 409);
    }
}

export class UnprocessableEntityError extends AppError {
    constructor(error: string, message: string) {
        super(error, message, 422);
    }
}

export class TooManyRequestsError extends AppError {
    constructor(error: string, message: string) {
        super(error, message, 429);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string) {
        super("INTERNAL_SERVER_ERROR", message, 500);
    }
}