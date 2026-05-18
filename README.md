# Reto Técnico Full Stack — Cheil Worldwide

Sistema de gestión de productos y boletas de venta desarrollado como reto técnico Full Stack con despliegue en AWS.

---

## Stack Tecnológico

**Backend:** Node.js · NestJS · Prisma ORM · JWT  
**Frontend:** Next.js · React · TypeScript  
**Base de Datos:** SQL Server en AWS RDS  
**Cloud:** AWS EC2 · AWS RDS · AWS S3 · AWS SES

---

## Funcionalidades

### Autenticación
- Login con JWT
- Rutas protegidas por token

### Productos
- CRUD completo con paginación
- Subida de imagen a AWS S3
- Soft delete (eliminación lógica)
- Validación de nombres duplicados (entre productos activos)
- Descuento automático de stock al generar una boleta

### Categorías
- CRUD completo
- Soft delete

### Boletas de Venta
- Creación de boleta con datos del cliente
- Snapshot de precio y nombre del producto al momento de compra
- Generación de PDF descargable
- Envío automático por email vía AWS SES
- Validación de stock disponible antes de confirmar

### Usuarios
- Registro de usuarios
- Hash de contraseñas con bcrypt

---

## Estructura del Proyecto

```
reto-tecnico/
├── backend/                  # API REST con NestJS
│   ├── src/
│   │   ├── auth/             # Autenticación JWT
│   │   ├── users/            # Gestión de usuarios
│   │   ├── categories/       # CRUD categorías
│   │   ├── products/         # CRUD productos
│   │   ├── customers/        # Gestión de clientes
│   │   ├── invoices/         # Boletas de venta
│   │   ├── s3/               # Servicio AWS S3
│   │   ├── ses/              # Servicio AWS SES
│   │   ├── pdf/              # Generación de PDF
│   │   └── prisma/           # Servicio Prisma
│   └── prisma/
│       └── schema.prisma     # Modelos de BD
└── frontend/                 # Interfaz con Next.js
    └── src/app/
        ├── page.tsx              # Login
        └── dashboard/
            ├── page.tsx          # Dashboard principal
            ├── products/         # Gestión de productos
            ├── categories/       # Gestión de categorías
            ├── invoices/         # Lista de boletas
            └── invoices/new/     # Nueva boleta
```

---

## Modelos de Base de Datos

| Tabla | Descripción |
|---|---|
| `User` | Usuarios del sistema |
| `Category` | Categorías de productos |
| `Product` | Catálogo de productos con imagen |
| `Customer` | Clientes de las boletas |
| `Invoice` | Boletas de venta |
| `InvoiceItem` | Ítems con snapshot de precio y nombre |

---

## Endpoints principales

### Auth
```
POST /auth/login
```

### Usuarios
```
POST /users/register
```

### Categorías (requiere JWT)
```
GET    /categories
POST   /categories
GET    /categories/:id
PUT    /categories/:id
DELETE /categories/:id
```

### Productos (requiere JWT)
```
GET    /products?page=1&limit=10
POST   /products
GET    /products/:id
PUT    /products/:id
DELETE /products/:id
POST   /products/:id/image
```

### Clientes (requiere JWT)
```
GET  /customers
POST /customers
```

### Boletas (requiere JWT)
```
GET  /invoices
POST /invoices
GET  /invoices/:id
GET  /invoices/:id/pdf
```

---

## Variables de Entorno

### Backend `.env`
```env
DATABASE_URL="sqlserver://HOST:1433;database=DB;user=USER;password=PASS;trustServerCertificate=true"
JWT_SECRET="tu_jwt_secret"
AWS_ACCESS_KEY_ID="tu_access_key"
AWS_SECRET_ACCESS_KEY="tu_secret_key"
AWS_REGION="us-east-2"
AWS_S3_BUCKET="nombre-del-bucket"
SES_SENDER_EMAIL="tu_email@gmail.com"
```

### Frontend `.env`
```env
NEXT_PUBLIC_API_URL=http://TU_IP:3000
```

---

## Despliegue en AWS

### Infraestructura
- **EC2** — Amazon Linux 2023 (t3.micro) — Backend en puerto 3000, Frontend en puerto 3001
- **RDS** — SQL Server Express — Puerto 1433
- **S3** — Almacenamiento de imágenes de productos
- **SES** — Envío de boletas por email

### Pasos para desplegar

**1. Conectarse al servidor**
```bash
ssh -i "clave.pem" ec2-user@IP_PUBLICA
```

**2. Clonar el repositorio**
```bash
git clone https://github.com/usuario/reto-tecnico.git
```

**3. Configurar y levantar el backend**
```bash
cd reto-tecnico/backend
nano .env          # Agregar variables de entorno
npm install
npm run build
pm2 start dist/main.js --name backend
```

**4. Configurar y levantar el frontend**
```bash
cd ../frontend
nano .env          # Agregar NEXT_PUBLIC_API_URL
npm install
npm run build
pm2 start npm --name frontend -- start -- -p 3001
```

**5. Guardar procesos PM2**
```bash
pm2 save
pm2 startup
```

### Actualizar el servidor
```bash
# Backend
cd ~/reto-tecnico/backend
git pull && npm run build && pm2 restart backend

# Frontend
cd ~/reto-tecnico/frontend
git pull && npm run build && pm2 restart frontend
```

---

## Instalación local

### Requisitos
- Node.js 20+
- npm

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Seguridad implementada
- Contraseñas hasheadas con bcrypt
- Autenticación JWT en todos los endpoints protegidos
- Validación de datos con class-validator
- Soft delete para no perder historial
- Snapshot de precios en boletas para preservar datos históricos

---

Desarrollado por **Axel Cavero** — Reto Técnico Full Stack · Cheil Worldwide · 2026
