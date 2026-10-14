# 📋 Kotyol ERP Backend — API Endpoint Documentation

> **Base URL:** `http://localhost:8000`
> **API Prefix:** `/api/v1`
> **Swagger UI:** `http://localhost:8000/docs`
> **ReDoc:** `http://localhost:8000/redoc`

---

## 🔐 Authentication (Autentifikatsiya)

Barcha himoyalangan endpoint'larga so'rov yuborishda `Authorization` headeriga Bearer token qo'shilishi shart:

```
Authorization: Bearer <access_token>
```

---

## 📌 Umumiy Response Format

### ✅ Muvaffaqiyatli javob:
```json
{
  "success": true,
  "data": { ... }
}
```

### ✅ Ro'yxat (Paginatsiya bilan):
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

### ❌ Xatolik javoblari:
```json
{
  "success": false,
  "message": "Xatolik tavsifi",
  "error_code": "ERROR_CODE"
}
```

### ❌ Validatsiya xatoligi (422):
```json
{
  "success": false,
  "message": "Validation Error",
  "details": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### ❌ Entity in Use (o'chirishda 400):
```json
{
  "success": false,
  "error_code": "ENTITY_IN_USE",
  "details": {
    "reference_count": 3,
    "can_archive": true
  }
}
```

---

## 📊 Health Check

| # | Method | URL | Auth | Description |
|---|--------|-----|------|-------------|
| 1 | `GET` | `/health` | ❌ | Server holatini tekshirish |

**Response:**
```json
{
  "status": "online",
  "app": "Kotyol ERP Backend",
  "environment": "development"
}
```

---

## 1️⃣ Auth (Accounts & Auth)

**Prefix:** `/api/v1/auth`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `POST` | `/api/v1/auth/login` | ❌ | — | Tizimga kirish |
| 2 | `POST` | `/api/v1/auth/refresh` | ❌ | — | Access tokenni yangilash |
| 3 | `GET` | `/api/v1/auth/me` | ✅ | Any | Joriy foydalanuvchi profili |

---

### 1.1 `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "username": "admin@kotyol.uz",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": "uuid-string",
      "full_name": "Kotyol Admin",
      "email": "admin@kotyol.uz",
      "role": "ADMIN",
      "username": "admin",
      "phone": null,
      "department": null
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Foydalanuvchi nomi yoki parol noto'g'ri"
}
```

---

### 1.2 `POST /api/v1/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

---

