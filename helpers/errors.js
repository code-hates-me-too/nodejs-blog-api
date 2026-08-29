class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

class NotFoundError extends AppError {
    constructor(message = "Kayıt bulunamadı.") {
        super(message, 404);
    }
}

class ForbiddenError extends AppError {
    constructor(message = "Bu işlem için yetkiniz yok.") {
        super(message, 403);
    }
}

module.exports = { AppError, NotFoundError, ForbiddenError };