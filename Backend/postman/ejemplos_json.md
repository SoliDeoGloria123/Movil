# Ejemplos de JSON para API Móvil - Gestión de Productos

## 📋 Índice
- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Categorías](#categorías)
- [Subcategorías](#subcategorías)
- [Productos](#productos)
- [Scripts de Postman](#scripts-de-postman)

---

## 🔐 Autenticación

### Login
```json
{
    "username": "admin",
    "password": "123456"
}
```

### Cambiar Contraseña
```json
{
    "currentPassword": "123456",
    "newPassword": "nuevaPassword123"
}
```

---

## 👥 Usuarios

### Crear Usuario Admin
```json
{
    "username": "admin2",
    "email": "admin2@example.com",
    "password": "admin123456",
    "lastName": "Administrador",
    "role": "admin",
    "phone": "1234567890"
}
```

### Crear Usuario Coordinador
```json
{
    "username": "coordinador1",
    "email": "coordinador1@example.com",
    "password": "coord123456",
    "lastName": "García",
    "role": "coordinador",
    "phone": "0987654321"
}
```

### Actualizar Usuario
```json
{
    "lastName": "García Actualizado",
    "phone": "1122334455",
    "isActive": true
}
```

---

## 📂 Categorías

### Crear Categoría - Electrónicos
```json
{
    "name": "Electrónicos",
    "description": "Dispositivos y aparatos electrónicos modernos",
    "icon": "📱",
    "color": "#007bff",
    "sortOrder": 1
}
```

### Crear Categoría - Ropa
```json
{
    "name": "Ropa y Accesorios",
    "description": "Prendas de vestir y accesorios de moda",
    "icon": "👔",
    "color": "#28a745",
    "sortOrder": 2
}
```

### Crear Categoría - Hogar
```json
{
    "name": "Hogar y Jardín",
    "description": "Artículos para el hogar, muebles y jardinería",
    "icon": "🏠",
    "color": "#ffc107",
    "sortOrder": 3
}
```

### Actualizar Categoría
```json
{
    "name": "Electrónicos Premium",
    "description": "Dispositivos electrónicos de alta gama y tecnología avanzada",
    "color": "#dc3545"
}
```

### Reordenar Categorías
```json
{
    "categories": [
        {
            "_id": "CATEGORY_ID_1",
            "sortOrder": 1
        },
        {
            "_id": "CATEGORY_ID_2",
            "sortOrder": 2
        }
    ]
}
```

---

## 📁 Subcategorías

### Crear Subcategoría - Smartphones
```json
{
    "name": "Smartphones",
    "description": "Teléfonos inteligentes y dispositivos móviles",
    "category": "CATEGORY_ID_ELECTRONICS",
    "sortOrder": 1
}
```

### Crear Subcategoría - Laptops
```json
{
    "name": "Laptops",
    "description": "Computadoras portátiles y ultrabooks",
    "category": "CATEGORY_ID_ELECTRONICS",
    "sortOrder": 2
}
```

### Crear Subcategoría - Auriculares
```json
{
    "name": "Auriculares",
    "description": "Auriculares, audífonos y dispositivos de audio",
    "category": "CATEGORY_ID_ELECTRONICS",
    "sortOrder": 3
}
```

### Actualizar Subcategoría
```json
{
    "name": "Smartphones Premium",
    "description": "Teléfonos inteligentes de gama alta y flagship"
}
```

---

## 📱 Productos

### Crear Producto - iPhone 15 Pro
```json
{
    "name": "iPhone 15 Pro",
    "description": "El último smartphone de Apple con chip A17 Pro, cámara profesional y diseño en titanio. Incluye Dynamic Island, sistema de cámaras Pro de 48MP y grabación de video en 4K.",
    "shortDescription": "iPhone 15 Pro - 128GB Titanio Natural",
    "sku": "IPH15PRO128TN",
    "category": "CATEGORY_ID_ELECTRONICS",
    "subcategory": "SUBCATEGORY_ID_SMARTPHONES",
    "price": 999.99,
    "comparePrice": 1099.99,
    "cost": 750.00,
    "stock": {
        "quantity": 50,
        "minStock": 5,
        "trackStock": true
    },
    "dimensions": {
        "weight": 0.187,
        "length": 14.67,
        "width": 7.09,
        "height": 0.83
    },
    "images": [
        {
            "url": "https://example.com/iphone15pro-main.jpg",
            "alt": "iPhone 15 Pro imagen principal",
            "isPrimary": true
        },
        {
            "url": "https://example.com/iphone15pro-back.jpg",
            "alt": "iPhone 15 Pro vista posterior",
            "isPrimary": false
        }
    ],
    "tags": ["smartphone", "apple", "premium", "5g", "titanio", "pro"],
    "isFeatured": true,
    "isDigital": false,
    "seoDescription": "iPhone 15 Pro con chip A17 Pro, cámara profesional de 48MP y diseño en titanio. El smartphone más avanzado de Apple."
}
```

### Crear Producto - MacBook Air M2
```json
{
    "name": "MacBook Air M2",
    "description": "La laptop más popular de Apple rediseñada con el chip M2. Ultradelgada, potente y con hasta 18 horas de duración de batería.",
    "shortDescription": "MacBook Air M2 - 13 pulgadas, 256GB",
    "sku": "MBA13M2256",
    "category": "CATEGORY_ID_ELECTRONICS",
    "subcategory": "SUBCATEGORY_ID_LAPTOPS",
    "price": 1199.99,
    "comparePrice": 1299.99,
    "cost": 900.00,
    "stock": {
        "quantity": 25,
        "minStock": 3,
        "trackStock": true
    },
    "dimensions": {
        "weight": 1.24,
        "length": 30.41,
        "width": 21.5,
        "height": 1.13
    },
    "images": [
        {
            "url": "https://example.com/macbook-air-m2.jpg",
            "alt": "MacBook Air M2 vista frontal",
            "isPrimary": true
        }
    ],
    "tags": ["laptop", "apple", "m2", "ultrabook", "portátil"],
    "isFeatured": true,
    "isDigital": false,
    "seoDescription": "MacBook Air M2 de 13 pulgadas con chip M2, diseño ultradelgado y hasta 18 horas de batería."
}
```

### Crear Producto - AirPods Pro 2
```json
{
    "name": "AirPods Pro (2ª generación)",
    "description": "Los AirPods Pro de segunda generación con cancelación activa de ruido mejorada, audio espacial personalizado y estuche de carga MagSafe.",
    "shortDescription": "AirPods Pro 2 con estuche MagSafe",
    "sku": "AIRPODSPRO2",
    "category": "CATEGORY_ID_ELECTRONICS",
    "subcategory": "SUBCATEGORY_ID_HEADPHONES",
    "price": 249.99,
    "comparePrice": 279.99,
    "cost": 180.00,
    "stock": {
        "quantity": 100,
        "minStock": 10,
        "trackStock": true
    },
    "dimensions": {
        "weight": 0.056,
        "length": 6.06,
        "width": 4.53,
        "height": 2.14
    },
    "images": [
        {
            "url": "https://example.com/airpods-pro-2.jpg",
            "alt": "AirPods Pro 2ª generación",
            "isPrimary": true
        }
    ],
    "tags": ["auriculares", "apple", "inalámbricos", "noise-cancelling", "pro"],
    "isFeatured": false,
    "isDigital": false,
    "seoDescription": "AirPods Pro de 2ª generación con cancelación activa de ruido y audio espacial personalizado."
}
```

### Crear Producto Digital - Curso de Programación
```json
{
    "name": "Curso Completo de React Native",
    "description": "Aprende a desarrollar aplicaciones móviles multiplataforma con React Native desde cero hasta nivel avanzado.",
    "shortDescription": "Curso React Native - Nivel Completo",
    "sku": "CURSO-RN-2024",
    "category": "CATEGORY_ID_EDUCATION",
    "subcategory": "SUBCATEGORY_ID_PROGRAMMING",
    "price": 199.99,
    "comparePrice": 299.99,
    "cost": 50.00,
    "stock": {
        "quantity": 999,
        "minStock": 0,
        "trackStock": false
    },
    "images": [
        {
            "url": "https://example.com/curso-react-native.jpg",
            "alt": "Curso de React Native",
            "isPrimary": true
        }
    ],
    "tags": ["curso", "react-native", "programación", "móvil", "javascript"],
    "isFeatured": true,
    "isDigital": true,
    "seoDescription": "Curso completo de React Native para desarrollar aplicaciones móviles multiplataforma."
}
```

### Actualizar Producto
```json
{
    "name": "iPhone 15 Pro Max",
    "description": "La versión más grande del iPhone 15 Pro con pantalla de 6.7 pulgadas y batería de mayor duración",
    "price": 1199.99,
    "stock": {
        "quantity": 30
    }
}
```

### Actualizar Stock de Producto
```json
{
    "stock": {
        "quantity": 75,
        "minStock": 8
    }
}
```

---

## 🔧 Scripts de Postman

### Pre-request Script para Verificación de Token
```javascript
// Verificar si el token existe y no ha expirado
const moment = require('moment');
const tokenExpiry = pm.environment.get('tokenExpiry');
const currentTime = moment().unix();

if (!pm.environment.get('authToken') || !tokenExpiry || currentTime > tokenExpiry) {
    console.log('Token expirado o no existe, necesita autenticación manual');
    
    // Limpiar variables de token expirado
    pm.environment.unset('authToken');
    pm.environment.unset('tokenExpiry');
    pm.environment.unset('userInfo');
    
    if (pm.info.requestName !== 'Login') {
        console.log('⚠️ Ejecute primero la request de Login para obtener un token válido');
    }
} else {
    const timeLeft = tokenExpiry - currentTime;
    const hoursLeft = Math.floor(timeLeft / 3600);
    console.log(`✅ Token válido por ${hoursLeft} horas más`);
}
```

### Test Script para Login
```javascript
const moment = require('moment');

pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

pm.test('Response has token', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.expect(jsonData).to.have.property('user');
});

// Guardar token y información del usuario
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    
    // Guardar token
    pm.environment.set('authToken', jsonData.token);
    
    // Calcular expiración (24 horas desde ahora)
    const expiryTime = moment().add(24, 'hours').unix();
    pm.environment.set('tokenExpiry', expiryTime);
    
    // Guardar información del usuario
    pm.environment.set('userInfo', JSON.stringify(jsonData.user));
    pm.environment.set('userId', jsonData.user._id);
    pm.environment.set('userRole', jsonData.user.role);
    
    console.log('✅ Token guardado exitosamente');
    console.log('🔐 Token expira en 24 horas');
    console.log('👤 Usuario logueado:', jsonData.user.username);
    console.log('🎭 Rol:', jsonData.user.role);
}
```

### Test Script para Logout
```javascript
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

// Limpiar variables de entorno al hacer logout
if (pm.response.code === 200) {
    pm.environment.unset('authToken');
    pm.environment.unset('tokenExpiry');
    pm.environment.unset('userInfo');
    pm.environment.unset('userId');
    pm.environment.unset('userRole');
    
    console.log('✅ Logout exitoso - Variables limpiadas');
}
```

### Test Script Genérico para Crear Recursos
```javascript
pm.test('Status code is 201', function () {
    pm.response.to.have.status(201);
});

pm.test('Resource created successfully', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
    
    // Detectar tipo de recurso y guardar ID
    if (jsonData.user) {
        pm.environment.set('testUserId', jsonData.user._id);
        console.log('👤 Usuario creado:', jsonData.user._id);
    } else if (jsonData.category) {
        pm.environment.set('testCategoryId', jsonData.category._id);
        console.log('📂 Categoría creada:', jsonData.category._id);
    } else if (jsonData.subcategory) {
        pm.environment.set('testSubcategoryId', jsonData.subcategory._id);
        console.log('📁 Subcategoría creada:', jsonData.subcategory._id);
    } else if (jsonData.product) {
        pm.environment.set('testProductId', jsonData.product._id);
        console.log('📱 Producto creado:', jsonData.product._id);
    }
});
```

---

## 🚀 Instrucciones de Uso

### 1. Importar en Postman
1. Abre Postman
2. Ve a File > Import
3. Selecciona los archivos JSON de la colección y environment
4. La colección aparecerá en tu sidebar

### 2. Configurar Environment
1. Selecciona el environment "API Móvil - Development"
2. Modifica la variable `baseUrl` si tu servidor corre en otro puerto
3. Las demás variables se llenarán automáticamente

### 3. Autenticación
1. **IMPORTANTE**: Ejecuta primero la request "Login" en la carpeta "Autenticación"
2. El token se guardará automáticamente por 24 horas
3. Todas las demás requests usarán este token automáticamente

### 4. Orden de Pruebas Recomendado
1. **Servidor**: Health checks
2. **Autenticación**: Login
3. **Usuarios**: Crear, listar, actualizar
4. **Categorías**: Crear, listar, actualizar
5. **Subcategorías**: Crear (necesita categoría existente)
6. **Productos**: Crear (necesita categoría y subcategoría)

### 5. Variables Dinámicas
- `{{userId}}`: ID del usuario logueado
- `{{testUserId}}`: ID del último usuario creado en las pruebas
- `{{testCategoryId}}`: ID de la última categoría creada
- `{{testSubcategoryId}}`: ID de la última subcategoría creada
- `{{testProductId}}`: ID del último producto creado

---

## ⚡ Características Especiales

### Gestión Automática de Tokens
- **Expiración**: Los tokens expiran automáticamente después de 24 horas
- **Limpieza**: Las variables se limpian automáticamente al hacer logout
- **Verificación**: Cada request verifica si el token sigue siendo válido

### Scripts Inteligentes
- **Pre-request**: Verifica token antes de cada request
- **Post-request**: Guarda automáticamente IDs de recursos creados
- **Logging**: Información detallada en la consola de Postman

### Endpoints Públicos
Algunos endpoints no requieren autenticación:
- `/` - Información del servidor
- `/api` - Información de la API
- `/api/health` - Health check
- `/api/categories/active` - Categorías públicas
- `/api/subcategories/active` - Subcategorías públicas
- `/api/products/active` - Productos públicos
- `/api/products/featured` - Productos destacados
- `/api/products/search` - Búsqueda de productos

### Roles y Permisos
- **Admin**: Acceso completo a todas las funciones
- **Coordinador**: Gestión de categorías, subcategorías y productos
- **Usuario**: Solo puede actualizar su propio perfil

---

## 🔍 Solución de Problemas

### Token Expirado
- **Problema**: Error 401 Unauthorized
- **Solución**: Ejecutar nuevamente la request de Login

### Variables Vacías
- **Problema**: Variables como `{{testCategoryId}}` aparecen como undefined
- **Solución**: Ejecutar primero las requests de creación correspondientes

### Errores de Validación
- **Problema**: Error 400 Bad Request
- **Solución**: Verificar que todos los campos requeridos estén presentes y válidos

### Servidor No Disponible
- **Problema**: Error de conexión
- **Solución**: Verificar que el servidor backend esté ejecutándose en el puerto correcto