### 1.3 `GET /api/v1/auth/me`

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid-string",
    "full_name": "Kotyol Admin",
    "email": "admin@kotyol.uz",
    "role": "ADMIN",
    "username": "admin",
    "phone": null,
    "department": null
  },
  "permissions": ["read:all", "write:all"]
}
```

---

## 2️⃣ Products (Mahsulotlar Katalogi)

**Prefix:** `/api/v1/products`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `GET` | `/api/v1/products/list` | ✅ | Any | Mahsulotlar ro'yxati |
| 2 | `POST` | `/api/v1/products/create` | ✅ | ADMIN, MANAGER | Yangi mahsulot yaratish |
| 3 | `GET` | `/api/v1/products/{id}` | ✅ | Any | Bitta mahsulot detali |
| 4 | `PUT` | `/api/v1/products/{id}` | ✅ | ADMIN, MANAGER | Mahsulotni tahrirlash |
| 5 | `DELETE` | `/api/v1/products/{id}` | ✅ | ADMIN | Mahsulotni o'chirish (safe) |

---

### 2.1 `GET /api/v1/products/list`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Sahifa raqami (≥1) |
| `limit` | int | 20 | Har sahifadagi yozuvlar soni (1-100) |
| `search` | string | null | Qidiruv so'zi (nom/kod bo'yicha) |
| `category_id` | string | null | Kategoriya UUID bo'yicha filter |
| `status` | string | "ACTIVE" | Status filter: `ACTIVE`, `ARCHIVED` |
| `type` | string | null | Tur bo'yicha filter: `FINISHED_GOOD`, `RAW_MATERIAL`, `SPARE_PART` |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "code": "PRD-101",
      "name": "Kotyol K-50kW",
      "category_id": "uuid-string",
      "category_name": "Qozonlar",
      "unit_id": "uuid-string",
      "unit_name": "dona",
      "type": "FINISHED_GOOD",
      "unit_price": 2500.0,
      "min_stock_level": 5.0,
      "currency": "USD",
      "status": "ACTIVE",
      "created_at": "2026-07-22T09:00:00"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

---

### 2.2 `POST /api/v1/products/create`

**Request Body:**
```json
{
  "code": "PRD-101",
  "name": "Kotyol K-50kW",
  "category_id": "uuid-string",
  "unit_id": "uuid-string",
  "type": "FINISHED_GOOD",
  "min_stock_level": 5.0,
  "unit_price": 2500.00,
  "currency": "USD",
  "material_type_id": null,
  "supplier_id": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | ✅ | Unikal mahsulot kodi |
| `name` | string | ✅ | Mahsulot nomi |
| `category_id` | string (UUID) | ✅ | Kategoriya ID |
| `unit_id` | string (UUID) | ✅ | O'lchov birligi ID |
| `type` | string | ✅ | `FINISHED_GOOD` / `RAW_MATERIAL` / `SPARE_PART` |
| `min_stock_level` | float | ❌ | Minimum ombor darajasi (default: 0) |
| `unit_price` | float | ❌ | Birlik narxi (default: 0, ≥0) |
| `currency` | string | ❌ | Valyuta (default: "USD") |
| `material_type_id` | string (UUID) | ❌ | Material turi ID |
| `supplier_id` | string (UUID) | ❌ | Yetkazib beruvchi ID |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "code": "PRD-101",
    "name": "Kotyol K-50kW",
    "category_id": "uuid-string",
    "category_name": "Qozonlar",
    "unit_id": "uuid-string",
    "unit_name": "dona",
    "type": "FINISHED_GOOD",
    "unit_price": 2500.0,
    "min_stock_level": 5.0,
    "currency": "USD",
    "status": "ACTIVE",
    "created_at": "2026-07-22T09:00:00"
  }
}
```

---

### 2.3 `GET /api/v1/products/{id}`

**Path Parameter:** `id` — Mahsulot UUID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "code": "PRD-101",
    "name": "Kotyol K-50kW",
    "category_id": "uuid-string",
    "category_name": "Qozonlar",
    "unit_id": "uuid-string",
    "unit_name": "dona",
    "type": "FINISHED_GOOD",
    "unit_price": 2500.0,
    "min_stock_level": 5.0,
    "currency": "USD",
    "status": "ACTIVE",
    "created_at": "2026-07-22T09:00:00"
  }
}
```

---

### 2.4 `PUT /api/v1/products/{id}`

