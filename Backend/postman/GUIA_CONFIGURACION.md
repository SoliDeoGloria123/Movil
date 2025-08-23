# 📚 Guía Completa de Configuración de Postman
## API Móvil - Gestión de Productos

---

## 🎯 Objetivos de esta Guía

Esta guía te ayudará a:
- ✅ Importar la colección de Postman
- ✅ Configurar el environment correctamente
- ✅ Entender el manejo automático de tokens
- ✅ Probar todos los endpoints de la API
- ✅ Crear tus propias pruebas personalizadas

---

## 📋 Prerrequisitos

### 1. Software Necesario
- **Postman Desktop** (versión 10.0 o superior)
- **Servidor Backend** ejecutándose en `http://localhost:5000`

### 2. Archivos Requeridos
Asegúrate de tener estos archivos en la carpeta `/Backend/postman/`:
- `API_Movil_Collection.json` - Colección principal
- `API_Movil_Environment.json` - Variables de entorno
- `ejemplos_json.md` - Ejemplos de datos para pruebas

---

## 🚀 Paso 1: Importar la Colección

### Método 1: Importación Directa
1. **Abrir Postman**
2. **Hacer clic en "Import"** (botón superior izquierdo)
3. **Seleccionar "Upload Files"**
4. **Navegar a la carpeta** `/Backend/postman/`
5. **Seleccionar ambos archivos:**
   - `API_Movil_Collection.json`
   - `API_Movil_Environment.json`
6. **Hacer clic en "Import"**

### Método 2: Arrastrar y Soltar
1. **Abrir Postman**
2. **Arrastrar ambos archivos JSON** desde el explorador de archivos
3. **Soltarlos en la ventana de Postman**
4. **Confirmar la importación**

---

## ⚙️ Paso 2: Configurar el Environment

### Activar el Environment
1. **En la esquina superior derecha**, buscar el selector de environment
2. **Seleccionar "API Móvil - Development"**
3. **Verificar que esté activo** (debe aparecer en verde)

### Verificar Variables
1. **Hacer clic en el icono de ojo** 👁️ al lado del selector de environment
2. **Verificar que existan estas variables:**
   ```
   baseUrl: http://localhost:5000
   authToken: (vacío inicialmente)
   tokenExpiry: (vacío inicialmente)
   userInfo: (vacío inicialmente)
   userId: (vacío inicialmente)
   userRole: (vacío inicialmente)
   testUserId: (vacío inicialmente)
   testCategoryId: (vacío inicialmente)
   testSubcategoryId: (vacío inicialmente)
   testProductId: (vacío inicialmente)
   ```

### Personalizar la URL Base (si es necesario)
Si tu servidor corre en un puerto diferente:
1. **Hacer clic en "API Móvil - Development"**
2. **Editar la variable `baseUrl`**
3. **Cambiar a tu URL** (ej: `http://localhost:3000`)
4. **Guardar cambios**

---

## 🔐 Paso 3: Autenticación Inicial

### Primera Ejecución
1. **Expandir la carpeta "Autenticación"**
2. **Seleccionar la request "Login"**
3. **Verificar el cuerpo de la request:**
   ```json
   {
       "username": "admin",
       "password": "123456"
   }
   ```
4. **Hacer clic en "Send"**

### Verificar Autenticación Exitosa
Después del login exitoso, deberías ver:

**En la respuesta:**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "...",
        "username": "admin",
        "role": "admin"
    }
}
```

**En la consola de Postman:**
```
✅ Token guardado exitosamente
🔐 Token expira en 24 horas
👤 Usuario logueado: admin
🎭 Rol: admin
```

**En las variables de environment:**
- `authToken`: Se llena automáticamente
- `tokenExpiry`: Se calcula para 24 horas
- `userInfo`: Información del usuario
- `userId`: ID del usuario logueado
- `userRole`: Rol del usuario

---

## 🗂️ Paso 4: Estructura de la Colección

### Carpetas Principales

#### 1. 🖥️ **Servidor**
Endpoints públicos sin autenticación:
- `GET /` - Información del servidor
- `GET /api` - Información de la API
- `GET /api/health` - Health check

#### 2. 🔐 **Autenticación**
Gestión de sesiones:
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify-token` - Verificar token
- `GET /api/auth/me` - Obtener perfil
- `PUT /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/logout` - Cerrar sesión

