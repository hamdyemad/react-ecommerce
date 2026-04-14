# API & Services Architecture

This project follows a clean service-oriented architecture for backend integration.

## Structure

- `src/api/`: Contains the base API configuration (Axios client, interceptors).
- `src/services/`: Domain-specific service layers that consume the API client.
- `src/types/api.ts`: TypeScript definitions for API responses and data models.

## Usage Example

### 1. In a Repository/Service
```typescript
import { productService } from '@/services';

const loadProducts = async () => {
  try {
    const data = await productService.getAll({ page: 1 });
    // Use data
  } catch (error) {
    // Handle error
  }
};
```

### 2. Base Client (`src/api/client.ts`)
The `api` instance automatically handles:
- Base URL from `.env`
- Authorization headers using `localStorage`
- Request timeouts
- Global error handling (401 redirects, etc.)

## Environment Variables
Ensure you have a `.env` file in the root:
```env
VITE_API_URL=http://your-backend-api.com/api
```