**Request Body (barcha field optional):**
```json
{
  "name": "Kotyol K-50kW Pro",
  "unit_price": 3000.00,
  "min_stock_level": 10.0,
  "status": "ARCHIVED"
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ❌ |
| `category_id` | string (UUID) | ❌ |
| `material_type_id` | string (UUID) | ❌ |
| `unit_id` | string (UUID) | ❌ |
| `supplier_id` | string (UUID) | ❌ |
| `type` | string | ❌ |
| `min_stock_level` | float | ❌ |
| `unit_price` | float | ❌ |
| `currency` | string | ❌ |
| `status` | string | ❌ |

**Response (200):** Huddi `GET /products/{id}` bilan bir xil format.

---

### 2.5 `DELETE /api/v1/products/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "deleted": true
  }
}
```

**Error (400) — boshqa joyda ishlatilgan bo'lsa:**
```json
{
  "success": false,
  "error_code": "ENTITY_IN_USE",
  "details": {
    "reference_count": 2,
    "can_archive": true
  }
}
```

---

## 3️⃣ Master Data (Dinamik Ma'lumotnomalar)

**Prefix:** `/api/v1/master-data`

### Mavjud Entity Key'lar:

| `{entity_key}` | Tavsif |
|-----------------|--------|
| `product-categories` | Mahsulot kategoriyalari |
| `material-types` | Material turlari |
| `units` | O'lchov birliklari |
| `suppliers` | Yetkazib beruvchilar |
| `customers` | Mijozlar |
| `warehouses` | Omborxonalar |
| `warranty-types` | Kafolat turlari |
| `customer-types` | Mijoz turlari |
| `service-types` | Xizmat turlari |
| `priorities` | Ustuvorliklar |
| `order-statuses` | Buyurtma holatlari |
| `expense-types` | Xarajat turlari |

---

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `GET` | `/api/v1/master-data/{entity_key}` | ✅ | Any | Ma'lumotnomalar ro'yxati |
| 2 | `POST` | `/api/v1/master-data/{entity_key}` | ✅ | ADMIN | Yangi yozuv qo'shish |
| 3 | `PUT` | `/api/v1/master-data/{entity_key}/{id}` | ✅ | ADMIN | Yozuvni tahrirlash |
| 4 | `POST` | `/api/v1/master-data/{entity_key}/{id}/archive` | ✅ | ADMIN | Arxivga o'tkazish |
| 5 | `POST` | `/api/v1/master-data/{entity_key}/{id}/restore` | ✅ | ADMIN | Arxivdan qaytarish |
| 6 | `DELETE` | `/api/v1/master-data/{entity_key}/{id}` | ✅ | ADMIN | O'chirish (safe delete) |

---

### 3.1 `GET /api/v1/master-data/{entity_key}`

**Namuna:** `GET /api/v1/master-data/product-categories`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `include_archived` | bool | false | Arxivlanganlarni ham ko'rsatish |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "code": "CAT-BOILERS",
      "name": "Qozonlar",
      "description": "Issiqlik qozonlari",
      "contact_name": null,
      "phone": null,
      "email": null,
      "address": null,
      "location": null,
      "months": null,
      "symbol": null,
      "status": "ACTIVE",
      "created_at": "2026-07-22T09:00:00",
      "updated_at": "2026-07-22T09:00:00"
    }
  ]
}
```

---

### 3.2 `POST /api/v1/master-data/{entity_key}`

**Namuna:** `POST /api/v1/master-data/suppliers`

**Request Body:**
```json
{
  "code": "SUP-001",
  "name": "Steel Corp LLC",
  "description": "Po'lat yetkazib beruvchi",
  "contact_name": "Alisher Tursunov",
  "phone": "+998901234567",
  "email": "info@steelcorp.uz",
  "address": "Toshkent, Chilonzor"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | ✅ | Unikal kod |
| `name` | string | ✅ | Nomi |
| `description` | string | ❌ | Tavsif |
| `contact_name` | string | ❌ | Aloqa shaxsi |
| `phone` | string | ❌ | Telefon |
| `email` | string | ❌ | Email |
| `address` | string | ❌ | Manzil |
| `location` | string | ❌ | Joylashuv (omborxonalar uchun) |
| `months` | float | ❌ | Oylar (kafolat turlari uchun) |
| `symbol` | string | ❌ | Belgisi (birliklar uchun, masalan "kg") |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "code": "SUP-001",
    "name": "Steel Corp LLC",
    "description": "Po'lat yetkazib beruvchi",
    "contact_name": "Alisher Tursunov",
    "phone": "+998901234567",
    "email": "info@steelcorp.uz",
    "address": "Toshkent, Chilonzor",
    "location": null,
    "months": null,
    "symbol": null,
    "status": "ACTIVE",
    "created_at": "2026-07-22T09:00:00",
    "updated_at": "2026-07-22T09:00:00"
  }
}
```

