# API & Service Layer Guide

## API Client (`src/api/client.ts`)
We use a centralized `Axios` instance for all network requests.

### Key Features:
- **Base URL**: Configured via environment variables (`VITE_API_URL`).
- **Interceptors**:
  - **Request**: Automatically injects `Authorization` (Bearer token), `lang` (current language), and `X-Country-Code` (selected country) headers from `localStorage`.
  - **Response**: Handles global error states (e.g., 401 Unauthorized for token expiration).

## Service Pattern (`src/services/`)
We use dedicated service objects to encapsulate API logic. This separation allows components to remain focused on UI while services handle data transformation and endpoint details.

### Available Services:
- `authService`: Handles Login, Register, Password Reset, and Token management.
- `areaService`: Fetches Countries, Cities, and Regions.
- `categoryService`: Fetches product categories and subcategories.
- `departmentService`: Fetches major store departments.
- `settingsService`: Fetches site-wide configuration (footer info, site name, social links).

### Usage Example:
```typescript
import { departmentService } from '../../services';

// In a component or hook
const fetchDepts = async () => {
  const response = await departmentService.getAll();
  if (response.status) {
    setDepartments(response.data);
  }
};
```

## Data Types (`src/types/api.ts`)
All API responses and entity models are strictly typed. Services return promises of typed response wrappers (e.g., `Promise<DepartmentResponse>`).
