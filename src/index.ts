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
type BaseSchema = { optional?: boolean };
type PrimitiveSchema<Item extends BaseTypes> = BaseSchema & {
    type: Item;
};
type ArraySchema<ItemType> = BaseSchema & {
    type: "array";
    items: ItemType;
};
type UnionSchema = BaseSchema & {
    type: [
        keyof PrimitiveTypeMap,
        keyof PrimitiveTypeMap,
        ...(keyof PrimitiveTypeMap)[],
    ];
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
function optional<
    T extends
        | PrimitiveSchema<BaseTypes>
        | UnionSchema
        | ArraySchema<PrimitiveSchema<BaseTypes>>,
>(schema: T): Readonly<{ optional: true; type: T[SchemaTypeKey]; items: T }> {
    return { optional: true, type: schema.type, items: schema };
}
function array<
    T extends
        | PrimitiveSchema<BaseTypes>
        | UnionSchema
        | ArraySchema<PrimitiveSchema<BaseTypes>>,
>(schema: T): Readonly<{ type: "array"; items: T }> {
    return {
        type: "array",
        items: { ...schema, type: schema.type, optional: schema.optional },
    };
}
function union<
    T extends PrimitiveSchema<BaseTypes>,
    U extends PrimitiveSchema<BaseTypes>,
>(
    firstSchema: T,
    secondSchema: U,
): Readonly<{ type: [T[SchemaTypeKey], U[SchemaTypeKey]] }> {
    return { type: [firstSchema.type, secondSchema.type] };
}

function object(params: Record<string, PrimitiveSchema<BaseTypes>>) {}

const optionalString = optional(stringSchema);
const stringArray = array(stringSchema);
const nestedArray = array(array(stringSchema));
const idSchema = union(stringSchema, numberSchema);
const complexSchema = array(union(stringSchema, booleanSchema));

type OptionalTString = typeof optionalString;

type ExtractType<T> = T extends keyof PrimitiveTypeMap
    ? PrimitiveTypeMap[T]
    : never;

type IsPrimitive<T> =
    T extends Readonly<{ type: keyof PrimitiveTypeMap }> ? true : false;
type ExtractPrimitive<T> =
    T extends PrimitiveSchema<infer I> ? ExtractType<I> : never;

type IsOptional<T> = T extends Readonly<{ optional: true }> ? true : false;
type ApplyOptional<T> = T | undefined;

type ApplySchemaOptionality<S, V> =
    IsOptional<S> extends true ? ApplyOptional<V> : V;

type IsArray<T> = T extends Readonly<{ type: "array" }> ? true : false;
type ExtractArray<T> = T extends ArraySchema<infer I> ? Infer<I>[] : never;

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
        ? ApplySchemaOptionality<T, ExtractPrimitive<T>>
        : IsUnion<T> extends true
          ? ApplySchemaOptionality<T, ExtractUnion<T>>
          : IsArray<T> extends true
            ? ApplySchemaOptionality<T, ExtractArray<T>>
            : never;

type A = Infer<typeof stringSchema>; // string
type B = Infer<typeof numberSchema>; // number
type C = Infer<typeof booleanSchema>; // boolean
type D = Infer<typeof optionalString>; // string | undefined
type E = Infer<typeof stringArray>; // string[]
type F = Infer<typeof nestedArray>; // string[][]
type G = Infer<typeof idSchema>; // string | number
type H = Infer<typeof complexSchema>; // (string | number)[]