---

### 3.3 `PUT /api/v1/master-data/{entity_key}/{id}`

**Request Body (barcha optional):**
```json
{
  "name": "Steel Corp International",
  "phone": "+998901112233"
}
```

---

### 3.4 `POST /api/v1/master-data/{entity_key}/{id}/archive`

**Request Body:** Yo'q (empty body)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "status": "ARCHIVED",
    ...
  }
}
```

---

### 3.5 `POST /api/v1/master-data/{entity_key}/{id}/restore`

**Request Body:** Yo'q (empty body)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "status": "ACTIVE",
    ...
  }
}
```

---

### 3.6 `DELETE /api/v1/master-data/{entity_key}/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid-string", "deleted": true }
}
```

---

## 4️⃣ Warehouse (Ombor va Inventar)

**Prefix:** `/api/v1/warehouse`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `GET` | `/api/v1/warehouse/stock` | ✅ | Any | Ombor qoldiqlari |

---

### 4.1 `GET /api/v1/warehouse/stock`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `warehouse_id` | string (UUID) | null | Ombor bo'yicha filter |
| `product_id` | string (UUID) | null | Mahsulot bo'yicha filter |
| `page` | int | 1 | Sahifa raqami |
| `limit` | int | 20 | Sahifadagi yozuvlar (1-100) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "warehouse_id": "uuid-string",
      "warehouse_name": "Asosiy ombor",
      "product_id": "uuid-string",
      "product_code": "PRD-101",
      "product_name": "Kotyol K-50kW",
      "quantity": 100.0,
      "reserved_quantity": 10.0,
      "available_quantity": 90.0,
      "avg_unit_cost": 2000.0,
      "updated_at": "2026-07-22T09:00:00"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

---

## 5️⃣ Purchasing (Xarid Hujjatlari)

**Prefix:** `/api/v1/purchasing`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `GET` | `/api/v1/purchasing/list` | ✅ | Any | Xarid hujjatlari ro'yxati |
| 2 | `POST` | `/api/v1/purchasing/create` | ✅ | ADMIN, MANAGER | Yangi xarid yaratish |
| 3 | `PUT` | `/api/v1/purchasing/{id}/status` | ✅ | ADMIN, MANAGER | Xarid holatini o'zgartirish |

---

### 5.1 `GET /api/v1/purchasing/list`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Sahifa raqami |
| `limit` | int | 20 | Sahifadagi yozuvlar (1-100) |
| `status` | string | null | Status filter: `DRAFT`, `APPROVED`, `RECEIVED`, `CANCELLED` |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "purchase_number": "PO-2026-001",
      "supplier_id": "uuid-string",
      "supplier_name": "Steel Corp LLC",
      "warehouse_id": "uuid-string",
      "warehouse_name": "Asosiy ombor",
      "invoice_number": "INV-001",
      "order_date": "2026-07-22",
      "subtotal": 5000.0,
      "tax_amount": 600.0,
      "total_amount": 5600.0,
      "exchange_rate_at_creation": 1.0,
      "status": "DRAFT",
      "created_at": "2026-07-22T09:00:00",
      "items": [
        {
          "id": "uuid-string",
          "product_id": "uuid-string",
          "product_code": "RM-001",
          "product_name": "Po'lat list",
          "quantity": 100.0,
          "unit_price": 50.0,
          "total_price": 5000.0
        }
      ]
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "total_pages": 1 }
}
```

---

### 5.2 `POST /api/v1/purchasing/create`

