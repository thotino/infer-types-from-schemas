import { describe, expect, it } from "vitest";
import { transports } from "winston";
import { logger } from "../logger.js";

describe("logger", () => {
    it("uses the configured levels and console transport", () => {
        expect(logger.levels).toEqual({
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
        });
        expect(logger.transports).toHaveLength(1);
        expect(logger.transports[0]).toBeInstanceOf(transports.Console);
    });
});
