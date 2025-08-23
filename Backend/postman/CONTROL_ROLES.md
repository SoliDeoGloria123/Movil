# 🔐 Control de Roles y Permisos - API Móvil

## 📋 **Roles Disponibles**

### 🔴 **Admin** (`admin`)
- **Permisos**: Control total del sistema
- **Puede**: Crear, leer, actualizar, eliminar TODO
- **Credenciales de prueba**: `admin` / `admin123`

### 🟡 **Coordinador** (`coordinador`)  
- **Permisos**: Gestión operativa (sin eliminaciones críticas)
- **Puede**: Crear, leer, actualizar (sin eliminar usuarios)
- **Credenciales de prueba**: `coordinador` / `coord123`

### 🟢 **Usuario Regular** (`user`)
- **Permisos**: Solo lectura de su propio perfil
- **Puede**: Ver y editar únicamente su perfil

---

## 🛡️ **Matriz de Permisos por Endpoint**

### 🔐 **Autenticación** (Todos los usuarios autenticados)
| Endpoint | Admin | Coordinador | Usuario | Público |
|----------|-------|-------------|---------|---------|
| POST `/api/auth/login` | ✅ | ✅ | ✅ | ✅ |
| GET `/api/auth/verify` | ✅ | ✅ | ✅ | ❌ |
| GET `/api/auth/me` | ✅ | ✅ | ✅ | ❌ |
| PUT `/api/auth/change-password` | ✅ | ✅ | ✅ | ❌ |
| POST `/api/auth/logout` | ✅ | ✅ | ✅ | ❌ |

### 👥 **Gestión de Usuarios**
| Endpoint | Admin | Coordinador | Usuario | Público |
|----------|-------|-------------|---------|---------|
| GET `/api/users` | ✅ | ❌ | ❌ | ❌ |
| GET `/api/users/:id` | ✅ | ❌ | ✅* | ❌ |
| POST `/api/users` | ✅ | ❌ | ❌ | ❌ |
| PUT `/api/users/:id` | ✅ | ❌ | ✅* | ❌ |
| DELETE `/api/users/:id` | ✅ | ❌ | ❌ | ❌ |
| PATCH `/api/users/:id/toggle-status` | ✅ | ❌ | ❌ | ❌ |
| GET `/api/users/stats` | ✅ | ❌ | ❌ | ❌ |

*Solo su propio perfil

### 📁 **Gestión de Categorías**
| Endpoint | Admin | Coordinador | Usuario | Público |
|----------|-------|-------------|---------|---------|
| GET `/api/categories/active` | ✅ | ✅ | ✅ | ✅ |
| GET `/api/categories` | ✅ | ✅ | ❌ | ❌ |
| GET `/api/categories/:id` | ✅ | ✅ | ❌ | ❌ |
| POST `/api/categories` | ✅ | ✅ | ❌ | ❌ |
| PUT `/api/categories/:id` | ✅ | ✅ | ❌ | ❌ |
| DELETE `/api/categories/:id` | ✅ | ❌ | ❌ | ❌ |
| PATCH `/api/categories/:id/toggle-status` | ✅ | ✅ | ❌ | ❌ |
| PUT `/api/categories/reorder` | ✅ | ✅ | ❌ | ❌ |
| GET `/api/categories/stats` | ✅ | ❌ | ❌ | ❌ |

### 🏷️ **Gestión de Subcategorías**
| Endpoint | Admin | Coordinador | Usuario | Público |
|----------|-------|-------------|---------|---------|
| GET `/api/subcategories/active` | ✅ | ✅ | ✅ | ✅ |
| GET `/api/subcategories` | ✅ | ✅ | ❌ | ❌ |
| GET `/api/subcategories/:id` | ✅ | ✅ | ❌ | ❌ |
| GET `/api/subcategories/category/:id` | ✅ | ✅ | ✅ | ✅ |
| POST `/api/subcategories` | ✅ | ✅ | ❌ | ❌ |
| PUT `/api/subcategories/:id` | ✅ | ✅ | ❌ | ❌ |
| DELETE `/api/subcategories/:id` | ✅ | ❌ | ❌ | ❌ |
| PATCH `/api/subcategories/:id/toggle-status` | ✅ | ✅ | ❌ | ❌ |
| POST `/api/subcategories/reorder` | ✅ | ✅ | ❌ | ❌ |
| GET `/api/subcategories/stats` | ✅ | ❌ | ❌ | ❌ |