**Request Body:**
```json
{
  "purchase_number": "PO-2026-001",
  "supplier_id": "uuid-string",
  "warehouse_id": "uuid-string",
  "invoice_number": "INV-001",
  "order_date": "2026-07-22",
  "tax_amount": 600.0,
  "exchange_rate_at_creation": 1.0,
  "items": [
    {
      "product_id": "uuid-string",
      "quantity": 100.0,
      "unit_price": 50.0
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `purchase_number` | string | ✅ | Xarid raqami |
| `supplier_id` | string (UUID) | ✅ | Yetkazib beruvchi ID |
| `warehouse_id` | string (UUID) | ✅ | Ombor ID |
| `order_date` | date (YYYY-MM-DD) | ✅ | Buyurtma sanasi |
| `items` | array | ✅ | Xarid qilinadigan mahsulotlar |
| `items[].product_id` | string (UUID) | ✅ | Mahsulot ID |
| `items[].quantity` | float (>0) | ✅ | Miqdor |
| `items[].unit_price` | float (≥0) | ✅ | Birlik narxi |
| `invoice_number` | string | ❌ | Hisob-faktura raqami |
| `tax_amount` | float | ❌ | Soliq summasi (default: 0) |
| `exchange_rate_at_creation` | float | ❌ | Valyuta kursi (default: 1.0) |

**Response (201):** Huddi `GET` da kelgan bitta purchase object formati.

---

### 5.3 `PUT /api/v1/purchasing/{id}/status`

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

| Status qiymatlari | Tavsif |
|-------------------|--------|
| `APPROVED` | Tasdiqlangan |
| `RECEIVED` | Qabul qilingan |
| `CANCELLED` | Bekor qilingan |

---

## 6️⃣ Production (Ishlab Chiqarish Partiyalari)

**Prefix:** `/api/v1/production`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `GET` | `/api/v1/production/batches` | ✅ | Any | Partiyalar ro'yxati |
| 2 | `POST` | `/api/v1/production/batches` | ✅ | ADMIN, MANAGER | Yangi partiya yaratish |
| 3 | `PUT` | `/api/v1/production/batches/{id}` | ✅ | ADMIN, MANAGER | Partiyani yangilash |

---

### 6.1 `GET /api/v1/production/batches`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Sahifa raqami |
| `limit` | int | 20 | Sahifadagi yozuvlar (1-100) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "batch_number": "BATCH-2026-001",
      "boiler_id": "uuid-string",
      "boiler_name": "Kotyol K-50kW",
      "target_quantity": 50,
      "completed_quantity": 30,
      "defect_quantity": 2,
      "start_date": "2026-07-01",
      "end_date": "2026-07-31",
      "status": "IN_PROGRESS",
      "created_at": "2026-07-22T09:00:00"
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "total_pages": 1 }
}
```

---

### 6.2 `POST /api/v1/production/batches`