#### 3. 👥 **Usuarios**
Gestión de usuarios (requiere rol admin):
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `GET /api/users/stats` - Estadísticas
- `PATCH /api/users/:id/toggle-status` - Cambiar estado
- 🗑️ `DELETE /api/users/:id` - **Eliminar usuario** (Solo Admin)

#### 4. 📂 **Categorías**
Gestión de categorías:
- `GET /api/categories/active` - Públicas (sin auth)
- `GET /api/categories` - Todas (con auth)
- `POST /api/categories` - Crear
- `GET /api/categories/:id` - Obtener por ID
- `PUT /api/categories/:id` - Actualizar
- `GET /api/categories/stats` - Estadísticas
- `PATCH /api/categories/:id/toggle-status` - Cambiar estado
- `PUT /api/categories/reorder` - Reordenar
- 🗑️ `DELETE /api/categories/:id` - **Eliminar categoría** (Solo Admin)

#### 5. 📁 **Subcategorías**
Gestión de subcategorías:
- `GET /api/subcategories/active` - Públicas
- `GET /api/subcategories` - Todas
- `POST /api/subcategories` - Crear
- `GET /api/subcategories/:id` - Obtener por ID
- `PUT /api/subcategories/:id` - Actualizar
- `GET /api/subcategories/category/:id` - Por categoría
- 🗑️ `DELETE /api/subcategories/:id` - **Eliminar subcategoría** (Solo Admin)

#### 6. 📱 **Productos**
Gestión de productos:
- `GET /api/products/active` - Públicos
- `GET /api/products` - Todos
- `POST /api/products` - Crear
- `GET /api/products/:id` - Obtener por ID
- `PUT /api/products/:id` - Actualizar
- `GET /api/products/featured` - Destacados
- `GET /api/products/category/:id` - Por categoría
- `GET /api/products/subcategory/:id` - Por subcategoría
- `GET /api/products/search?q=texto` - Búsqueda
- 📦 `PATCH /api/products/:id/stock` - **Actualizar stock** (Admin/Coordinador)
- 🗑️ `DELETE /api/products/:id` - **Eliminar producto** (Solo Admin)

---

## 🔄 Paso 5: Flujo de Pruebas Recomendado

### Secuencia Básica de Pruebas

#### 1. **Verificar Servidor** (2-3 min)
```
1. Servidor → Health Check - Raíz
2. Servidor → API Info
3. Servidor → Health Check - API
```

#### 2. **Autenticación** (2 min)
```
1. Autenticación → Login ⭐ (OBLIGATORIO PRIMERO)
2. Autenticación → Verificar Token
3. Autenticación → Obtener Mi Perfil
```

#### 3. **Crear Datos Base** (5 min)
```
1. Usuarios → Crear Usuario
2. Categorías → Crear Categoría ⭐
3. Subcategorías → Crear Subcategoría ⭐
```

#### 4. **Probar Gestión Completa** (10 min)
```
1. Categorías → Listar Todas las Categorías
2. Categorías → Obtener Categoría por ID
3. Subcategorías → Listar Todas las Subcategorías
4. Productos → Crear Producto ⭐
5. Productos → Listar Todos los Productos
```

#### 5. **Funcionalidades Avanzadas** (5 min)
```
1. Productos → Búsqueda de Productos
2. Productos → Productos Destacados
3. Categorías → Estadísticas de Categorías
4. Usuarios → Estadísticas de Usuarios
```

---

## 🤖 Paso 6: Funciones Automáticas

### Gestión Automática de Tokens

#### Pre-request Script (se ejecuta antes de cada request)
```javascript
// Verifica automáticamente si el token sigue válido
// Si ha expirado, limpia las variables y avisa
// Calcula cuánto tiempo queda de validez
```

#### Post-request Script (se ejecuta después de cada request exitoso)
```javascript
// En Login: Guarda token y calcula expiración
// En Logout: Limpia todas las variables
// En creación: Guarda IDs de recursos creados
```