### 🛍️ **Gestión de Productos**
| Endpoint | Admin | Coordinador | Usuario | Público |
|----------|-------|-------------|---------|---------|
| GET `/api/products/active` | ✅ | ✅ | ✅ | ✅ |
| GET `/api/products/featured` | ✅ | ✅ | ✅ | ✅ |
| GET `/api/products/search` | ✅ | ✅ | ✅ | ✅ |
| GET `/api/products/category/:id` | ✅ | ✅ | ✅ | ✅ |
| GET `/api/products/subcategory/:id` | ✅ | ✅ | ✅ | ✅ |
| GET `/api/products` | ✅ | ✅ | ❌ | ❌ |
| GET `/api/products/:id` | ✅ | ✅ | ❌ | ❌ |
| GET `/api/products/sku/:sku` | ✅ | ✅ | ❌ | ❌ |
| POST `/api/products` | ✅ | ✅ | ❌ | ❌ |
| PUT `/api/products/:id` | ✅ | ✅ | ❌ | ❌ |
| DELETE `/api/products/:id` | ✅ | ❌ | ❌ | ❌ |
| PATCH `/api/products/:id/toggle-status` | ✅ | ✅ | ❌ | ❌ |
| PATCH `/api/products/:id/stock` | ✅ | ✅ | ❌ | ❌ |
| GET `/api/products/stats` | ✅ | ❌ | ❌ | ❌ |

---

## 🧪 **Cómo Probar los Permisos en Postman**

### 1. **Probar como Admin** 🔴
```bash
# Login
POST {{baseUrl}}/api/auth/login
{
    "username": "admin",
    "password": "admin123"
}

# Debería tener acceso a TODOS los endpoints
```

### 2. **Probar como Coordinador** 🟡
```bash
# Login
POST {{baseUrl}}/api/auth/login
{
    "username": "coordinador", 
    "password": "coord123"
}

# Puede gestionar categorías, subcategorías, productos
# NO puede eliminar usuarios, categorías, subcategorías o productos
# NO puede ver estadísticas
```

### 3. **Probar sin Token** 🔓
```bash
# Remover token del header Authorization
# Solo debería funcionar endpoints públicos:
# - /api/categories/active
# - /api/subcategories/active  
# - /api/products/active
# - /api/products/featured
# - /api/products/search
# - /api/products/category/:id
# - /api/products/subcategory/:id
```

---

## 🚨 **Endpoints de Eliminación (Solo Admin)**

### ⚠️ **PELIGRO - Requieren Rol Admin**
1. **🗑️ DELETE Usuario**: `/api/users/:id`
2. **🗑️ DELETE Categoría**: `/api/categories/:id`  
3. **🗑️ DELETE Subcategoría**: `/api/subcategories/:id`
4. **🗑️ DELETE Producto**: `/api/products/:id`

### 📋 **Validaciones Implementadas**
- **Categorías**: No se puede eliminar si tiene subcategorías o productos
- **Subcategorías**: No se puede eliminar si tiene productos asociados
- **Usuarios**: Solo admin puede eliminar usuarios
- **Productos**: Eliminación directa (solo admin)

---

## 🔧 **Middlewares de Autorización**

### `authMiddleware`
- Verifica token JWT válido
- Extrae información del usuario del token

### `verifyAdmin`
- Requiere rol `admin`
- Usado para operaciones críticas

### `verifyAdminOrCoordinator`  
- Acepta roles `admin` o `coordinador`
- Usado para gestión operativa

### `verifyAdminOrOwner`
- Admin puede acceder a cualquier recurso
- Usuario solo puede acceder a sus propios datos

---

## 🎯 **Casos de Uso por Rol**

### 🔴 **Admin - Administrador del Sistema**
```
✅ Gestión completa de usuarios
✅ Eliminar cualquier recurso
✅ Ver todas las estadísticas
✅ Control total del catálogo
✅ Configuración del sistema
```

### 🟡 **Coordinador - Gestor Operativo**
```
✅ Gestionar catálogo (categorías, subcategorías, productos)
✅ Actualizar stock de productos
✅ Activar/desactivar elementos
❌ Eliminar recursos críticos
❌ Gestionar usuarios
❌ Ver estadísticas del sistema
```

### 🟢 **Usuario Regular**
```
✅ Ver catálogo público
✅ Gestionar su propio perfil
✅ Cambiar su contraseña
❌ Acceder a gestión administrativa
❌ Ver datos de otros usuarios
```
