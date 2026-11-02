# infer-types-from-schemas

A TypeScript library for inferring static TypeScript types from schema descriptors. Build a schema with the exported helpers, then use `Infer<typeof schema>` to derive its corresponding type. The helpers create descriptors; inference happens at compile time, and this library does not validate data at runtime.

## English

### Quick start

```ts
import {
    array,
    booleanSchema,
    numberSchema,
    object,
    partial,
    stringSchema,
    union,
    type Infer,
} from "infer-types-from-schemas";

const userSchema = object({
    id: numberSchema,
    name: stringSchema,
    nickname: partial(stringSchema),
    roles: array(stringSchema),
    externalId: union(stringSchema, numberSchema),
});

type User = Infer<typeof userSchema>;
// {
//   id: number;
//   name: string;
//   nickname?: string;
//   roles: string[];
//   externalId: string | number;
// }
```

The primitive descriptors are `stringSchema`, `numberSchema`, and `booleanSchema`. Compose them with:

- `array(schema)` for arrays, including nested arrays.
- `union(first, second)` for a value that may have either primitive type.
- `object(properties)` for an object whose properties are schemas.
- `partial(schema)` to make an object property optional.
- `optional(schema)` to allow the inferred value to be `undefined`. Unlike `partial`, this does not make an object key optional: a property using `optional(stringSchema)` is required but has type `string | undefined`.

### How `Infer` works

`Infer<T>` classifies a schema in this order, using conditional types:

```text
primitive ──> extract its TypeScript primitive type
union     ──> extract the member primitive types and form a union
array     ──> infer the item type and add []
object    ──> infer each property, making partial properties optional
otherwise ──> never
```

For each recognized schema, `ApplySchemaOptionality` adds `undefined` if the descriptor has `optional: true`. The order matters: a primitive descriptor is handled before an object descriptor, and a schema that matches none of the supported shapes resolves to `never`.

For example:

```ts
const idSchema = union(stringSchema, numberSchema);
const namesSchema = array(stringSchema);
const nestedNamesSchema = array(array(stringSchema));
const maybeNameSchema = optional(stringSchema);

type Name = Infer<typeof stringSchema>; // string
type Id = Infer<typeof idSchema>; // string | number
type Names = Infer<typeof namesSchema>; // string[]
type NestedNames = Infer<typeof nestedNamesSchema>; // string[][]
type MaybeName = Infer<typeof maybeNameSchema>; // string | undefined
```

### TypeScript concepts used by the implementation

- **Generics** let helpers preserve the exact descriptor passed in. For example, `union<T, U>` remembers each argument's `type`, while `Infer<T>` accepts a particular schema type.
- **`typeof` in a type position** captures the inferred type of a schema value, as in `Infer<typeof userSchema>`.
- **Conditional types** choose the inference branch (`T extends ... ? ... : ...`). The `IsPrimitive`, `IsUnion`, `IsArray`, and `IsObject` helpers identify schema shapes; the corresponding `Extract...` types retrieve their inferred values.
- **`infer` in a conditional type** captures part of a matched type. `ExtractPrimitive<T>` uses `infer I` to capture a primitive schema's type key; `ExtractArray<T>` captures its item schema; `ExtractObject<T>` captures its properties.
- **Mapped types** iterate over object keys and construct a result type. `InferPartialPropertyTypeMapper` maps selected keys with `?`, while `InferNonPartialPropertyTypeMapper` maps selected keys as required.
- **`keyof` and indexed access** select and collect object keys. `PartialKeys<T>` maps each key to itself when its schema is partial, or to `never` otherwise, then `[keyof T]` collects the remaining keys into a union. `NonPartialKeys<T>` does the converse.
- **Unions (`|`)** represent alternatives. The `union` helper's schema maps to `string | number`, for example. The conditional `ExtractType<T>` distributes over a union of primitive keys, converting each member to its TypeScript type.
- **Intersections (`&`)** combine the required-property and optional-property mapped results in `InferTypeMapper<T>`, producing one object type with both sets of keys.
- **`never`** represents an impossible/unsupported result. Here it is both the fallback for an unrecognized schema and the filter value used to discard keys in `PartialKeys` and `NonPartialKeys`.
- **`Readonly` and literal types** preserve descriptor information. The helper return types are `Readonly`, and the exported primitive descriptors use `as const` so their `type` values stay specific string literals rather than widening to `string`.

`BaseTypes` and `PrimitiveTypeMap` connect the descriptor literals `"string"`, `"number"`, and `"boolean"` to TypeScript's `string`, `number`, and `boolean`. `BaseSchema`, `PrimitiveSchema`, `ArraySchema`, `UnionSchema`, and `ObjectSchema` describe the shapes used by the inference branches.

### Development

```sh
npm install
npm run build
npm run prettier
npm run lint
npm run test
```

## Français

### Présentation

Cette bibliothèque TypeScript déduit des types TypeScript statiques à partir de descripteurs de schéma. Construisez un schéma avec les fonctions exportées, puis utilisez `Infer<typeof schema>` pour obtenir le type correspondant. Les fonctions créent des descripteurs ; l'inférence a lieu à la compilation et la bibliothèque ne valide pas les données à l'exécution.

### Démarrage rapide