### Variables Dinámicas Automáticas

Estas variables se llenan automáticamente:
- `{{authToken}}` - Token JWT actual
- `{{userId}}` - ID del usuario logueado
- `{{testUserId}}` - ID del último usuario creado
- `{{testCategoryId}}` - ID de la última categoría creada
- `{{testSubcategoryId}}` - ID de la última subcategoría creada
- `{{testProductId}}` - ID del último producto creado

---

## 📊 Paso 7: Interpretación de Respuestas

### Respuestas Exitosas

#### Login Exitoso (200)
```json
{
    "success": true,
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "isActive": true
    }
}
```

#### Creación Exitosa (201)
```json
{
    "success": true,
    "message": "Categoría creada exitosamente",
    "category": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Electrónicos",
        "description": "Dispositivos electrónicos",
        "slug": "electronicos",
        "isActive": true,
        "createdAt": "2024-01-01T12:00:00.000Z"
    }
}
```

#### Listado con Paginación (200)
```json
{
    "success": true,
    "products": [
        {
            "_id": "507f1f77bcf86cd799439013",
            "name": "iPhone 15 Pro",
            "price": 999.99,
            "category": {
                "name": "Electrónicos",
                "slug": "electronicos"
            }
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "pages": 1
    }
}
```

### Errores Comunes

#### Error de Autenticación (401)
```json
{
    "success": false,
    "message": "Token no proporcionado o inválido"
}
```
**Solución**: Ejecutar request de Login

#### Error de Validación (400)
```json
{
    "success": false,
    "message": "Errores de validación",
    "errors": [
        {
            "field": "name",
            "message": "El nombre es requerido"
        }
    ]
}
```
**Solución**: Revisar los datos enviados

#### Error de Permisos (403)
```json
{
    "success": false,
    "message": "No tienes permisos para realizar esta acción"
}
```
**Solución**: Verificar rol del usuario logueado

---

## 🛠️ Paso 8: Personalización y Extensión

### Crear Nuevas Requests

#### 1. Duplicar Request Existente
1. **Clic derecho** en una request similar
2. **"Duplicate"**
3. **Renombrar** la nueva request
4. **Modificar** URL, método y cuerpo según necesidad

#### 2. Crear Request desde Cero
1. **Clic derecho** en una carpeta
2. **"Add Request"**
3. **Configurar** método, URL y headers
4. **Agregar** scripts si es necesario

### Modificar Environment para Producción

#### Crear Environment de Producción
1. **Clic en el icono de engranaje** ⚙️ junto al selector de environment
2. **"Add"**
3. **Nombrar**: "API Móvil - Production"
4. **Configurar variables:**
   ```
   baseUrl: https://tu-api.com
   authToken: (vacío)
   // ... resto de variables
   ```

### Scripts Personalizados

#### Ejemplo: Validación Personalizada
```javascript
// En Tests tab
pm.test("Producto tiene todas las propiedades requeridas", function () {
    const jsonData = pm.response.json();
    const product = jsonData.product;
    
    pm.expect(product).to.have.property('name');
    pm.expect(product).to.have.property('price');
    pm.expect(product).to.have.property('sku');
    pm.expect(product).to.have.property('category');
    pm.expect(product).to.have.property('subcategory');
});
```

#### Ejemplo: Logging Personalizado
```javascript
// En Tests tab
console.log('📊 Producto creado:');
console.log('   ID:', pm.response.json().product._id);
console.log('   Nombre:', pm.response.json().product.name);
console.log('   Precio:', pm.response.json().product.price);
```

---

## 🐛 Paso 9: Solución de Problemas

### Problemas de Conexión

#### Error: "Could not get any response"
**Causas posibles:**
- ❌ Servidor backend no está ejecutándose
- ❌ URL incorrecta en `baseUrl`
- ❌ Firewall bloqueando la conexión

**Soluciones:**
1. Verificar que el servidor esté corriendo: `npm start` o `node app.js`
2. Verificar la URL en el environment
3. Probar la URL en el navegador: `http://localhost:5000`

#### Error: "Timeout"
**Causas posibles:**
- ❌ Servidor sobrecargado
- ❌ Consulta muy pesada en la base de datos

