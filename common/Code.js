const create = (code, message) => ({ code, message });

const Code = {
    OK: create(0, "Success"),
    FAILED: create(1, "Failed"),

    NOT_FOUND: create(10, "The requested information could not be found."),

    CANT_ACCESS_11: create(11, "Unable to access for one week."),
    CANT_ACCESS_12: create(12, "Unable to access for one week."),
    CANT_ACCESS_13: create(13, "Unable to access for one week."),
    CANT_ACCESS_14: create(14, "Permanently unable to access."),

    UNKNOWN_COMMAND: create(20, "The request is unknown command."),

    BAD_REQUEST: create(101, "The request is incorrect."),
    EXPIRED_TOKEN: create(102, "The token has expired."),
    INVALID_TOKEN: create(103, "The provided token information is incorrect."),
    UNAUTHORIZED: create(104, "Authentication required."),
    DUPLICATE_LOGIN: create(105, "Duplicate login detected. You have logged in from another device."),
    SESSION_EXPIRED: create(106, "Session expired."),

    EXCEPTION: create(900, "An error occurred during the execution of a database command."),
};
module.exports = Code