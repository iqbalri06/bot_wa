const logger = {
    info: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
    debug: (...args) => {
        if (process.env.DEBUG) console.debug(...args);
    },
    trace: (...args) => {
        if (process.env.DEBUG) console.trace(...args);
    }
};

// Add error handling helper
logger.handleError = (error, context = '') => {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error(`${context ? context + ': ' : ''}${errorMessage}`);
    if (process.env.DEBUG) {
        logger.debug(error?.stack);
    }
};

module.exports = logger;