**Soluciones:**
1. Aumentar timeout en Postman: Settings → General → Request timeout
2. Verificar logs del servidor
3. Optimizar la consulta si es personalizada

### Problemas de Autenticación

#### Error: "Token expirado"
**Síntomas:**
- Error 401 en requests autenticadas
- Mensaje en consola: "Token expirado o no existe"

**Solución:**
1. Ejecutar nuevamente la request "Login"
2. Verificar que las credenciales sean correctas
3. Confirmar que el token se guardó en `authToken`

#### Error: "Variables {{authToken}} no resuelve"
**Causas posibles:**
- ❌ Environment no está seleccionado
- ❌ Variable `authToken` está vacía
- ❌ Sintaxis incorrecta de variable

**Soluciones:**
1. Verificar que el environment esté activo
2. Hacer login nuevamente
3. Verificar sintaxis: `{{authToken}}` (con doble llave)

### Problemas de Validación

#### Error: "Errores de validación" (400)
**Diagnóstico:**
1. Revisar el cuerpo del error para ver campos específicos
2. Verificar que todos los campos requeridos estén presentes
3. Confirmar tipos de datos (string, number, boolean)

**Ejemplo de fix:**
```json
// ❌ Incorrecto
{
    "price": "999.99"  // String en lugar de número
}

// ✅ Correcto
{
    "price": 999.99    // Número
}
```

#### Error: "Referencia inválida" (400)
**Síntomas:**
- Error al crear producto: "La categoría debe existir"
- Error al crear subcategoría: "La categoría no es válida"

**Solución:**
1. Verificar que las variables `{{testCategoryId}}` estén llenas
2. Crear primero categorías y subcategorías
3. Usar IDs reales en lugar de variables vacías

---

## 📈 Paso 10: Mejores Prácticas

### Organización de Requests

#### Nomenclatura Consistente
```
✅ Bueno:
- "Crear Usuario Admin"
- "Actualizar Producto"
- "Listar Categorías Activas"

❌ Malo:
- "test user creation"
- "update_product"
- "get cats"
```

#### Agrupación Lógica
- **Usar carpetas** para agrupar funcionalidades relacionadas
- **Ordenar requests** por flujo lógico (crear → leer → actualizar → eliminar)
- **Separar endpoints públicos** de los que requieren autenticación

### Gestión de Datos de Prueba

#### Variables Descriptivas
```javascript
// ✅ Bueno
pm.environment.set('testCategoryElectronics', jsonData.category._id);
pm.environment.set('testUserCoordinator', jsonData.user._id);

// ❌ Malo
pm.environment.set('cat1', jsonData.category._id);
pm.environment.set('usr', jsonData.user._id);
```

#### Limpieza de Datos
```javascript
// Script para limpiar datos de prueba
pm.environment.unset('testUserId');
pm.environment.unset('testCategoryId');
pm.environment.unset('testSubcategoryId');
pm.environment.unset('testProductId');
console.log('🧹 Variables de prueba limpiadas');
```

### Logging Efectivo

#### Logs Informativos
```javascript
// Durante creación
console.log('📝 Creando categoría:', JSON.parse(pm.request.body.raw).name);

// Después de éxito
console.log('✅ Categoría creada exitosamente');
console.log('🆔 ID asignado:', jsonData.category._id);
console.log('📛 Slug generado:', jsonData.category.slug);
```

#### Logs de Error
```javascript
// En caso de error
if (pm.response.code !== 201) {
    console.log('❌ Error al crear categoría');
    console.log('📋 Respuesta:', pm.response.json());
}
```

---

## 🎓 Paso 11: Casos de Uso Avanzados

### Pruebas de Carga Básicas

#### Crear Múltiples Productos
```javascript
// Pre-request Script
const productsData = [
    { name: "iPhone 15", price: 999.99, sku: "IPH15" },
    { name: "Samsung Galaxy S24", price: 899.99, sku: "SGS24" },
    { name: "Google Pixel 8", price: 699.99, sku: "GP8" }
];

const currentIndex = pm.environment.get('productIndex') || 0;
const currentProduct = productsData[currentIndex];

pm.environment.set('currentProductName', currentProduct.name);
pm.environment.set('currentProductPrice', currentProduct.price);
pm.environment.set('currentProductSku', currentProduct.sku);

// Incrementar índice para la siguiente ejecución
pm.environment.set('productIndex', (currentIndex + 1) % productsData.length);
```

