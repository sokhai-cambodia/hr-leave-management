# Frontend Development Guidelines

## Architecture Overview

This is a React 19 + TypeScript frontend using **file-based routing** with TanStack Router. The app communicates with a FastAPI backend via auto-generated client code.

### Key Stack Components
- **Routing**: TanStack Router with file-based routes in `src/routes/` (generates `routeTree.gen.ts`)
- **State Management**: TanStack Query for server state, localStorage for auth tokens
- **UI Framework**: Chakra UI v3 with custom theme in `src/theme.tsx`
- **API Client**: Auto-generated from OpenAPI spec using `@hey-api/openapi-ts` → outputs to `src/client/`
- **Code Quality**: Biome (not ESLint/Prettier) for linting and formatting
- **Testing**: Playwright for E2E tests with authentication setup

## Critical Workflows

### API Client Generation
When backend OpenAPI schema changes, regenerate client:
```bash
# Download openapi.json from http://localhost/api/v1/openapi.json to frontend root
npm run generate-client  # Uses openapi-ts.config.ts
```
Never manually edit files in `src/client/` - they're auto-generated.

### Development Commands
- `npm run dev` - Start Vite dev server (localhost:5173)
- `npm run build` - TypeScript compile + Vite build
- `npm run lint` - Run Biome (auto-fixes with --write)
- `npx playwright test` - Run E2E tests (requires backend running)
- `npx playwright test --ui` - Interactive test debugging

### Testing Setup
Playwright tests use authentication setup (`tests/auth.setup.ts`) that:
1. Logs in once as superuser
2. Saves session to `playwright/.auth/user.json`
3. Reuses session across all tests

Backend must be running: `docker compose up -d --wait backend`

## Routing Patterns

### File-Based Routes
Route files in `src/routes/` use TanStack Router's file conventions:
- `_layout.tsx` → Creates layout wrapper with auth guard
- `_layout/index.tsx` → `/` (protected)
- `_layout/items.tsx` → `/items` (protected)
- `login.tsx` → `/login` (public)

All route files export `Route` using `createFileRoute()`:
```typescript
export const Route = createFileRoute("/_layout/items")({
  component: Items,
  beforeLoad: async () => {
    // Auth checks, redirects, etc.
  },
})
```

The `_layout` prefix creates nested routes requiring authentication (see `src/routes/_layout.tsx`).

## State Management Patterns

### Authentication Flow
- Auth state managed via `src/hooks/useAuth.ts`
- Token stored in `localStorage` as `access_token`
- Global error handler in `src/main.tsx` catches 401/403 → redirects to `/login`
- OpenAPI client configured to read token: `OpenAPI.TOKEN = async () => localStorage.getItem("access_token")`

### Data Fetching
Use TanStack Query hooks (`useQuery`, `useMutation`) with service classes from `src/client/`:
```typescript
const { data: items } = useQuery({
  queryKey: ["items"],
  queryFn: () => ItemsService.readItems({ limit: 100 }),
})

const mutation = useMutation({
  mutationFn: (data: ItemCreate) => ItemsService.createItem({ requestBody: data }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] })
  },
  onError: (err: ApiError) => {
    handleError(err)  // From src/utils.ts
  },
})
```

Always invalidate relevant query keys after mutations.

## Component Patterns

