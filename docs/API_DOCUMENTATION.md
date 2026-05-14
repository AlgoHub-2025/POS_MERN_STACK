# AlgoHub POS API Documentation

## Overview

The AlgoHub POS API is a RESTful API built with Express.js and TypeScript, providing endpoints for managing multi-tenant point of sale and inventory operations.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.algohub.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated users**: Higher limits based on user role

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Responses

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Authentication

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "tenantSlug": "tenant-name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "tenantName": "My Business",
  "tenantSlug": "my-business"
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### Logout
```http
POST /auth/logout
```

#### Get Current User
```http
GET /auth/me
```

### Tenants

#### Get All Tenants
```http
GET /tenants?page=1&limit=20&search=keyword
```

#### Get Tenant by ID
```http
GET /tenants/:id
```

#### Get Tenant by Slug
```http
GET /tenants/slug/:slug
```

#### Create Tenant
```http
POST /tenants
```

**Request Body:**
```json
{
  "name": "My Business",
  "slug": "my-business",
  "plan": "basic"
}
```

#### Update Tenant
```http
PUT /tenants/:id
```

#### Delete Tenant
```http
DELETE /tenants/:id
```

### Users

#### Get Users
```http
GET /users?page=1&limit=20&tenantId=tenant_id&search=keyword
```

#### Get User by ID
```http
GET /users/:id
```

#### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "tenantId": "tenant_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "roles": ["role_id"]
}
```

#### Update User
```http
PUT /users/:id
```

#### Delete User
```http
DELETE /users/:id
```

### Products

#### Get Products
```http
GET /products?page=1&limit=20&tenantId=tenant_id&categoryId=category_id&search=keyword&isActive=true
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `tenantId`: Filter by tenant
- `categoryId`: Filter by category
- `search`: Search in name, SKU, barcode
- `isActive`: Filter by active status
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

#### Get Product by ID
```http
GET /products/:id
```

#### Create Product
```http
POST /products
```

**Request Body:**
```json
{
  "tenantId": "tenant_id",
  "name": "Product Name",
  "description": "Product description",
  "sku": "PROD-001",
  "barcode": "1234567890123",
  "categoryId": "category_id",
  "unit": "pcs",
  "cost": 10.50,
  "price": 15.99,
  "taxRate": 8.5,
  "reorderLevel": 10,
  "reorderQuantity": 50,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Update Product
```http
PUT /products/:id
```

#### Delete Product
```http
DELETE /products/:id
```

#### Search Products
```http
GET /products/search?q=keyword&tenantId=tenant_id
```

### Categories

#### Get Categories
```http
GET /categories?tenantId=tenant_id&parentId=parent_id
```

#### Create Category
```http
POST /categories
```

**Request Body:**
```json
{
  "tenantId": "tenant_id",
  "name": "Category Name",
  "description": "Category description",
  "parentId": "parent_category_id"
}
```

### Sales

#### Get Sales
```http
GET /sales?page=1&limit=20&tenantId=tenant_id&startDate=2024-01-01&endDate=2024-01-31&status=completed
```

#### Get Sale by ID
```http
GET /sales/:id
```

#### Create Sale
```http
POST /sales
```

**Request Body:**
```json
{
  "tenantId": "tenant_id",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "unitPrice": 15.99,
      "discount": 10
    }
  ],
  "paymentMethod": "cash",
  "notes": "Customer notes"
}
```

#### Update Sale
```http
PUT /sales/:id
```

#### Cancel Sale
```http
POST /sales/:id/cancel
```

#### Refund Sale
```http
POST /sales/:id/refund
```

### Inventory

#### Get Inventory
```http
GET /inventory?tenantId=tenant_id&warehouseId=warehouse_id&productId=product_id&lowStock=true
```

#### Update Stock
```http
POST /inventory/update
```

**Request Body:**
```json
{
  "tenantId": "tenant_id",
  "productId": "product_id",
  "warehouseId": "warehouse_id",
  "quantity": 100,
  "type": "adjustment",
  "notes": "Stock adjustment"
}
```

#### Get Stock Movements
```http
GET /inventory/movements?tenantId=tenant_id&productId=product_id&startDate=2024-01-01
```

### Reports

#### Sales Report
```http
GET /reports/sales?tenantId=tenant_id&startDate=2024-01-01&endDate=2024-01-31
```

#### Inventory Report
```http
GET /reports/inventory?tenantId=tenant_id&warehouseId=warehouse_id
```

#### Financial Report
```http
GET /reports/financial?tenantId=tenant_id&startDate=2024-01-01&endDate=2024-01-31
```

### Settings

#### Get Settings
```http
GET /settings?tenantId=tenant_id&isPublic=true
```

#### Update Setting
```http
PUT /settings/:id
```

**Request Body:**
```json
{
  "key": "setting_key",
  "value": "setting_value",
  "description": "Setting description"
}
```

## WebSocket Events

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Join tenant room
socket.emit('join-tenant', 'tenant_id');

// Join warehouse room
socket.emit('join-warehouse', 'warehouse_id');
```

