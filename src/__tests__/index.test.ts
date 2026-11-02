import { describe, expectTypeOf, it } from "vitest";
import {
    array,
    booleanSchema,
    numberSchema,
    object,
    partial,
    stringSchema,
    union,
    type Infer,
} from "../index.js";

describe("Infer", () => {
    it("infers primitive properties", () => {
        const schema = object({
            name: stringSchema,
            age: numberSchema,
        });
        type User = Infer<typeof schema>;
        expectTypeOf<User>().toExtend<{ name: string; age: number }>();
    });
    it("infers optional properties", () => {
        const schema = object({
            name: stringSchema,
            age: numberSchema,
            nickname: partial(stringSchema),
        });
        type User = Infer<typeof schema>;
        expectTypeOf<User>().toExtend<{
            name: string;
            age: number;
            nickname?: string;
        }>();
    });
    it("infers nested properties", () => {
        const schema = object({
            name: stringSchema,
            scores: array(numberSchema),
            metadata: object({
                active: booleanSchema,
                tags: array(stringSchema),
            }),
        });

        type Result = Infer<typeof schema>;
        expectTypeOf<Result>().toExtend<{
            name: string;
            scores: number[];
            metadata: {
                active: boolean;
                tags: string[];
            };
        }>();
    });
    it("infers unions", () => {
        const schema = object({
            id: union(stringSchema, numberSchema),
        });

        type Result = Infer<typeof schema>;
        expectTypeOf<Result>().toExtend<{
            id: string | number;
        }>();
    });
});
