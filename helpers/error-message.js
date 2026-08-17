function getValidationErrorMessage(err) {
    return err.errors
        .map(error => error.message)
        .join(" • ");
}

module.exports = getValidationErrorMessage;