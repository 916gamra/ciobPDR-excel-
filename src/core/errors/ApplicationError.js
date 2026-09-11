/**
 * Core Application Errors Hierarchy
 * CIOB GMAO Enterprise Architecture
 */

export class ApplicationError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, details = {}) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message, details = {}) {
    super(message, 'DB_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(message, errors = []) {
    super(message, 'VALIDATION_ERROR', 400, { errors });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message, resource = null) {
    super(message, 'NOT_FOUND', 404, { resource });
    this.name = 'NotFoundError';
  }
}

export class PermissionError extends ApplicationError {
  constructor(message, permission = null) {
    super(message, 'PERMISSION_DENIED', 403, { permission });
    this.name = 'PermissionError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message, conflict = null) {
    super(message, 'CONFLICT', 409, { conflict });
    this.name = 'ConflictError';
  }
}

export class InsufficientStockError extends ApplicationError {
  constructor(ref, available, requested) {
    super(
      `Stock insuffisant pour l'article ${ref} : disponible ${available}, demandé ${requested}`,
      'INSUFFICIENT_STOCK',
      400,
      { ref, available, requested, deficit: requested - available }
    );
    this.name = 'InsufficientStockError';
  }
}
