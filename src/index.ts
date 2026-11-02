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
type ArraySchema<Item> = BaseSchema & {
    type: "array";
    items: Item;
};
type UnionSchema = BaseSchema & {
    type: [
        keyof PrimitiveTypeMap,
        keyof PrimitiveTypeMap,
        ...(keyof PrimitiveTypeMap)[],
    ];
};
type ObjectSchema = BaseSchema & {
    type: "object";
    properties: Record<
        string,
        PrimitiveSchema<BaseTypes> | ArraySchema<BaseTypes> | UnionSchema
    >;
};
export const stringSchema = {
    type: BaseTypes.STRING,
} as const;
export const numberSchema = {
    type: BaseTypes.NUMBER,
} as const;
export const booleanSchema = {
    type: BaseTypes.BOOLEAN,
} as const;
export function optional<
    T extends
        | PrimitiveSchema<BaseTypes>
        | UnionSchema
        | ArraySchema<PrimitiveSchema<BaseTypes>>,
>(schema: T): Readonly<{ optional: true; type: T[SchemaTypeKey]; items: T }> {
    return { optional: true, type: schema.type, items: schema };
}
export function array<
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
export function union<
    T extends PrimitiveSchema<BaseTypes>,
    U extends PrimitiveSchema<BaseTypes>,
>(
    firstSchema: T,
    secondSchema: U,
): Readonly<{ type: [T[SchemaTypeKey], U[SchemaTypeKey]] }> {
    return { type: [firstSchema.type, secondSchema.type] };
}

export function object<T>(params: T): Readonly<{ type: "object"; properties: T }> {
    return { type: "object", properties: { ...params } };
}

export function partial<T extends PrimitiveSchema<BaseTypes>>(
    schema: T,
): Readonly<{ partial: true; type: T[SchemaTypeKey] }> {
    return { partial: true, type: schema.type };
}

const optionalString = optional(stringSchema);
const stringArray = array(stringSchema);
const nestedArray = array(array(stringSchema));
const idSchema = union(stringSchema, numberSchema);
const complexSchema = array(union(stringSchema, booleanSchema));
const userSchema = object({
    id: numberSchema,
    name: stringSchema,
    email: optional(stringSchema),
    roles: array(stringSchema),
    nickname: partial(stringSchema),
});
const productSchema = object({
    name: stringSchema,
    price: numberSchema,
    available: booleanSchema,
});

type OptionalTString = typeof userSchema;

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

type IsObject<T> = T extends Readonly<{ type: "object" }> ? true : false;
type ExtractObject<T> =
    T extends Readonly<{ properties: infer I }> ? InferTypeMapper<I> : never;
type IsPartialProperty<T> =
    T extends Readonly<{ partial: true }> ? true : false;
type PartialTypeMapper<T, K extends keyof T> = {
    [P in K]?: Infer<T[P]>;
};
// type InferTypeMapper<T> = {
//     [K in keyof T]?: IsPartialProperty<T[K]> extends true
//         ? InferPartialPropertyTypeMapper<T, K>[K]
//         : InferNonPartialPropertyTypeMapper<T, K>[K];
// };
type InferPartialPropertyTypeMapper<T, K extends keyof T> = {
    [P in K]?: Infer<T[P]>;
};
type InferNonPartialPropertyTypeMapper<T, K extends keyof T> = {
    [P in K]: Infer<T[P]>;
};
type PartialKeys<T> = {
    [K in keyof T]: IsPartialProperty<T[K]> extends true ? K : never;
}[keyof T];
type NonPartialKeys<T> = {
    [K in keyof T]: IsPartialProperty<T[K]> extends false ? K : never;
}[keyof T];
type SelectPartialKeys<T> = InferPartialPropertyTypeMapper<T, PartialKeys<T>>
type SelectNonPartialKeys<T> = InferNonPartialPropertyTypeMapper<T, NonPartialKeys<T>>
type InferTypeMapper<T> = SelectNonPartialKeys<T> & SelectPartialKeys<T>;
// type IsPartialTest = IsPartialProperty<typeof userSchema.properties.nickname>;
// type PartialTest = PartialTypeMapper<typeof userSchema.properties, "nickname">;
// type UserPartialKeys = PartialKeys<typeof userSchema.properties>
// type SelectPartialUser = SelectPartialKeys<typeof userSchema.properties>;
// type SelectNonPartialUser = SelectNonPartialKeys<typeof userSchema.properties>;
// type SelectUser = SelectNonPartialKeys<typeof userSchema.properties> & SelectPartialKeys<typeof userSchema.properties>;

export type Infer<T> =
    IsPrimitive<T> extends true
        ? ApplySchemaOptionality<T, ExtractPrimitive<T>>
        : IsUnion<T> extends true
          ? ApplySchemaOptionality<T, ExtractUnion<T>>
          : IsArray<T> extends true
            ? ApplySchemaOptionality<T, ExtractArray<T>>
            : IsObject<T> extends true
              ? ApplySchemaOptionality<T, ExtractObject<T>>
              : never;

type A = Infer<typeof stringSchema>; // string
type B = Infer<typeof numberSchema>; // number
type C = Infer<typeof booleanSchema>; // boolean
type D = Infer<typeof optionalString>; // string | undefined
type E = Infer<typeof stringArray>; // string[]
type F = Infer<typeof nestedArray>; // string[][]
type G = Infer<typeof idSchema>; // string | number
type H = Infer<typeof complexSchema>; // (string | number)[]
type User = Infer<typeof userSchema>;
type Product = Infer<typeof productSchema>;
