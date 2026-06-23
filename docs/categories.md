# Categories

Tags that classify transactions. Default categories are seeded and cannot be deleted if they have transactions. Users can create custom categories with a chosen icon and color.

## Entity: `Category`

```ts
interface Category {
  id: string
  nameKey: string                    // i18n key for default cats (e.g. 'common:categories.rent')
                                     // OR plain string for custom cats (e.g. 'Pets')
  type: 'income' | 'expense' | 'both'
  kind?: TransactionKind             // constrained when type !== 'both'
  icon: string                       // emoji
  color: string                      // hex, used in charts
  custom: boolean                    // true if user-created
  isDefault: boolean                 // true for seeded categories
}
```

## Actions

### `createCategory`

```ts
input: Omit<Category, 'id' | 'isDefault'>
// isDefault is always false for user-created; custom is always true
response: Category
```

**Validations**: `nameKey` non-empty, `type` valid, `kind` valid for `type` (if not `both`), `icon` non-empty, `color` valid hex.

### `updateCategory`

```ts
input: { id: string, patch: Partial<Category> }
response: Category
```

Default categories can be updated (e.g. change icon/color) but their `isDefault` and `nameKey` should remain — the i18n system resolves `nameKey` for display. Custom categories can be fully edited.

### `deleteCategory`

```ts
input: { id: string }
response: { success: boolean }
```

**Guard**: if any transaction references this `categoryId`, the delete must be rejected with an error like `"Category in use. Reassign transactions first."` The UI blocks this client-side; the backend must enforce it too.

Default categories (`isDefault: true`) cannot be deleted.

### `listCategories`

```ts
input: { type?: 'income' | 'expense' }
response: Category[]
```

Returns all categories. Optional `type` filter returns categories matching that type or `both`.

## Notes for backend

- `nameKey` for default categories points to i18n namespaces (e.g. `common:categories.rent`). The backend should store these as-is; the frontend resolves them. For custom categories, store the literal display name.
- The `DEFAULT_CATEGORIES` array in `shared/lib/constants.ts` is the seed. On first user signup, seed these categories for the new user.
- `color` is used by chart rendering — validate it's a 7-char hex (`#RRGGBB`).