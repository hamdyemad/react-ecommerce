# Components Architecture

## Atomic Design Methodology
We follow a strict Atomic Design hierarchy to ensure reusability and scalability.

### Atoms (`src/components/atoms`)
- **Visual Primitives**: `Badge`, `Button`, `Input`.
- **Skeleton Loaders**: Essential for perceived performance during API fetches.
- **Rules**: Should be stateless and receive styling/data via props.

### Molecules (`src/components/molecules`)
- **Composite Patterns**: `BreadCrumb`, `Carousel`, `SearchBar`, `Newsletter`, `CountrySelector`.
- **Interaction Logic**: Often contains internal state (e.g., Carousel slide index, Search query).
- **Rules**: Should remain mostly pure but can handle complex internal transitions.

### Organisms (`src/components/organisms`)
- **Major Sections**: `Header`, `Sidebar`, `Footer`, `CartDrawer`, `ProductGrid`.
- **Global Integration**: Interacts with multiple contexts (`useDirection`, `useCatalog`, `useTheme`).
- **Data Fetching**: Often triggers API calls via services (e.g., Header fetching departments).

## Pages & Templates (`src/pages`)
- **Route Handlers**: Maps URLs to UI.
- **Data Orchestration**: Fetches page-specific data and handles global actions (`handleAddToCart`).

## Data Flow & State Management
- **Global Contexts**: Used for application-wide cross-cutting concerns (Theme, Direction, Catalog, Settings).
- **Service Layer**: Components do not call `axios` directly; they use `src/services/` (e.g. `authService.login()`).
- **Prop Drilling**: Minimized by using context for shared data, and local state for feature-specific data.

## Component Communication
1. **Context hooks**: Standard way to get shared state.
2. **Prop callbacks**: Standard way to bubble up events (`onAddToCart`, `onMenuClick`).
3. **URL Search Params**: Used for filtering and catalog navigation.

## Best Practices
- **Conditional Rendering**: Use design tokens for dynamic styling based on `mode`.
- **Lazy Loading**: Mega menus and heavy sections should fetch data on-demand (hover/scroll).
- **Self-Documentation**: Prop interfaces should be clearly defined.
