const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  info: (message, ...args) => {
    console.info(`[INFO] ${message}`, ...args);
  },

  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },

  debug: (message, ...args) => {
    if (isProduction) return;

    console.debug(`[DEBUG] ${message}`, ...args);
  },
};