**Request Body:**
```json
{
  "batch_number": "BATCH-2026-001",
  "boiler_id": "uuid-string",
  "target_quantity": 50,
  "start_date": "2026-07-01",
  "end_date": "2026-07-31"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `batch_number` | string | ✅ | Partiya raqami |
| `boiler_id` | string (UUID) | ✅ | Qozon modeli ID |
| `target_quantity` | int | ✅ | Maqsad miqdori |
| `start_date` | date (YYYY-MM-DD) | ❌ | Boshlanish sanasi |
| `end_date` | date (YYYY-MM-DD) | ❌ | Tugash sanasi |

**Response (201):** Bitta batch object.

---

### 6.3 `PUT /api/v1/production/batches/{id}`

**Request Body (barcha optional):**
```json
{
  "completed_quantity": 45,
  "defect_quantity": 3,
  "status": "COMPLETED"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `completed_quantity` | int | Tayyorlangan miqdor |
| `defect_quantity` | int | Nuqsonli miqdor |
| `status` | string | `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |

---

## 7️⃣ Sales (Sotuv Hisob-Fakturalari)

**Prefix:** `/api/v1/sales`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `GET` | `/api/v1/sales/list` | ✅ | Any | Sotuvlar ro'yxati |
| 2 | `POST` | `/api/v1/sales/create` | ✅ | ADMIN, MANAGER | Yangi sotuv yaratish |

---

### 7.1 `GET /api/v1/sales/list`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Sahifa raqami |
| `limit` | int | 20 | Sahifadagi yozuvlar (1-100) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "invoice_number": "INV-2026-001",
      "customer_id": "uuid-string",
      "customer_name": "Toshkent Issiqlik",
      "boiler_id": "uuid-string",
      "product_id": null,
      "quantity": 5.0,
      "unit_price": 2500.0,
      "subtotal": 12500.0,
      "discount_amount": 500.0,
      "tax_amount": 1440.0,
      "total_amount": 13440.0,
      "exchange_rate_at_creation": 1.0,
      "payment_status": "PENDING",
      "delivery_status": "PENDING",
      "created_at": "2026-07-22T09:00:00"
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "total_pages": 1 }
}
```

---

### 7.2 `POST /api/v1/sales/create`

**Request Body:**
```json
{
  "invoice_number": "INV-2026-001",
  "customer_id": "uuid-string",
  "boiler_id": "uuid-string",
  "product_id": null,
  "quantity": 5.0,
  "unit_price": 2500.0,
  "discount_amount": 500.0,
  "tax_amount": 1440.0,
  "exchange_rate_at_creation": 1.0
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoice_number` | string | ✅ | Hisob-faktura raqami |
| `customer_id` | string (UUID) | ✅ | Mijoz ID |
| `quantity` | float | ✅ | Miqdor |
| `unit_price` | float | ✅ | Birlik narxi |
| `boiler_id` | string (UUID) | ❌ | Qozon modeli ID |
| `product_id` | string (UUID) | ❌ | Mahsulot ID |
| `discount_amount` | float | ❌ | Chegirma (default: 0) |
| `tax_amount` | float | ❌ | Soliq (default: 0) |
| `exchange_rate_at_creation` | float | ❌ | Valyuta kursi (default: 1.0) |

**Response (201):** Bitta sale object.

---

## 8️⃣ Finance (Moliyaviy Tranzaksiyalar)

**Prefix:** `/api/v1/finance`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `GET` | `/api/v1/finance/transactions` | ✅ | Any | Tranzaksiyalar ro'yxati |
| 2 | `POST` | `/api/v1/finance/transactions` | ✅ | ADMIN, MANAGER | Yangi tranzaksiya |

---

### 8.1 `GET /api/v1/finance/transactions`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Sahifa raqami |
| `limit` | int | 20 | Sahifadagi yozuvlar (1-100) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "transaction_number": "TXN-2026-001",
      "type": "INCOME",
      "expense_type_id": null,
      "amount": 13440.0,
      "currency": "USD",
      "reference_id": "uuid-string",
      "transaction_date": "2026-07-22",
      "notes": "Qozon sotuvidan tushum",
      "created_at": "2026-07-22T09:00:00"
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "total_pages": 1 }
}
```

---

### 8.2 `POST /api/v1/finance/transactions`

**Request Body:**
```json
{
  "transaction_number": "TXN-2026-001",
  "type": "INCOME",
  "amount": 13440.0,
  "currency": "USD",
  "transaction_date": "2026-07-22",
  "expense_type_id": null,
  "reference_id": "uuid-string",
  "notes": "Qozon sotuvidan tushum"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transaction_number` | string | ✅ | Tranzaksiya raqami |
| `type` | string | ✅ | `INCOME` / `EXPENSE` / `TRANSFER` |
| `amount` | float | ✅ | Summa |
| `transaction_date` | date (YYYY-MM-DD) | ✅ | Sana |
| `currency` | string | ❌ | Valyuta (default: "USD") |
| `expense_type_id` | string (UUID) | ❌ | Xarajat turi ID |
| `reference_id` | string (UUID) | ❌ | Bog'liq hujjat ID |
| `notes` | string | ❌ | Izoh |

**Response (201):** Bitta transaction object.

---

## 9️⃣ Dashboard (Boshqaruv Paneli)

**Prefix:** `/api/v1/dashboard`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `GET` | `/api/v1/dashboard/summary` | ✅ | Any | KPI ko'rsatkichlar |
| 2 | `GET` | `/api/v1/dashboard/charts` | ✅ | Any | Grafik ma'lumotlari |

---

### 9.1 `GET /api/v1/dashboard/summary`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "monthly_revenue": 134400.0,
    "revenue_growth_percent": 12.5,
    "active_orders_count": 8,
    "completed_boilers_count": 45,
    "low_stock_alerts_count": 3
  }
}
```

---

### 9.2 `GET /api/v1/dashboard/charts`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trends": [
      { "label": "2026-01", "sales": 50000.0, "production": 20 },
      { "label": "2026-02", "sales": 62000.0, "production": 25 },
      { "label": "2026-03", "sales": 75000.0, "production": 30 }
    ]
  }
}
```

---

## 🔟 Audit Logs (Tarix Jurnali)

**Prefix:** `/api/v1/audit-logs`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `GET` | `/api/v1/audit-logs/logs` | ✅ | ADMIN | Audit log tarixi |
| 2 | `GET` | `/api/v1/audit-logs/list` | ✅ | ADMIN | Audit log tarixi (alias) |

---

### 10.1 `GET /api/v1/audit-logs/logs`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Sahifa raqami |
| `limit` | int | 50 | Sahifadagi yozuvlar |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "actor_id": "uuid-string",
      "action": "CREATE",
      "entity_name": "PRODUCT",
      "entity_id": "uuid-string",
      "old_values": null,
      "new_values": { "code": "PRD-101", "name": "Kotyol K-50kW" },
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-07-22T09:00:00"
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 50, "total_pages": 1 }
}
```

