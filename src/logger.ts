import { createLogger, transports } from "winston";

export const logger = createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    },
    level: "debug",
    transports: [new transports.Console()],
});