```ts
import {
    array,
    booleanSchema,
    numberSchema,
    object,
    partial,
    stringSchema,
    union,
    type Infer,
} from "infer-types-from-schemas";

const userSchema = object({
    id: numberSchema,
    name: stringSchema,
    nickname: partial(stringSchema),
    roles: array(stringSchema),
    externalId: union(stringSchema, numberSchema),
});

type User = Infer<typeof userSchema>;
// {
//   id: number;
//   name: string;
//   nickname?: string;
//   roles: string[];
//   externalId: string | number;
// }
```

Les descripteurs primitifs sont `stringSchema`, `numberSchema` et `booleanSchema`. Composez-les avec :

- `array(schema)` pour créer des tableaux, y compris des tableaux imbriqués.
- `union(first, second)` pour représenter une valeur pouvant avoir l'un ou l'autre des deux types primitifs.
- `object(properties)` pour créer un objet dont les propriétés sont des schémas.
- `partial(schema)` pour rendre une propriété d'objet facultative.
- `optional(schema)` pour permettre à la valeur inférée d'être `undefined`. Contrairement à `partial`, cette fonction ne rend pas la clé d'objet facultative : une propriété utilisant `optional(stringSchema)` est requise, mais son type est `string | undefined`.

### Fonctionnement de `Infer`

`Infer<T>` classe un schéma dans cet ordre à l'aide de types conditionnels :

```text
primitif  ──> extrait son type primitif TypeScript
union     ──> extrait les types primitifs membres et forme une union
tableau   ──> infère le type des éléments et ajoute []
objet     ──> infère chaque propriété et rend facultatives celles marquées partial
sinon     ──> never
```

Pour chaque schéma reconnu, `ApplySchemaOptionality` ajoute `undefined` si le descripteur contient `optional: true`. L'ordre est important : un descripteur primitif est traité avant un descripteur d'objet, et un schéma ne correspondant à aucune forme prise en charge donne `never`.

Par exemple :

```ts
const idSchema = union(stringSchema, numberSchema);
const namesSchema = array(stringSchema);
const nestedNamesSchema = array(array(stringSchema));
const maybeNameSchema = optional(stringSchema);

type Name = Infer<typeof stringSchema>; // string
type Id = Infer<typeof idSchema>; // string | number
type Names = Infer<typeof namesSchema>; // string[]
type NestedNames = Infer<typeof nestedNamesSchema>; // string[][]
type MaybeName = Infer<typeof maybeNameSchema>; // string | undefined
```

### Concepts TypeScript utilisés dans l'implémentation

- **Les génériques** permettent aux fonctions de conserver le type précis du descripteur fourni. Par exemple, `union<T, U>` conserve le `type` de chacun de ses arguments, tandis que `Infer<T>` reçoit un type de schéma donné.
- **`typeof` dans un contexte de type** récupère le type inféré d'une valeur de schéma, comme dans `Infer<typeof userSchema>`.
- **Les types conditionnels** choisissent une branche d'inférence (`T extends ... ? ... : ...`). Les utilitaires `IsPrimitive`, `IsUnion`, `IsArray` et `IsObject` reconnaissent les formes de schéma ; les types `Extract...` correspondants en extraient les valeurs inférées.
- **`infer` dans un type conditionnel** capture une partie du type correspondant. `ExtractPrimitive<T>` capture avec `infer I` la clé de type d'un schéma primitif ; `ExtractArray<T>` capture son schéma d'élément ; `ExtractObject<T>` capture ses propriétés.
- **Les types mappés** parcourent les clés d'un objet et construisent un type résultat. `InferPartialPropertyTypeMapper` mappe les clés sélectionnées avec `?`, tandis que `InferNonPartialPropertyTypeMapper` les mappe comme propriétés requises.
- **`keyof` et l'accès indexé** sélectionnent et rassemblent les clés d'un objet. `PartialKeys<T>` mappe chaque clé vers elle-même si son schéma est partiel, ou vers `never` sinon, puis `[keyof T]` rassemble les clés restantes dans une union. `NonPartialKeys<T>` fait l'inverse.
- **Les unions (`|`)** représentent des alternatives. Le schéma créé par `union` correspond, par exemple, à `string | number`. Le type conditionnel `ExtractType<T>` se distribue sur une union de clés primitives et convertit chaque membre en type TypeScript.
- **Les intersections (`&`)** combinent dans `InferTypeMapper<T>` les résultats mappés des propriétés requises et facultatives pour former un seul type objet contenant les deux ensembles de clés.
- **`never`** représente un résultat impossible ou non pris en charge. Ici, il sert de résultat de repli pour un schéma non reconnu et de valeur de filtrage pour éliminer des clés dans `PartialKeys` et `NonPartialKeys`.
- **`Readonly` et les types littéraux** préservent les informations des descripteurs. Les types de retour des fonctions sont `Readonly`, et les descripteurs primitifs exportés utilisent `as const` afin que leurs valeurs `type` restent des littéraux précis plutôt que d'être élargies en `string`.

`BaseTypes` et `PrimitiveTypeMap` relient les littéraux de descripteur `"string"`, `"number"` et `"boolean"` aux types TypeScript `string`, `number` et `boolean`. `BaseSchema`, `PrimitiveSchema`, `ArraySchema`, `UnionSchema` et `ObjectSchema` décrivent les formes utilisées par les branches d'inférence.

### Développement

```sh
npm install
npm run build
npm run prettier
npm run lint
npm run test
```
