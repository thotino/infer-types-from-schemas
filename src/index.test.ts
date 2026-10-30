import { describe, expectTypeOf, it } from "vitest";
import type { Infer } from "./index.js";

describe("Infer", () => {
    it("infers string schemas", () => {
        expectTypeOf<Infer<{ type: "string" }>>().toEqualTypeOf<string>();
    });

    it("infers number schemas", () => {
        expectTypeOf<Infer<{ type: "number" }>>().toEqualTypeOf<number>();
    });

    it("infers boolean schemas", () => {
        expectTypeOf<Infer<{ type: "boolean" }>>().toEqualTypeOf<boolean>();
    });

    it("adds undefined for optional schemas", () => {
        expectTypeOf<
            Infer<{ readonly optional: true; type: "string" }>
        >().toEqualTypeOf<string | undefined>();
    });

    it("does not add undefined when optional is false", () => {
        expectTypeOf<
            Infer<{ optional: false; type: "number" }>
        >().toEqualTypeOf<number>();
    });

    it("preserves unions of supported schema types", () => {
        expectTypeOf<Infer<{ type: "string" | "number" }>>().toEqualTypeOf<
            string | number
        >();
    });

    it("passes through values that are not schemas", () => {
        expectTypeOf<Infer<{ name: "test" }>>().toEqualTypeOf<{
            name: "test";
        }>();
    });
});
