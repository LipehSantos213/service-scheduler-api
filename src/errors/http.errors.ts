import createError from "@fastify/error";

/* =========================
   2xx — SUCESSO (raramente lançados)
========================= */
// Normalmente NÃO se lança erro 2xx
// incluído apenas por padronização

export const Ok = createError(
  "OK",
  " ",
  200
);

export const Created = createError(
  "CREATED",
  " ",
  201
);

/* =========================
   4xx — ERROS DO CLIENTE
========================= */

// 400
export const BadRequestError = createError(
  "BAD_REQUEST",
  " ",
  400
);

// 401
export const UnauthorizedError = createError(
  "UNAUTHORIZED",
  " ",
  401
);

// 403
export const ForbiddenError = createError(
  "FORBIDDEN",
  " ",
  403
);

// 404
export const NotFoundError = createError(
  "NOT_FOUND",
  " ",
  404
);

// 409
export const ConflictError = createError(
  "CONFLICT",
  " ",
  409
);

// 422
export const UnprocessableEntityError = createError(
  "UNPROCESSABLE_ENTITY",
  " ",
  422
);

// 429
export const TooManyRequestsError = createError(
  "TOO_MANY_REQUESTS",
  " ",
  429
);

/* =========================
   5xx — ERROS DO SERVIDOR
========================= */

// 500
export const InternalServerError = createError(
  "INTERNAL_SERVER_ERROR",
  " ",
  500
);

// 502
export const BadGatewayError = createError(
  "BAD_GATEWAY",
  " ",
  502
);

// 503
export const ServiceUnavailableError = createError(
  "SERVICE_UNAVAILABLE",
  " ",
  503
);
