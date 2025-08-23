# 🧪 Valores de Prueba para Postman

Este documento contiene valores de ID reales que puedes usar para probar los endpoints en Postman.

## 📋 **Variables de Environment**

### Usuarios
```
userId: 68a90415817397d4cf4932bd (Admin)
testUserId: 68a90415817397d4cf4932bd (Admin)
```

### Autenticación
```
Credenciales Admin:
- username: admin
- password: admin123

Credenciales Coordinador:
- username: coordinador  
- password: coord123
```

## 🔄 **Cómo obtener IDs dinámicamente**

### 1. Obtener ID de Categoría
Ejecuta el endpoint: `GET {{baseUrl}}/api/categories/active`
- Copia un `_id` de la respuesta
- Pégalo en la variable `testCategoryId`

### 2. Obtener ID de Subcategoría  
Ejecuta el endpoint: `GET {{baseUrl}}/api/subcategories/active`
- Copia un `_id` de la respuesta
- Pégalo en la variable `testSubcategoryId`

### 3. Obtener ID de Producto
Ejecuta el endpoint: `GET {{baseUrl}}/api/products/active`
- Copia un `_id` de la respuesta  
- Pégalo en la variable `testProductId`

## 🚀 **Flujo de Pruebas Recomendado**

### Paso 1: Autenticación
1. **POST Login** → Obtiene y guarda el token automáticamente
2. **GET Verify Token** → Verifica que el token funciona
3. **GET User Profile** → Obtiene datos del usuario logueado

### Paso 2: Endpoints Públicos (sin autenticación)
1. **GET Categorías Activas** → Obtén IDs para usar en pruebas
2. **GET Subcategorías Activas** → Obtén IDs para usar en pruebas  
3. **GET Productos Activos** → Obtén IDs para usar en pruebas

### Paso 3: Endpoints Protegidos (requieren autenticación)
1. **GET Listar Usuarios** → Requiere rol admin
2. **GET Listar Categorías** → Gestión completa
3. **POST Crear Categoría** → Prueba creación de datos
4. **PUT Actualizar Categoría** → Prueba modificación
5. **PATCH Toggle Status** → Prueba activación/desactivación

## ⚠️ **Solución de Problemas**

### Error "jwt malformed"
- Asegúrate de haber hecho login primero
- El token se guarda automáticamente en `authToken`
- Verifica que el endpoint tenga configurado el header: `Bearer {{authToken}}`

### Error "Cast to ObjectId failed"
- Los IDs deben ser ObjectIds válidos de MongoDB (24 caracteres hexadecimales)
- Usa IDs reales obtenidos de los endpoints de consulta

### Variables no definidas ({{variable}})
- Actualiza el environment con valores reales
- Ejecuta primero los endpoints que populan las variables automáticamente

## 🔧 **Actualización Automática de Variables**

Los siguientes endpoints actualizan automáticamente las variables:

- **POST Login** → `authToken`, `userId`, `userRole`, `tokenExpiry`
- **GET Listar Usuarios** → `testUserId` (del primer usuario)
- **GET Categorías** → `testCategoryId` (de la primera categoría)
- **GET Subcategorías** → `testSubcategoryId` (de la primera subcategoría)  
- **GET Productos** → `testProductId` (del primer producto)
