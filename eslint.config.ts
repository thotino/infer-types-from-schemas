import vitest from "@vitest/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["dist/**", "node_modules/**"],
    },
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.test.ts"],
        plugins: { vitest },
        rules: {
            ...vitest.configs.recommended.rules,
            "vitest/expect-expect": [
                "error",
                { assertFunctionNames: ["expect", "expectTypeOf"] },
            ],
        },
    },
);
