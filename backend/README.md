# Reseller Backend (Express + MongoDB)

## Setup

- Cài dependencies:

```bash
cd backend
npm i
```

- Tạo file `.env` (tự tạo thủ công) theo `env.example`.

- Seed admin:

```bash
npm run seed:admin
```

- Chạy dev:

```bash
npm run dev
```

## Auth

- `POST /auth/login` `{ email, password }` -> `{ token, user }`
- `GET /me` (Bearer token)

## Admin

- `POST /admin/sellers` tạo seller (admin-only)
- `POST /admin/categories`
- `GET /admin/categories`
- `POST /admin/products`
- `GET /admin/products`
- `POST /admin/products/:productId/inventory` thêm kho key/link

## Seller

- `POST /wallet/topup` `{ amount }`
- `POST /purchase` `{ productId }` -> trả về `order` (kèm `key`)
- `GET /orders` danh sách đơn hàng


