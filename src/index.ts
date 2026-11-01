enum BaseTypes {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
}
type PrimitiveTypeMap = {
    [BaseTypes.BOOLEAN]: boolean;
    [BaseTypes.NUMBER]: number;
    [BaseTypes.STRING]: string;
};
type SchemaTypeKey = "type";
type SchemaBase<Item extends BaseTypes> = {
    optional?: boolean;
    type: Item;
};
type ArraySchemaBase<ItemType> = {
    type: "array";
    items: ItemType;
    optional?: boolean;
};
type UnionSchema = {
    type: [
        keyof PrimitiveTypeMap,
        keyof PrimitiveTypeMap,
        ...(keyof PrimitiveTypeMap)[],
    ];
    optional?: boolean;
};
const stringSchema = {
    type: BaseTypes.STRING,
} as const;
const numberSchema = {
    type: BaseTypes.NUMBER,
} as const;
const booleanSchema = {
    type: BaseTypes.BOOLEAN,
} as const;
function optional<T extends SchemaBase<BaseTypes>>(
    schema: T,
): Readonly<{ optional: true; type: T[SchemaTypeKey] }> {
    return { optional: true, type: schema.type };
}
function array<
    T extends
        | SchemaBase<BaseTypes>
        | UnionSchema
        | ArraySchemaBase<SchemaBase<BaseTypes>>,
>(schema: T): Readonly<{ type: "array"; items: T }> {
    return {
        type: "array",
        items: { ...schema, type: schema.type, optional: schema.optional },
    };
}
function union<
    T extends SchemaBase<BaseTypes>,
    U extends SchemaBase<BaseTypes>,
>(firstSchema: T, secondSchema: U): Readonly<{ type: [T["type"], U["type"]] }> {
    return { type: [firstSchema.type, secondSchema.type] };
}

const optionalString = optional(stringSchema);
const stringArray = array(stringSchema);
const nestedArray = array(array(stringSchema));
const idSchema = union(stringSchema, numberSchema);
const complexSchema = array(union(stringSchema, booleanSchema));

type OptionalTString = typeof optionalString;
type IsString<T> =
    T extends Readonly<{ type: BaseTypes.STRING }> ? true : false;
type IsNumber<T> =
    T extends Readonly<{ type: BaseTypes.NUMBER }> ? true : false;
type IsBoolean<T> =
    T extends Readonly<{ type: BaseTypes.BOOLEAN }> ? true : false;

type ExtractType<T> = T extends keyof PrimitiveTypeMap
    ? PrimitiveTypeMap[T]
    : never;

type IsPrimitive<T> =
    IsString<T> extends true
        ? true
        : IsNumber<T> extends true
          ? true
          : IsBoolean<T> extends true
            ? true
            : false;
type ExtractPrimitive<T> =
    T extends SchemaBase<infer I> ? ExtractType<I> : never;

type IsOptional<T> = T extends Readonly<{ optional: true }> ? true : false;
type ExtractOptional<T> = T | undefined;

type IsArray<T> = T extends Readonly<{ type: "array" }> ? true : false;
type ExtractArray<T> = T extends ArraySchemaBase<infer I> ? Infer<I>[] : never;

type IsUnion<T> =
    T extends Readonly<{
        type: [
            keyof PrimitiveTypeMap,
            keyof PrimitiveTypeMap,
            ...(keyof PrimitiveTypeMap)[],
        ];
    }>
        ? true
        : false;
type ExtractUnion<T> =
    T extends Readonly<{ type: [...(infer I)[]] }> ? ExtractType<I> : never;

export type Infer<T> =
    IsPrimitive<T> extends true
        ? ExtractPrimitive<T>
        : IsUnion<T> extends true
          ? ExtractUnion<T>
          : IsArray<T> extends true
            ? ExtractArray<T>
            : IsOptional<T> extends true ? ExtractOptional<T>;

type A = Infer<typeof stringSchema>; // string
type B = Infer<typeof numberSchema>; // number
type C = Infer<typeof booleanSchema>; // boolean
type D = Infer<typeof optionalString>; // string | undefined
type E = Infer<typeof stringArray>; // string[]
type F = Infer<typeof nestedArray>; // string[][]
type G = Infer<typeof idSchema>; // string | number
type H = Infer<typeof complexSchema>; // (string | number)[]
