enum BaseTypes {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
}
type SchemaTypeKey = "type";
type SchemaBase<Item extends string | number | boolean> = {
    optional?: boolean;
    type: Item;
};
type ArraySchemaBase<ItemType> = {
    type: "array";
    items: ItemType;
};
const stringSchema = {
    type: "string",
} as const;
const numberSchema = {
    type: "number",
} as const;
const booleanSchema = {
    type: "boolean",
} as const;
function optional<T extends SchemaBase<string | number | boolean>>(
    schema: T,
): Readonly<{ optional: true; type: T[SchemaTypeKey] }> {
    return { optional: true, type: schema.type };
}
function array<T extends SchemaBase<string | number | boolean>>(
    schema: T,
): Readonly<{ type: "array"; items: T }> {
    return {
        type: "array",
        items: { ...schema, type: schema.type, optional: schema.optional },
    };
}
const optionalString = optional(stringSchema);
const stringArray = array(stringSchema);
const nestedArray = array(array(stringSchema));
type OptionalTString = typeof stringArray;
type IsString<T> = T extends Readonly<{ type: "string" }> ? true : false;
type IsNumber<T> = T extends Readonly<{ type: "number" }> ? true : false;
type IsBoolean<T> = T extends Readonly<{ type: "boolean" }> ? true : false;

type IsPrimitive<T> =
    IsString<T> extends true
        ? true
        : IsNumber<T> extends true
          ? true
          : IsBoolean<T> extends true
            ? true
            : false;
type ExtractPrimitive<T> = T extends SchemaBase<infer I> ? I : never;
type IsOptional<T> = T extends Readonly<{ optional: true }> ? true : false;
type ExtractOptional<T> = T extends SchemaBase<infer I> ? I | undefined : never;
type IsArray<T> = T extends Readonly<{ type: "array" }> ? true : false;

type ExtractArray<T> =
    T extends ArraySchemaBase<infer I>
        ? IsPrimitive<I> extends true
            ? ExtractPrimitive<I>[]
            : ExtractArray<I>[]
        : never;

export type Infer<T> =
    IsPrimitive<T> extends true
        ? ExtractPrimitive<T>
        : IsArray<T> extends true
          ? ExtractArray<T>
          : never;

type A = Infer<typeof stringSchema>; // string
type B = Infer<typeof numberSchema>; // number
type C = Infer<typeof booleanSchema>; // boolean
type D = Infer<typeof optionalString>; // string | undefined
type E = Infer<typeof stringArray>; // string[]
type F = Infer<typeof nestedArray>; // string[][]
