import { describe, expectTypeOf, it } from "vitest";
import {
    array,
    booleanSchema,
    numberSchema,
    object,
    optional,
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
        expectTypeOf<User>().toEqualTypeOf<{ name: string; age: number }>();
    });
    it("infers optional primitive properties", () => {
        const schema = optional(stringSchema);
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<
            string | undefined
        >();
    });
    it("infers optional array properties", () => {
        const schema = optional(array(stringSchema));
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<
            string[] | undefined
        >();
    });
    it("infers nested arrays", () => {
        const schema = array(array(array(stringSchema)));
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<string[][][]>();
    });
    it("infers nested object", () => {
        const schema = object({
            id: stringSchema,
            address: object({
                city: stringSchema,
                country: stringSchema,
            }),
        });
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<{
            id: string;
            address: {
                city: string;
                country: string;
            };
        }>();
    });
    it("infers object with partial and optional properties", () => {
        const schema = object({
            name: stringSchema,
            age: partial(numberSchema),
            email: optional(stringSchema),
        });
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<{
            name: string;
            age?: number;
            email: string | undefined;
        }>();
    });
    it("infers object with partial nested objects", () => {
        const schema = object({
            user: partial(
                object({
                    name: stringSchema,
                    age: numberSchema,
                }),
            ),
        });
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<{
            user?: {
                name: string;
                age: number;
            };
        }>();
    });
    it("infers object with partial and optional nested objects", () => {
        const schema = object({
            user: partial(
                optional(
                    object({
                        name: stringSchema,
                    }),
                ),
            ),
        });
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<{
            user?:
                | {
                      name: string;
                  }
                | undefined;
        }>();
    });
    it("infers object with partial and optional nested objects by commutating the helpers", () => {
        const schema = object({
            user: optional(
                partial(
                    object({
                        name: stringSchema,
                    }),
                ),
            ),
        });
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<{
            user?:
                | {
                      name: string;
                  }
                | undefined;
        }>();
    });
    it("infers union tables", () => {
        const schema = array(union(stringSchema, numberSchema));
        expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<
            (string | number)[]
        >();
    });
    it("infers object with partial properties", () => {
        const schema = object({
            name: stringSchema,
            age: numberSchema,
            nickname: partial(stringSchema),
        });
        type User = Infer<typeof schema>;
        expectTypeOf<User>().toEqualTypeOf<{
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
        expectTypeOf<Result>().toEqualTypeOf<{
            name: string;
            scores: number[];
            metadata: {
                active: boolean;
                tags: string[];
            };
        }>();
    });
    it("infers unions of different types", () => {
        const schema = union(stringSchema, numberSchema);

        type Result = Infer<typeof schema>;
        expectTypeOf<Result>().toEqualTypeOf<string | number>();
    });
    it("infers unions of different types", () => {
        const schema = union(stringSchema, stringSchema);

        type Result = Infer<typeof schema>;
        expectTypeOf<Result>().toEqualTypeOf<string>();
    });
    it("infers unions in objects", () => {
        const schema = object({
            id: union(stringSchema, numberSchema),
        });

        type Result = Infer<typeof schema>;
        expectTypeOf<Result>().toEqualTypeOf<{
            id: string | number;
        }>();
    });
});