### Pruebas de Integración

#### Flujo Completo: Categoría → Subcategoría → Producto
```javascript
// Test script para validar flujo completo
pm.test("Flujo completo ejecutado correctamente", function() {
    const categoryId = pm.environment.get('testCategoryId');
    const subcategoryId = pm.environment.get('testSubcategoryId');
    const productId = pm.environment.get('testProductId');
    
    pm.expect(categoryId).to.not.be.undefined;
    pm.expect(subcategoryId).to.not.be.undefined;
    pm.expect(productId).to.not.be.undefined;
    
    console.log('🔗 Flujo de integración completo:');
    console.log('   📂 Categoría:', categoryId);
    console.log('   📁 Subcategoría:', subcategoryId);
    console.log('   📱 Producto:', productId);
});
```

### Monitoreo y Alertas

#### Verificación de Performance
```javascript
// Test script para monitorear performance
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000); // 2 segundos
});

pm.test("Response size is reasonable", function () {
    pm.expect(pm.response.responseSize).to.be.below(1000000); // 1MB
});
```

#### Alertas de Estado del Servidor
```javascript
// Test para health check
pm.test("Server is healthy", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("funcionamiento");
});

// Log de estado
if (pm.response.json().success) {
    console.log('💚 Servidor en estado saludable');
} else {
    console.log('🔴 ¡ALERTA! Servidor con problemas');
}
```

---

## 📋 Lista de Verificación Final

### ✅ Configuración Inicial
- [ ] Postman instalado y actualizado
- [ ] Colección importada correctamente
- [ ] Environment seleccionado y configurado
- [ ] Servidor backend ejecutándose
- [ ] URL base configurada correctamente

### ✅ Autenticación
- [ ] Login exitoso ejecutado
- [ ] Token guardado en variables de environment
- [ ] Variables de usuario configuradas
- [ ] Prueba de endpoint autenticado exitosa

### ✅ Pruebas Básicas
- [ ] Health checks funcionando
- [ ] Creación de usuario exitosa
- [ ] Creación de categoría exitosa
- [ ] Creación de subcategoría exitosa
- [ ] Creación de producto exitosa

### ✅ Funcionalidades Avanzadas
- [ ] Búsqueda de productos funcionando
- [ ] Estadísticas accesibles
- [ ] Endpoints públicos funcionando sin auth
- [ ] Manejo de errores apropiado

### ✅ Personalización
- [ ] Scripts personalizados (si aplica)
- [ ] Environment de producción (si aplica)
- [ ] Requests adicionales creadas (si aplica)
- [ ] Documentación personalizada (si aplica)

---

## 🤝 Soporte y Recursos Adicionales

### Documentación Oficial
- [Postman Learning Center](https://learning.postman.com/)
- [Postman API Documentation](https://documenter.getpostman.com/)
- [Postman Scripting Reference](https://learning.postman.com/docs/writing-scripts/script-references/)

### Scripts de Ejemplo Adicionales
Consulta el archivo `ejemplos_json.md` para:
- Más ejemplos de JSON para diferentes endpoints
- Scripts adicionales de pre-request y test
- Casos de uso específicos por módulo

### Contacto para Soporte
Si encuentras problemas o necesitas ayuda adicional:
1. Revisar los logs de la consola de Postman
2. Verificar los logs del servidor backend
3. Consultar la documentación de la API
4. Revisar los ejemplos en `ejemplos_json.md`

---

## 🎉 ¡Felicitaciones!

Has configurado exitosamente la colección de Postman para la API Móvil de Gestión de Productos. Ahora puedes:

- ✨ Probar todos los endpoints de la API
- 🔄 Gestionar automáticamente los tokens de autenticación
- 📊 Monitorear el rendimiento de la API
- 🚀 Desarrollar y probar nuevas funcionalidades
- 📈 Escalar las pruebas según tus necesidades

¡Que tengas una excelente experiencia probando la API!
