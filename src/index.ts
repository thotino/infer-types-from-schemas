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
interface ArraySchema<Item> extends BaseSchema {
    type: "array";
    items: Item;
}
interface ObjectSchema<Item extends Record<string, Schema>> extends BaseSchema {
    type: "object";
    properties: Item;
}
interface UnionSchema<
    I extends PrimitiveSchema<BaseTypes>,
    J extends PrimitiveSchema<BaseTypes>,
> extends BaseSchema {
    type: [I["type"], J["type"]];
}
export type Schema =
    | PrimitiveSchema<BaseTypes>
    | UnionSchema<PrimitiveSchema<BaseTypes>, PrimitiveSchema<BaseTypes>>
    | ArraySchema<Schema>
    | ObjectSchema<Record<string, Schema>>;
export const stringSchema = {
    type: BaseTypes.STRING,
} as const;
export const numberSchema = {
    type: BaseTypes.NUMBER,
} as const;
export const booleanSchema = {
    type: BaseTypes.BOOLEAN,
} as const;

export function optional<T extends Schema>(
    schema: T,
): Readonly<{ optional: true } & T> {
    return { optional: true, ...schema };
}
export function array<T extends Schema>(
    schema: T,
): Readonly<{ type: "array"; items: T }> {
    return {
        type: "array",
        items: { ...schema },
    };
}
export function union<T extends Schema, U extends Schema>(
    firstSchema: T,
    secondSchema: U,
): Readonly<{ type: [T[SchemaTypeKey], U[SchemaTypeKey]] }> {
    return { type: [firstSchema.type, secondSchema.type] };
}

export function object<T extends Record<string, Schema>>(
    params: T,
): Readonly<ObjectSchema<T>> {
    return { type: "object", properties: { ...params } };
}

export function partial<T extends Schema>(
    schema: T,
): Readonly<{ partial: true } & T> {
    return { partial: true, ...schema };
}

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
type SelectPartialKeys<T> = InferPartialPropertyTypeMapper<T, PartialKeys<T>>;
type SelectNonPartialKeys<T> = InferNonPartialPropertyTypeMapper<
    T,
    NonPartialKeys<T>
>;
type InferTypeMapper<T> = SelectNonPartialKeys<T> & SelectPartialKeys<T>;

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