### Events

#### Client to Server

- `join-tenant`: Join tenant-specific room
- `join-warehouse`: Join warehouse-specific room
- `sale-created`: Notify about new sale
- `inventory-updated`: Notify about inventory changes

#### Server to Client

- `notification`: New notification
- `sale-update`: Sale status update
- `inventory-update`: Inventory level update
- `low-stock-alert`: Low stock warning

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Insufficient permissions |
| `VALIDATION_001` | Required field missing |
| `VALIDATION_002` | Invalid data format |
| `RESOURCE_001` | Resource not found |
| `RESOURCE_002` | Resource already exists |
| `BUSINESS_001` | Insufficient stock |
| `BUSINESS_002` | Invalid operation |
| `SYSTEM_001` | Internal server error |
| `SYSTEM_002` | Database error |

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

class AlgoHubAPI {
  private baseURL: string;
  private token?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(method: string, endpoint: string, data?: any) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return response.data;
  }

  async login(email: string, password: string) {
    return this.request('POST', '/auth/login', { email, password });
  }

  async getProducts(tenantId: string, page = 1, limit = 20) {
    return this.request('GET', `/products?tenantId=${tenantId}&page=${page}&limit=${limit}`);
  }

  async createSale(saleData: any) {
    return this.request('POST', '/sales', saleData);
  }
}
```

## Testing

### Using curl

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get products
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer <token>"

# Create product
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","sku":"PROD-001","price":19.99}'
```

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| Authentication | 10 requests/minute |
| Products | 100 requests/minute |
| Sales | 200 requests/minute |
| Reports | 20 requests/minute |

## Pagination

All list endpoints support pagination:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Filtering and Sorting

### Filtering

Most endpoints support filtering via query parameters:

```http
GET /products?tenantId=xxx&categoryId=yyy&isActive=true&minPrice=10&maxPrice=100
```

### Sorting

Add `sortBy` and `sortOrder` parameters:

```http
GET /products?sortBy=name&sortOrder=asc
GET /sales?sortBy=createdAt&sortOrder=desc
```

## File Uploads

### Upload Product Image

```http
POST /upload
Content-Type: multipart/form-data

file: [image file]
type: product-image
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/products/image.jpg"
  }
}
```

## Bulk Operations

### Bulk Create Products

```http
POST /products/bulk
```

**Request Body:**
```json
{
  "products": [
    {
      "name": "Product 1",
      "sku": "PROD-001",
      "price": 19.99
    },
    {
      "name": "Product 2",
      "sku": "PROD-002",
      "price": 29.99
    }
  ]
}
```

### Bulk Update Inventory

```http
POST /inventory/bulk-update
```

## Webhooks

### Configure Webhook

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["sale.created", "inventory.low"],
  "secret": "webhook_secret"
}
```

### Webhook Payload

```json
{
  "event": "sale.created",
  "data": {
    "sale": { ... },
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "signature": "sha256=..."
}
```

## SDK and Libraries

Official SDKs:
- JavaScript/TypeScript: `@algohub/api-client`
- Python: `algohub-python`
- PHP: `algohub-php`

## Support

- **Documentation**: https://docs.algohub.com
- **API Status**: https://status.algohub.com
- **Support**: api-support@algohub.com
- **GitHub Issues**: https://github.com/algohub/pos-api/issues