### Form Handling
Use `react-hook-form` with validation patterns from `src/utils.ts`:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<ItemCreate>({
  mode: "onBlur",
  criteriaMode: "all",
})
```

Validation patterns: `emailPattern`, `namePattern`, `passwordRules`, `confirmPasswordRules`

### Chakra UI Components
- Custom UI components in `src/components/ui/` (excluded from Biome linting)
- Import from `@chakra-ui/react` or local `ui/` components
- Dialog pattern example: `src/components/Items/AddItem.tsx`

### Error Handling
Use `handleError()` from `src/utils.ts` to show toast notifications for API errors. It extracts detail from FastAPI error responses (handles both string and array formats).

## Code Style (Biome)

**Do not use ESLint or Prettier** - this project uses Biome:
- Double quotes for strings
- Semicolons optional (ASI)
- 2-space indentation
- Self-closing elements required
- No explicit `any` allowed (except where disabled)

Excluded from linting: `src/client/**`, `src/components/ui/**`, `src/routeTree.gen.ts`

## Path Aliases
Use `@/` for imports from `src/`:
```typescript
import { ItemsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
```

## Environment Variables
- `VITE_API_URL` - Backend API base URL (default: from Docker Compose)
- Set in `frontend/.env` for local development overrides

## Docker Production Build
Multi-stage Dockerfile:
1. Build stage: `npm install` + `npm run build` with `VITE_API_URL` arg
2. Production: Nginx serving static files from `/dist`

Never run dev server in Docker - use local `npm run dev` for development.

---

# CRUD Page Creation Guide

When creating new CRUD (Create, Read, Update, Delete) management pages, follow these patterns based on the Policy Management implementation.

## File Structure for New CRUD Pages

```
src/
├── routes/
│   └── _layout/
│       └── {entities}.tsx              # Main route page (plural, e.g., policies.tsx)
├── components/
│   ├── {Entity}/                       # Entity folder (singular, PascalCase, e.g., Policy/)
│   │   ├── Add{Entity}.tsx             # Create dialog (e.g., AddPolicy.tsx)
│   │   ├── Edit{Entity}.tsx            # Update dialog (e.g., EditPolicy.tsx)
│   │   └── Delete{Entity}.tsx          # Delete confirmation (e.g., DeletePolicy.tsx)
│   ├── Common/
│   │   └── {Entity}ActionsMenu.tsx     # Actions dropdown (e.g., PolicyActionsMenu.tsx)
│   └── Pending/
│       └── Pending{Entities}.tsx       # Loading skeleton (e.g., PendingPolicies.tsx)
```

## Temporary API Service Pattern

**CRITICAL**: Before auto-generated client is available, create temporary services that use `OpenAPI.BASE` for correct backend URL:

```typescript
import { OpenAPI } from "@/client/core/OpenAPI"

interface EntityPublic {
    id: string
    field1: string
    is_active: boolean
}

interface EntityCreate {
    field1: string
    is_active: boolean
}

interface EntityUpdate {
    field1?: string
    is_active?: boolean
}

interface EntitiesResponse {
    data: EntityPublic[]
    count: number
}

// Temporary service - replace with auto-generated after API client regeneration
const EntitiesService = {
    // GET /api/v1/entities?skip=0&limit=100
    readEntities: async ({
        skip,
        limit,
    }: {
        skip?: number
        limit?: number
    }): Promise<EntitiesResponse> => {
        const params = new URLSearchParams()
        if (skip !== undefined) params.append("skip", skip.toString())
        if (limit !== undefined) params.append("limit", limit.toString())

        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/entities?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) throw new Error("Failed to fetch entities")
        return response.json()
    },

    // POST /api/v1/entities
    createEntity: async ({ requestBody }: { requestBody: EntityCreate }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/entities`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) throw new Error("Failed to create entity")
        return response.json()
    },

    // PUT /api/v1/entities/{id}
    updateEntity: async ({
        id,
        requestBody,
    }: {
        id: string
        requestBody: EntityUpdate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/entities/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) throw new Error("Failed to update entity")
        return response.json()
    },

    // DELETE /api/v1/entities/{id}
    deleteEntity: async ({ entityId }: { entityId: string }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/entities/${entityId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) throw new Error("Failed to delete entity")
        return response.json()
    },
}
```

### API Service Rules
- **Always use `OpenAPI.BASE`** - Never use relative URLs like `/api/v1/...`
- **Get token from localStorage** for authentication
- **Match API field names exactly** - Check API docs for singular vs plural (e.g., `value` vs `values`)
- Include descriptive error messages

## Form Handling Best Practices

### Use `onChange` Mode for Validation
```typescript
const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
  mode: "onChange",    // ✅ Real-time validation - enables Save button immediately
  // mode: "onBlur",   // ❌ Causes Save button to stay disabled until blur
  criteriaMode: "all",
})
```

### Checkbox Handling - Prevent Indeterminate State
```typescript
<Controller
  control={control}
  name="is_active"
  render={({ field }) => (
    <Checkbox
      checked={field.value}
      onCheckedChange={({ checked }) => field.onChange(checked === true)}
      // ✅ `checked === true` converts indeterminate to false
      // ❌ Without conversion: `checked` might be true|false|"indeterminate"
    >
      Is active?
    </Checkbox>
  )}
/>
```

### Handle API Field Name Differences
If GET returns different field names than POST/PUT expects:
```typescript
// Example: API returns 'value' but expects 'values' in requests
interface EntityPublic {
    value: string  // What GET returns
}

interface EntityCreate {
    values: string  // What POST expects (check API docs!)
}

// In Edit form, transform field names:
defaultValues: {
    values: entity.value,  // Transform from API response to form field
}
```

### Query Invalidation Pattern
```typescript
const mutation = useMutation({
  mutationFn: (data) => EntitiesService.createEntity({ requestBody: data }),
  onSuccess: () => {
    showSuccessToast("Entity created successfully.")
    reset()
    setIsOpen(false)
  },
  onError: (err: ApiError) => {
    handleError(err)  // From @/utils
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["entities"] })
  },
})
```

## Main Route Page Structure

```typescript
import { Badge, Container, Flex, Heading, Table } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"

const entitiesSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getEntitiesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      EntitiesService.readEntities({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["entities", { page }],
  }
}

export const Route = createFileRoute("/_layout/entities")({
  component: Entities,
  validateSearch: (search) => entitiesSearchSchema.parse(search),
})

function EntitiesTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getEntitiesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) => {
    navigate({ to: "/entities", search: (prev) => ({ ...prev, page }) })
  }

  const entities = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) return <PendingEntities />

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">Column 1</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {entities?.map((entity) => (
            <Table.Row key={entity.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell>{entity.field1}</Table.Cell>
              <Table.Cell>
                <Badge colorPalette={entity.is_active ? "green" : "gray"}>
                  {entity.is_active ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <EntityActionsMenu entity={entity} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}

function Entities() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>Entities Management</Heading>
      <AddEntity />
      <EntitiesTable />
    </Container>
  )
}
```

## Common Validation Patterns

```typescript
// Required field
register("field", {
  required: "Field is required",
})

// Email
register("email", {
  required: "Email is required",
  pattern: emailPattern,  // from @/utils
})

// Min length
register("password", {
  required: "Password is required",
  minLength: {
    value: 8,
    message: "Password must be at least 8 characters",
  },
})

// Confirm password match
register("confirm_password", {
  required: "Please confirm your password",
  validate: (value) =>
    value === getValues().password || "The passwords do not match",
})
```

## Add Component Pattern

```typescript
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"

const AddEntity = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EntityCreate>({
    mode: "onChange",  // ✅ Real-time validation
    criteriaMode: "all",
    defaultValues: {
      field1: "",
      is_active: true,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: EntityCreate) =>
      EntitiesService.createEntity({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Entity created successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] })
    },
  })

  const onSubmit: SubmitHandler<EntityCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-entity" my={4}>
          <FaPlus fontSize="16px" />
          Add Entity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Entity</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.field1}
                errorText={errors.field1?.message}
                label="Field 1"
              >
                <Input
                  {...register("field1", {
                    required: "Field 1 is required",
                  })}
                  placeholder="Enter field 1"
                  type="text"
                />
              </Field>
            </VStack>
            <Flex mt={4} direction="column" gap={4}>
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Field disabled={field.disabled} colorPalette="teal">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={({ checked }) => 
                        field.onChange(checked === true)
                      }
                    >
                      Is active?
                    </Checkbox>
                  </Field>
                )}
              />
            </Flex>
          </DialogBody>
          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button variant="subtle" colorPalette="gray" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
```

## Edit Component Pattern

Same structure as Add, but:
- Receives `entity` prop with existing data
- Uses `EntityUpdate` type (with optional fields)
- Populates `defaultValues` from entity prop
- May need to transform field names if API uses different names for GET vs PUT

## Delete Component Pattern

```typescript
const DeleteEntity = ({ id }: { id: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { handleSubmit, formState: { isSubmitting } } = useForm()

  const mutation = useMutation({
    mutationFn: () => EntitiesService.deleteEntity({ entityId: id }),
    onSuccess: () => {
      showSuccessToast("The entity was deleted successfully")
      setIsOpen(false)
    },
    onError: () => {
      showErrorToast("An error occurred while deleting the entity")
    },
    onSettled: () => {
      queryClient.invalidateQueries()  // Invalidate all for delete
    },
  })

  return (
    <DialogRoot role="alertdialog" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" colorPalette="red">
          <FiTrash2 fontSize="16px" />
          Delete Entity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(() => mutation.mutate())}>
          <DialogHeader>
            <DialogTitle>Delete Entity</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              This entity will be <strong>permanently deleted.</strong> Are you sure?
            </Text>
          </DialogBody>
          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button variant="subtle" colorPalette="gray" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button variant="solid" colorPalette="red" type="submit" loading={isSubmitting}>
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
```

## Actions Menu Pattern

```typescript
export const EntityActionsMenu = ({ entity, disabled }: EntityActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit" disabled={disabled}>
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditEntity entity={entity} />
        <DeleteEntity id={entity.id} />
      </MenuContent>
    </MenuRoot>
  )
}
```

## Navigation Setup

Add to `src/components/Common/SidebarItems.tsx`:
```typescript
const items = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  { icon: FiIcon, title: "Entities", path: "/entities" },  // Add your route
  // ... other items
]
```

## Checklist for New CRUD Page

- [ ] Check API documentation for exact field names (singular vs plural)
- [ ] Create TypeScript interfaces matching API responses
- [ ] Create temporary service with all CRUD operations using `OpenAPI.BASE`
- [ ] Create main route page with table and pagination
- [ ] Create Add component with `mode: "onChange"` validation
- [ ] Create Edit component with field name transformation if needed
- [ ] Create Delete confirmation component
- [ ] Create Actions menu component
- [ ] Create Pending/loading skeleton component
- [ ] Add route to sidebar navigation
- [ ] Test all CRUD operations
- [ ] Verify checkbox handling uses `checked === true`
- [ ] Test that Save button enables correctly with `onChange` mode
- [ ] After backend update: regenerate API client and replace temporary services