---

## 1️⃣1️⃣ Files (Fayl Yuklash)

**Prefix:** `/api/v1/files`

| # | Method | URL | Auth | Role | Description |
|---|--------|-----|------|------|-------------|
| 1 | `POST` | `/api/v1/files/upload` | ✅ | Any | Fayl yuklash |

---

### 11.1 `POST /api/v1/files/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ | Yuklanadigan fayl |

**Ruxsat berilgan formatlar:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`, `.xlsx`, `.docx`
**Maksimal hajm:** 15 MB

**Response (200):**
```json
{
  "success": true,
  "data": {
    "filename": "uuid-filename.jpg",
    "url": "/uploads/uuid-filename.jpg",
    "size_bytes": 245760,
    "content_type": "image/jpeg"
  }
}
```

**Yuklangan faylga kirish:** `GET http://localhost:8000/uploads/{filename}`

---

## 📝 Umumiy eslatmalar

### Autentifikatsiya:
1. Birinchi `/api/v1/auth/login` ga `POST` qiling, `access_token` va `refresh_token` oling.
2. Barcha keyingi so'rovlarga `Authorization: Bearer <access_token>` qo'shing.
3. Token muddati tugaganda (`401` qaytsa), `/api/v1/auth/refresh` ga `refresh_token` yuboring.

### Role'lar:
| Role | Ruxsatlar |
|------|-----------|
| `ADMIN` | Barcha amallarga ruxsat (CRUD + master data boshqarish + audit ko'rish) |
| `MANAGER` | Mahsulot, xarid, ishlab chiqarish, sotuv yaratish va tahrirlash |
| `OPERATOR` | Faqat o'qish (GET endpointlar) |

### ID Formati:
Barcha `id` fieldlar **UUID v4** formatida: `"550e8400-e29b-41d4-a716-446655440000"`

### Sana Formatlari:
- **date:** `"2026-07-22"` (YYYY-MM-DD)
- **datetime:** `"2026-07-22T09:00:00"` (ISO 8601)
