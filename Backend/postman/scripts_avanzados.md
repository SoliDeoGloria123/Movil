# 🔧 Scripts Avanzados para Postman
## API Móvil - Gestión de Productos

---

## 📚 Índice
- [Scripts de Pre-request](#scripts-de-pre-request)
- [Scripts de Test](#scripts-de-test)
- [Scripts de Environment](#scripts-de-environment)
- [Scripts de Monitoreo](#scripts-de-monitoreo)
- [Utilidades Avanzadas](#utilidades-avanzadas)

---

## 🚀 Scripts de Pre-request

### 1. Verificación Avanzada de Token
```javascript
/**
 * Script avanzado para verificación y renovación automática de token
 * Úsalo en el Pre-request Script a nivel de colección
 */

const moment = require('moment');

// Configuración
const TOKEN_BUFFER_MINUTES = 30; // Renovar token si queda menos de 30 min
const MAX_RETRY_ATTEMPTS = 3;

// Obtener variables de entorno
const authToken = pm.environment.get('authToken');
const tokenExpiry = pm.environment.get('tokenExpiry');
const retryCount = pm.environment.get('retryCount') || 0;

// Función para limpiar variables de autenticación
function clearAuthVariables() {
    pm.environment.unset('authToken');
    pm.environment.unset('tokenExpiry');
    pm.environment.unset('userInfo');
    pm.environment.unset('userId');
    pm.environment.unset('userRole');
    pm.environment.unset('retryCount');
}

// Función para verificar si el token está próximo a expirar
function isTokenExpiringSoon(expiryTimestamp) {
    if (!expiryTimestamp) return true;
    
    const expiryTime = moment.unix(expiryTimestamp);
    const bufferTime = moment().add(TOKEN_BUFFER_MINUTES, 'minutes');
    
    return expiryTime.isBefore(bufferTime);
}

// Verificación principal
if (!authToken || !tokenExpiry) {
    if (pm.info.requestName !== 'Login') {
        console.log('⚠️  No hay token disponible. Ejecute la request de Login primero.');
        clearAuthVariables();
    }
} else if (isTokenExpiringSoon(tokenExpiry)) {
    const timeLeft = moment.unix(tokenExpiry).diff(moment(), 'minutes');
    
    if (timeLeft <= 0) {
        console.log('🔴 Token expirado. Limpiando variables...');
        clearAuthVariables();
        
        if (pm.info.requestName !== 'Login') {
            console.log('⚠️  Token expirado. Ejecute la request de Login nuevamente.');
        }
    } else {
        console.log(`🟡 Token expira en ${timeLeft} minutos. Considere renovarlo pronto.`);
    }
} else {
    const timeLeft = moment.unix(tokenExpiry).diff(moment(), 'hours');
    console.log(`✅ Token válido por ${Math.floor(timeLeft)} horas más`);
}

// Logging de información de request
console.log(`📡 Ejecutando: ${pm.info.requestName}`);
console.log(`🎯 Método: ${pm.request.method}`);
console.log(`🌐 URL: ${pm.request.url}`);
```

### 2. Generación Automática de Datos de Prueba
```javascript
/**
 * Generador automático de datos de prueba
 * Úsalo en requests específicas que necesiten datos únicos
 */

// Funciones de utilidad
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateRandomEmail(domain = 'test.com') {
    const username = generateRandomString(10).toLowerCase();
    return `${username}@${domain}`;
}

function generateRandomSKU(prefix = 'TEST') {
    const randomPart = generateRandomString(6).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${randomPart}-${timestamp}`;
}

function generateRandomPrice(min = 10, max = 1000) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Detectar tipo de request y generar datos apropiados
const requestName = pm.info.requestName.toLowerCase();

if (requestName.includes('crear usuario') || requestName.includes('create user')) {
    const randomSuffix = generateRandomString(4).toLowerCase();
    pm.environment.set('randomUsername', `usuario_${randomSuffix}`);
    pm.environment.set('randomEmail', generateRandomEmail());
    pm.environment.set('randomPhone', Math.floor(Math.random() * 9000000000) + 1000000000);
    
    console.log('👤 Datos de usuario generados:');
    console.log(`   Username: ${pm.environment.get('randomUsername')}`);
    console.log(`   Email: ${pm.environment.get('randomEmail')}`);
    console.log(`   Phone: ${pm.environment.get('randomPhone')}`);
}

if (requestName.includes('crear producto') || requestName.includes('create product')) {
    pm.environment.set('randomSKU', generateRandomSKU('PROD'));
    pm.environment.set('randomPrice', generateRandomPrice(50, 2000));
    pm.environment.set('randomStock', Math.floor(Math.random() * 100) + 1);
    
    console.log('📦 Datos de producto generados:');
    console.log(`   SKU: ${pm.environment.get('randomSKU')}`);
    console.log(`   Precio: $${pm.environment.get('randomPrice')}`);
    console.log(`   Stock: ${pm.environment.get('randomStock')}`);
}

if (requestName.includes('crear categoría') || requestName.includes('create category')) {
    const categories = ['Tecnología', 'Deportes', 'Moda', 'Hogar', 'Salud', 'Educación'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const suffix = generateRandomString(3);
    
    pm.environment.set('randomCategoryName', `${randomCategory} ${suffix}`);
    pm.environment.set('randomCategoryColor', `#${Math.floor(Math.random()*16777215).toString(16)}`);
    
    console.log('📂 Datos de categoría generados:');
    console.log(`   Nombre: ${pm.environment.get('randomCategoryName')}`);
    console.log(`   Color: ${pm.environment.get('randomCategoryColor')}`);
}
```

### 3. Validación de Dependencias
```javascript
/**
 * Validador de dependencias para requests que necesitan recursos previos
 * Úsalo en requests que dependen de otros recursos (ej: productos necesitan categorías)
 */

const requestName = pm.info.requestName.toLowerCase();

// Validaciones específicas por tipo de request
if (requestName.includes('producto') && 
    (requestName.includes('crear') || requestName.includes('create'))) {
    
    const categoryId = pm.environment.get('testCategoryId');
    const subcategoryId = pm.environment.get('testSubcategoryId');
    
    if (!categoryId) {
        console.log('❌ ERROR: No hay categoría disponible para crear el producto');
        console.log('💡 Solución: Ejecute primero "Crear Categoría"');
        throw new Error('Categoría requerida para crear producto');
    }
    
    if (!subcategoryId) {
        console.log('❌ ERROR: No hay subcategoría disponible para crear el producto');
        console.log('💡 Solución: Ejecute primero "Crear Subcategoría"');
        throw new Error('Subcategoría requerida para crear producto');
    }
    
    console.log('✅ Dependencias de producto validadas');
    console.log(`   📂 Categoría: ${categoryId}`);
    console.log(`   📁 Subcategoría: ${subcategoryId}`);
}

if (requestName.includes('subcategoría') && 
    (requestName.includes('crear') || requestName.includes('create'))) {
    
    const categoryId = pm.environment.get('testCategoryId');
    
    if (!categoryId) {
        console.log('❌ ERROR: No hay categoría disponible para crear la subcategoría');
        console.log('💡 Solución: Ejecute primero "Crear Categoría"');
        throw new Error('Categoría requerida para crear subcategoría');
    }
    
    console.log('✅ Dependencias de subcategoría validadas');
    console.log(`   📂 Categoría: ${categoryId}`);
}

// Validación de autenticación para requests protegidas
const protectedEndpoints = ['usuarios', 'categories', 'subcategories', 'products'];
const isProtectedRequest = protectedEndpoints.some(endpoint => 
    pm.request.url.toString().includes(endpoint)
);

if (isProtectedRequest && requestName !== 'login') {
    const authToken = pm.environment.get('authToken');
    
    if (!authToken) {
        console.log('❌ ERROR: Request protegida sin token de autenticación');
        console.log('💡 Solución: Ejecute primero "Login"');
        throw new Error('Token de autenticación requerido');
    }
}
```

---

## ✅ Scripts de Test

### 1. Suite de Tests Completa
```javascript
/**
 * Suite completa de tests para validar respuestas de la API
 * Úsalo en el Test Script a nivel de colección o requests específicas
 */

// Tests básicos de respuesta HTTP
pm.test("Response status is valid", function () {
    const validStatuses = [200, 201, 204];
    pm.expect(validStatuses).to.include(pm.response.code);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000); // 5 segundos
});

pm.test("Response has valid JSON", function () {
    pm.expect(() => pm.response.json()).to.not.throw();
});

// Tests de estructura de respuesta
pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.a('boolean');
});

pm.test("Response has message field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData.message).to.be.a('string');
});

// Tests específicos por método HTTP
if (pm.request.method === 'POST') {
    pm.test("POST request should return 201", function () {
        pm.expect(pm.response.code).to.equal(201);
    });
    
    pm.test("POST response should indicate creation", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.true;
        pm.expect(jsonData.message).to.match(/creado|created/i);
    });
}

if (pm.request.method === 'GET') {
    pm.test("GET request should return 200", function () {
        pm.expect(pm.response.code).to.equal(200);
    });
}

if (pm.request.method === 'PUT') {
    pm.test("PUT request should return 200", function () {
        pm.expect(pm.response.code).to.equal(200);
    });
    
    pm.test("PUT response should indicate update", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.true;
        pm.expect(jsonData.message).to.match(/actualizado|updated/i);
    });
}

if (pm.request.method === 'DELETE') {
    pm.test("DELETE request should return 200 or 204", function () {
        pm.expect([200, 204]).to.include(pm.response.code);
    });
}

// Logging detallado de la respuesta
const jsonData = pm.response.json();
console.log('📊 Resumen de Respuesta:');
console.log(`   🔢 Status: ${pm.response.code} ${pm.response.status}`);
console.log(`   ⏱️  Tiempo: ${pm.response.responseTime}ms`);
console.log(`   📦 Tamaño: ${pm.response.responseSize} bytes`);
console.log(`   ✅ Éxito: ${jsonData.success ? 'Sí' : 'No'}`);
console.log(`   💬 Mensaje: ${jsonData.message}`);
```

### 2. Tests Específicos por Endpoint
```javascript
/**
 * Tests específicos según el endpoint llamado
 * Adaptables según el tipo de recurso
 */

const requestName = pm.info.requestName.toLowerCase();
const requestUrl = pm.request.url.toString().toLowerCase();

// Tests para endpoints de autenticación
if (requestUrl.includes('/auth/login')) {
    pm.test("Login response has token", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('token');
        pm.expect(jsonData.token).to.be.a('string');
        pm.expect(jsonData.token.length).to.be.above(20);
    });
    
    pm.test("Login response has user info", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('user');
        pm.expect(jsonData.user).to.have.property('_id');
        pm.expect(jsonData.user).to.have.property('username');
        pm.expect(jsonData.user).to.have.property('role');
    });
    
    pm.test("User role is valid", function () {
        const jsonData = pm.response.json();
        const validRoles = ['admin', 'coordinador'];
        pm.expect(validRoles).to.include(jsonData.user.role);
    });
}

// Tests para endpoints de usuarios
if (requestUrl.includes('/users') && !requestUrl.includes('/auth')) {
    if (pm.request.method === 'GET' && !requestUrl.includes('/stats')) {
        pm.test("Users response has users array or user object", function () {
            const jsonData = pm.response.json();
            
            if (jsonData.users) {
                pm.expect(jsonData.users).to.be.an('array');
            } else if (jsonData.user) {
                pm.expect(jsonData.user).to.be.an('object');
                pm.expect(jsonData.user).to.have.property('_id');
            }
        });
    }
    
    if (pm.request.method === 'POST') {
        pm.test("User creation response has user object", function () {
            const jsonData = pm.response.json();
            pm.expect(jsonData).to.have.property('user');
            pm.expect(jsonData.user).to.have.property('_id');
            pm.expect(jsonData.user).to.have.property('username');
            pm.expect(jsonData.user).to.have.property('email');
        });
        
        pm.test("Created user has valid email format", function () {
            const jsonData = pm.response.json();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            pm.expect(jsonData.user.email).to.match(emailRegex);
        });
    }
}

// Tests para endpoints de categorías
if (requestUrl.includes('/categories')) {
    if (pm.request.method === 'GET') {
        pm.test("Categories response has categories array", function () {
            const jsonData = pm.response.json();
            
            if (requestUrl.includes('/stats')) {
                pm.expect(jsonData).to.have.property('stats');
            } else if (jsonData.categories) {
                pm.expect(jsonData.categories).to.be.an('array');
            } else if (jsonData.category) {
                pm.expect(jsonData.category).to.be.an('object');
            }
        });
    }
    
    if (pm.request.method === 'POST') {
        pm.test("Category creation response has category object", function () {
            const jsonData = pm.response.json();
            pm.expect(jsonData).to.have.property('category');
            pm.expect(jsonData.category).to.have.property('_id');
            pm.expect(jsonData.category).to.have.property('name');
            pm.expect(jsonData.category).to.have.property('slug');
        });
        
        pm.test("Category has valid slug format", function () {
            const jsonData = pm.response.json();
            const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
            pm.expect(jsonData.category.slug).to.match(slugRegex);
        });
    }
}

// Tests para endpoints de productos
if (requestUrl.includes('/products')) {
    if (pm.request.method === 'GET') {
        pm.test("Products response has products array or product object", function () {
            const jsonData = pm.response.json();
            
            if (jsonData.products) {
                pm.expect(jsonData.products).to.be.an('array');
            } else if (jsonData.product) {
                pm.expect(jsonData.product).to.be.an('object');
            }
        });
    }
    
    if (pm.request.method === 'POST') {
        pm.test("Product creation response has product object", function () {
            const jsonData = pm.response.json();
            pm.expect(jsonData).to.have.property('product');
            pm.expect(jsonData.product).to.have.property('_id');
            pm.expect(jsonData.product).to.have.property('name');
            pm.expect(jsonData.product).to.have.property('sku');
            pm.expect(jsonData.product).to.have.property('price');
        });
        
        pm.test("Product has valid price", function () {
            const jsonData = pm.response.json();
            pm.expect(jsonData.product.price).to.be.a('number');
            pm.expect(jsonData.product.price).to.be.above(0);
        });
        
        pm.test("Product has valid SKU format", function () {
            const jsonData = pm.response.json();
            pm.expect(jsonData.product.sku).to.be.a('string');
            pm.expect(jsonData.product.sku.length).to.be.above(2);
        });
    }
}
```

### 3. Gestión Automática de Variables
```javascript
/**
 * Script para gestionar automáticamente variables de entorno
 * Guarda IDs de recursos creados y limpia variables cuando es necesario
 */

const jsonData = pm.response.json();
const requestMethod = pm.request.method;
const requestUrl = pm.request.url.toString().toLowerCase();

// Solo procesar respuestas exitosas
if (pm.response.code >= 200 && pm.response.code < 300 && jsonData.success) {
    
    // Gestión de login
    if (requestUrl.includes('/auth/login') && requestMethod === 'POST') {
        const moment = require('moment');
        
        pm.environment.set('authToken', jsonData.token);
        pm.environment.set('userInfo', JSON.stringify(jsonData.user));
        pm.environment.set('userId', jsonData.user._id);
        pm.environment.set('userRole', jsonData.user.role);
        
        // Calcular expiración (24 horas)
        const expiryTime = moment().add(24, 'hours').unix();
        pm.environment.set('tokenExpiry', expiryTime);
        
        console.log('🔐 Variables de autenticación guardadas:');
        console.log(`   👤 Usuario: ${jsonData.user.username}`);
        console.log(`   🎭 Rol: ${jsonData.user.role}`);
        console.log(`   ⏰ Expira: ${moment.unix(expiryTime).format('DD/MM/YYYY HH:mm')}`);
    }
    
    // Gestión de logout
    if (requestUrl.includes('/auth/logout') && requestMethod === 'POST') {
        pm.environment.unset('authToken');
        pm.environment.unset('tokenExpiry');
        pm.environment.unset('userInfo');
        pm.environment.unset('userId');
        pm.environment.unset('userRole');
        
        console.log('🚪 Variables de autenticación limpiadas');
    }
    
    // Gestión de usuarios
    if (requestUrl.includes('/users') && requestMethod === 'POST') {
        if (jsonData.user) {
            pm.environment.set('testUserId', jsonData.user._id);
            pm.environment.set('lastCreatedUserEmail', jsonData.user.email);
            
            console.log('👤 Variables de usuario guardadas:');
            console.log(`   🆔 ID: ${jsonData.user._id}`);
            console.log(`   📧 Email: ${jsonData.user.email}`);
        }
    }
    
    // Gestión de categorías
    if (requestUrl.includes('/categories') && requestMethod === 'POST') {
        if (jsonData.category) {
            pm.environment.set('testCategoryId', jsonData.category._id);
            pm.environment.set('lastCreatedCategoryName', jsonData.category.name);
            pm.environment.set('lastCreatedCategorySlug', jsonData.category.slug);
            
            console.log('📂 Variables de categoría guardadas:');
            console.log(`   🆔 ID: ${jsonData.category._id}`);
            console.log(`   📛 Nombre: ${jsonData.category.name}`);
            console.log(`   🔗 Slug: ${jsonData.category.slug}`);
        }
    }
    
    // Gestión de subcategorías
    if (requestUrl.includes('/subcategories') && requestMethod === 'POST') {
        if (jsonData.subcategory) {
            pm.environment.set('testSubcategoryId', jsonData.subcategory._id);
            pm.environment.set('lastCreatedSubcategoryName', jsonData.subcategory.name);
            
            console.log('📁 Variables de subcategoría guardadas:');
            console.log(`   🆔 ID: ${jsonData.subcategory._id}`);
            console.log(`   📛 Nombre: ${jsonData.subcategory.name}`);
        }
    }
    
    // Gestión de productos
    if (requestUrl.includes('/products') && requestMethod === 'POST') {
        if (jsonData.product) {
            pm.environment.set('testProductId', jsonData.product._id);
            pm.environment.set('lastCreatedProductName', jsonData.product.name);
            pm.environment.set('lastCreatedProductSKU', jsonData.product.sku);
            
            console.log('📦 Variables de producto guardadas:');
            console.log(`   🆔 ID: ${jsonData.product._id}`);
            console.log(`   📛 Nombre: ${jsonData.product.name}`);
            console.log(`   🏷️  SKU: ${jsonData.product.sku}`);
        }
    }
    
    // Gestión de eliminaciones
    if (requestMethod === 'DELETE') {
        const urlParts = requestUrl.split('/');
        const resourceId = urlParts[urlParts.length - 1];
        
        // Limpiar variables si se elimina el recurso que estamos rastreando
        if (pm.environment.get('testUserId') === resourceId) {
            pm.environment.unset('testUserId');
            console.log('🗑️  Variable testUserId limpiada (recurso eliminado)');
        }
        
        if (pm.environment.get('testCategoryId') === resourceId) {
            pm.environment.unset('testCategoryId');
            console.log('🗑️  Variable testCategoryId limpiada (recurso eliminado)');
        }
        
        if (pm.environment.get('testSubcategoryId') === resourceId) {
            pm.environment.unset('testSubcategoryId');
            console.log('🗑️  Variable testSubcategoryId limpiada (recurso eliminado)');
        }
        
        if (pm.environment.get('testProductId') === resourceId) {
            pm.environment.unset('testProductId');
            console.log('🗑️  Variable testProductId limpiada (recurso eliminado)');
        }
    }
}

// Logging de errores
if (pm.response.code >= 400) {
    console.log('❌ Error en la respuesta:');
    console.log(`   🔢 Código: ${pm.response.code}`);
    console.log(`   💬 Mensaje: ${jsonData.message || 'Sin mensaje'}`);
    
    if (jsonData.errors) {
        console.log('   📋 Errores de validación:');
        jsonData.errors.forEach((error, index) => {
            console.log(`      ${index + 1}. ${error.field}: ${error.message}`);
        });
    }
}
```

---

## 📊 Scripts de Monitoreo

### 1. Monitor de Performance
```javascript
/**
 * Monitor de performance y métricas de la API
 * Úsalo para recopilar estadísticas de rendimiento
 */

// Recopilar métricas básicas
const responseTime = pm.response.responseTime;
const responseSize = pm.response.responseSize;
const statusCode = pm.response.code;

// Obtener estadísticas existentes o inicializar
let performanceStats = pm.environment.get('performanceStats');
if (!performanceStats) {
    performanceStats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        totalResponseSize: 0,
        endpoints: {}
    };
} else {
    performanceStats = JSON.parse(performanceStats);
}

// Actualizar estadísticas generales
performanceStats.totalRequests++;
performanceStats.totalResponseTime += responseTime;
performanceStats.totalResponseSize += responseSize;

if (responseTime < performanceStats.minResponseTime) {
    performanceStats.minResponseTime = responseTime;
}

if (responseTime > performanceStats.maxResponseTime) {
    performanceStats.maxResponseTime = responseTime;
}

if (statusCode >= 200 && statusCode < 400) {
    performanceStats.successfulRequests++;
} else {
    performanceStats.failedRequests++;
}

// Estadísticas por endpoint
const requestUrl = pm.request.url.getPath();
const requestMethod = pm.request.method;
const endpointKey = `${requestMethod} ${requestUrl}`;

if (!performanceStats.endpoints[endpointKey]) {
    performanceStats.endpoints[endpointKey] = {
        calls: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        successes: 0,
        failures: 0
    };
}

const endpointStats = performanceStats.endpoints[endpointKey];
endpointStats.calls++;
endpointStats.totalTime += responseTime;

if (responseTime < endpointStats.minTime) {
    endpointStats.minTime = responseTime;
}

if (responseTime > endpointStats.maxTime) {
    endpointStats.maxTime = responseTime;
}

if (statusCode >= 200 && statusCode < 400) {
    endpointStats.successes++;
} else {
    endpointStats.failures++;
}

// Guardar estadísticas actualizadas
pm.environment.set('performanceStats', JSON.stringify(performanceStats));

// Calcular métricas promedio
const avgResponseTime = performanceStats.totalResponseTime / performanceStats.totalRequests;
const successRate = (performanceStats.successfulRequests / performanceStats.totalRequests) * 100;

// Logging de métricas actuales
console.log('📊 Métricas de Performance:');
console.log(`   📈 Requests totales: ${performanceStats.totalRequests}`);
console.log(`   ✅ Tasa de éxito: ${successRate.toFixed(2)}%`);
console.log(`   ⏱️  Tiempo promedio: ${avgResponseTime.toFixed(2)}ms`);
console.log(`   🏃 Tiempo mínimo: ${performanceStats.minResponseTime}ms`);
console.log(`   🐌 Tiempo máximo: ${performanceStats.maxResponseTime}ms`);
console.log(`   📦 Request actual: ${responseTime}ms, ${responseSize} bytes`);

// Alertas de performance
if (responseTime > 3000) {
    console.log('🔴 ALERTA: Tiempo de respuesta alto (>3s)');
}

if (successRate < 95 && performanceStats.totalRequests > 5) {
    console.log('🟡 ADVERTENCIA: Tasa de éxito baja (<95%)');
}
```

### 2. Monitor de Recursos y Estado
```javascript
/**
 * Monitor del estado de recursos y dependencias
 * Rastrea la disponibilidad y estado de recursos críticos
 */

const jsonData = pm.response.json();
const requestUrl = pm.request.url.toString().toLowerCase();

// Monitor de estado de la API
if (requestUrl.includes('/health') || requestUrl.includes('/api') && pm.request.method === 'GET') {
    let apiHealthStats = pm.environment.get('apiHealthStats');
    if (!apiHealthStats) {
        apiHealthStats = {
            lastCheck: new Date().toISOString(),
            consecutiveSuccesses: 0,
            consecutiveFailures: 0,
            totalChecks: 0,
            uptime: 0
        };
    } else {
        apiHealthStats = JSON.parse(apiHealthStats);
    }
    
    apiHealthStats.totalChecks++;
    apiHealthStats.lastCheck = new Date().toISOString();
    
    if (pm.response.code === 200 && jsonData.success) {
        apiHealthStats.consecutiveSuccesses++;
        apiHealthStats.consecutiveFailures = 0;
        apiHealthStats.uptime++;
        
        console.log('💚 API Health: Saludable');
        console.log(`   🔄 Checks consecutivos exitosos: ${apiHealthStats.consecutiveSuccesses}`);
    } else {
        apiHealthStats.consecutiveFailures++;
        apiHealthStats.consecutiveSuccesses = 0;
        
        console.log('🔴 API Health: Problemas detectados');
        console.log(`   ❌ Fallos consecutivos: ${apiHealthStats.consecutiveFailures}`);
    }
    
    const uptimePercentage = (apiHealthStats.uptime / apiHealthStats.totalChecks) * 100;
    console.log(`   📊 Uptime: ${uptimePercentage.toFixed(2)}%`);
    
    pm.environment.set('apiHealthStats', JSON.stringify(apiHealthStats));
}

// Monitor de autenticación
if (requestUrl.includes('/auth/verify-token')) {
    const authMonitor = {
        lastTokenCheck: new Date().toISOString(),
        tokenValid: pm.response.code === 200 && jsonData.success
    };
    
    pm.environment.set('authMonitor', JSON.stringify(authMonitor));
    
    if (authMonitor.tokenValid) {
        console.log('🔐 Token: Válido y activo');
    } else {
        console.log('🔴 Token: Inválido o expirado');
    }
}

// Monitor de recursos (conteo de entidades)
let resourceMonitor = pm.environment.get('resourceMonitor');
if (!resourceMonitor) {
    resourceMonitor = {
        users: { count: 0, lastUpdate: null },
        categories: { count: 0, lastUpdate: null },
        subcategories: { count: 0, lastUpdate: null },
        products: { count: 0, lastUpdate: null }
    };
} else {
    resourceMonitor = JSON.parse(resourceMonitor);
}

// Actualizar contadores según el endpoint
if (requestUrl.includes('/users') && pm.request.method === 'GET' && !requestUrl.includes('/stats')) {
    if (jsonData.users) {
        resourceMonitor.users.count = jsonData.users.length;
        resourceMonitor.users.lastUpdate = new Date().toISOString();
        console.log(`👥 Usuarios registrados: ${jsonData.users.length}`);
    }
}

if (requestUrl.includes('/categories') && pm.request.method === 'GET') {
    if (jsonData.categories) {
        resourceMonitor.categories.count = jsonData.categories.length;
        resourceMonitor.categories.lastUpdate = new Date().toISOString();
        console.log(`📂 Categorías disponibles: ${jsonData.categories.length}`);
    }
}

if (requestUrl.includes('/subcategories') && pm.request.method === 'GET') {
    if (jsonData.subcategories) {
        resourceMonitor.subcategories.count = jsonData.subcategories.length;
        resourceMonitor.subcategories.lastUpdate = new Date().toISOString();
        console.log(`📁 Subcategorías disponibles: ${jsonData.subcategories.length}`);
    }
}

if (requestUrl.includes('/products') && pm.request.method === 'GET') {
    if (jsonData.products) {
        resourceMonitor.products.count = jsonData.products.length;
        resourceMonitor.products.lastUpdate = new Date().toISOString();
        console.log(`📦 Productos disponibles: ${jsonData.products.length}`);
    }
}

pm.environment.set('resourceMonitor', JSON.stringify(resourceMonitor));
```

---

## 🔧 Utilidades Avanzadas

### 1. Generador de Reportes
```javascript
/**
 * Generador de reportes consolidados
 * Ejecuta al final de una serie de pruebas para obtener un resumen completo
 */

function generateComprehensiveReport() {
    console.log('\n📋 ============= REPORTE CONSOLIDADO =============');
    
    // Reporte de Performance
    const performanceStats = JSON.parse(pm.environment.get('performanceStats') || '{}');
    if (performanceStats.totalRequests) {
        console.log('\n📊 MÉTRICAS DE PERFORMANCE:');
        console.log(`   Total de requests: ${performanceStats.totalRequests}`);
        console.log(`   Requests exitosas: ${performanceStats.successfulRequests}`);
        console.log(`   Requests fallidas: ${performanceStats.failedRequests}`);
        console.log(`   Tasa de éxito: ${((performanceStats.successfulRequests / performanceStats.totalRequests) * 100).toFixed(2)}%`);
        console.log(`   Tiempo promedio: ${(performanceStats.totalResponseTime / performanceStats.totalRequests).toFixed(2)}ms`);
        console.log(`   Tiempo mínimo: ${performanceStats.minResponseTime}ms`);
        console.log(`   Tiempo máximo: ${performanceStats.maxResponseTime}ms`);
        
        // Top 5 endpoints más lentos
        console.log('\n🐌 TOP 5 ENDPOINTS MÁS LENTOS:');
        const sortedEndpoints = Object.entries(performanceStats.endpoints)
            .map(([endpoint, stats]) => ({
                endpoint,
                avgTime: stats.totalTime / stats.calls
            }))
            .sort((a, b) => b.avgTime - a.avgTime)
            .slice(0, 5);
            
        sortedEndpoints.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.endpoint}: ${item.avgTime.toFixed(2)}ms`);
        });
    }
    
    // Reporte de Recursos
    const resourceMonitor = JSON.parse(pm.environment.get('resourceMonitor') || '{}');
    console.log('\n📦 ESTADO DE RECURSOS:');
    console.log(`   👥 Usuarios: ${resourceMonitor.users?.count || 'N/A'}`);
    console.log(`   📂 Categorías: ${resourceMonitor.categories?.count || 'N/A'}`);
    console.log(`   📁 Subcategorías: ${resourceMonitor.subcategories?.count || 'N/A'}`);
    console.log(`   📱 Productos: ${resourceMonitor.products?.count || 'N/A'}`);
    
    // Reporte de Autenticación
    const authMonitor = JSON.parse(pm.environment.get('authMonitor') || '{}');
    const tokenStatus = pm.environment.get('authToken') ? 'Activo' : 'Inactivo';
    console.log('\n🔐 ESTADO DE AUTENTICACIÓN:');
    console.log(`   Token: ${tokenStatus}`);
    console.log(`   Usuario logueado: ${pm.environment.get('userId') ? 'Sí' : 'No'}`);
    console.log(`   Rol actual: ${pm.environment.get('userRole') || 'N/A'}`);
    
    // Reporte de Salud de la API
    const apiHealthStats = JSON.parse(pm.environment.get('apiHealthStats') || '{}');
    if (apiHealthStats.totalChecks) {
        const uptime = (apiHealthStats.uptime / apiHealthStats.totalChecks) * 100;
        console.log('\n💚 SALUD DE LA API:');
        console.log(`   Uptime: ${uptime.toFixed(2)}%`);
        console.log(`   Último check: ${apiHealthStats.lastCheck}`);
        console.log(`   Checks totales: ${apiHealthStats.totalChecks}`);
    }
    
    // Variables de entorno importantes
    console.log('\n🔧 VARIABLES DE ENTORNO ACTIVAS:');
    const importantVars = [
        'baseUrl', 'authToken', 'userId', 'userRole',
        'testCategoryId', 'testSubcategoryId', 'testProductId'
    ];
    
    importantVars.forEach(varName => {
        const value = pm.environment.get(varName);
        if (value) {
            const displayValue = varName === 'authToken' ? 
                `${value.substring(0, 20)}...` : value;
            console.log(`   ${varName}: ${displayValue}`);
        }
    });
    
    console.log('\n✅ =============== FIN REPORTE ===============\n');
}

// Ejecutar el reporte
generateComprehensiveReport();
```

### 2. Limpiador de Environment
```javascript
/**
 * Script para limpiar selectivamente variables de entorno
 * Útil para resetear el estado entre diferentes series de pruebas
 */

function cleanEnvironment(options = {}) {
    const {
        keepAuth = false,
        keepTestData = false,
        keepStats = false,
        keepMonitoring = false
    } = options;
    
    console.log('🧹 Iniciando limpieza de environment...');
    
    // Variables de autenticación
    if (!keepAuth) {
        pm.environment.unset('authToken');
        pm.environment.unset('tokenExpiry');
        pm.environment.unset('userInfo');
        pm.environment.unset('userId');
        pm.environment.unset('userRole');
        console.log('   🔐 Variables de autenticación limpiadas');
    }
    
    // Variables de datos de prueba
    if (!keepTestData) {
        pm.environment.unset('testUserId');
        pm.environment.unset('testCategoryId');
        pm.environment.unset('testSubcategoryId');
        pm.environment.unset('testProductId');
        pm.environment.unset('lastCreatedUserEmail');
        pm.environment.unset('lastCreatedCategoryName');
        pm.environment.unset('lastCreatedCategorySlug');
        pm.environment.unset('lastCreatedSubcategoryName');
        pm.environment.unset('lastCreatedProductName');
        pm.environment.unset('lastCreatedProductSKU');
        console.log('   📦 Variables de datos de prueba limpiadas');
    }
    
    // Variables de estadísticas
    if (!keepStats) {
        pm.environment.unset('performanceStats');
        console.log('   📊 Variables de estadísticas limpiadas');
    }
    
    // Variables de monitoreo
    if (!keepMonitoring) {
        pm.environment.unset('apiHealthStats');
        pm.environment.unset('authMonitor');
        pm.environment.unset('resourceMonitor');
        console.log('   📡 Variables de monitoreo limpiadas');
    }
    
    // Variables de datos aleatorios
    pm.environment.unset('randomUsername');
    pm.environment.unset('randomEmail');
    pm.environment.unset('randomPhone');
    pm.environment.unset('randomSKU');
    pm.environment.unset('randomPrice');
    pm.environment.unset('randomStock');
    pm.environment.unset('randomCategoryName');
    pm.environment.unset('randomCategoryColor');
    pm.environment.unset('productIndex');
    pm.environment.unset('retryCount');
    console.log('   🎲 Variables de datos aleatorios limpiadas');
    
    console.log('✅ Limpieza de environment completada');
}

// Ejemplos de uso:
// cleanEnvironment(); // Limpia todo
// cleanEnvironment({ keepAuth: true }); // Mantiene autenticación
// cleanEnvironment({ keepAuth: true, keepStats: true }); // Mantiene auth y stats

// Limpieza completa por defecto
cleanEnvironment();
```

### 3. Validador de Esquemas JSON
```javascript
/**
 * Validador de esquemas JSON para respuestas de la API
 * Asegura que las respuestas cumplan con la estructura esperada
 */

function validateJsonSchema(jsonData, expectedSchema) {
    function validateProperty(obj, schema, path = '') {
        for (const [key, rules] of Object.entries(schema)) {
            const fullPath = path ? `${path}.${key}` : key;
            
            if (rules.required && !obj.hasOwnProperty(key)) {
                throw new Error(`Campo requerido faltante: ${fullPath}`);
            }
            
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                if (rules.type) {
                    const actualType = Array.isArray(value) ? 'array' : typeof value;
                    if (actualType !== rules.type) {
                        throw new Error(`Tipo incorrecto en ${fullPath}: esperado ${rules.type}, recibido ${actualType}`);
                    }
                }
                
                if (rules.type === 'string' && rules.minLength && value.length < rules.minLength) {
                    throw new Error(`String muy corto en ${fullPath}: mínimo ${rules.minLength} caracteres`);
                }
                
                if (rules.type === 'string' && rules.pattern && !rules.pattern.test(value)) {
                    throw new Error(`Patrón inválido en ${fullPath}`);
                }
                
                if (rules.type === 'number' && rules.min !== undefined && value < rules.min) {
                    throw new Error(`Número muy pequeño en ${fullPath}: mínimo ${rules.min}`);
                }
                
                if (rules.type === 'array' && rules.minItems && value.length < rules.minItems) {
                    throw new Error(`Array muy pequeño en ${fullPath}: mínimo ${rules.minItems} elementos`);
                }
                
                if (rules.properties && rules.type === 'object') {
                    validateProperty(value, rules.properties, fullPath);
                }
                
                if (rules.items && rules.type === 'array') {
                    value.forEach((item, index) => {
                        validateProperty(item, rules.items, `${fullPath}[${index}]`);
                    });
                }
            }
        }
    }
    
    try {
        validateProperty(jsonData, expectedSchema);
        return { valid: true, errors: [] };
    } catch (error) {
        return { valid: false, errors: [error.message] };
    }
}

// Esquemas para diferentes tipos de respuesta
const schemas = {
    login: {
        success: { type: 'boolean', required: true },
        message: { type: 'string', required: true },
        token: { type: 'string', required: true, minLength: 20 },
        user: {
            type: 'object',
            required: true,
            properties: {
                _id: { type: 'string', required: true },
                username: { type: 'string', required: true },
                email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                role: { type: 'string', required: true }
            }
        }
    },
    
    category: {
        success: { type: 'boolean', required: true },
        message: { type: 'string', required: true },
        category: {
            type: 'object',
            required: true,
            properties: {
                _id: { type: 'string', required: true },
                name: { type: 'string', required: true, minLength: 1 },
                description: { type: 'string', required: true },
                slug: { type: 'string', required: true, pattern: /^[a-z0-9-]+$/ },
                isActive: { type: 'boolean', required: true }
            }
        }
    },
    
    product: {
        success: { type: 'boolean', required: true },
        message: { type: 'string', required: true },
        product: {
            type: 'object',
            required: true,
            properties: {
                _id: { type: 'string', required: true },
                name: { type: 'string', required: true, minLength: 1 },
                sku: { type: 'string', required: true, minLength: 3 },
                price: { type: 'number', required: true, min: 0 },
                category: { type: 'string', required: true },
                subcategory: { type: 'string', required: true },
                isActive: { type: 'boolean', required: true }
            }
        }
    },
    
    productList: {
        success: { type: 'boolean', required: true },
        products: {
            type: 'array',
            required: true,
            items: {
                _id: { type: 'string', required: true },
                name: { type: 'string', required: true },
                price: { type: 'number', required: true }
            }
        }
    }
};

// Detectar tipo de respuesta y validar
const jsonData = pm.response.json();
const requestUrl = pm.request.url.toString().toLowerCase();
const requestMethod = pm.request.method;

let schemaToUse = null;

if (requestUrl.includes('/auth/login') && requestMethod === 'POST') {
    schemaToUse = schemas.login;
} else if (requestUrl.includes('/categories') && requestMethod === 'POST') {
    schemaToUse = schemas.category;
} else if (requestUrl.includes('/products') && requestMethod === 'POST') {
    schemaToUse = schemas.product;
} else if (requestUrl.includes('/products') && requestMethod === 'GET') {
    schemaToUse = schemas.productList;
}

if (schemaToUse && pm.response.code >= 200 && pm.response.code < 300) {
    const validation = validateJsonSchema(jsonData, schemaToUse);
    
    pm.test("Response matches expected schema", function () {
        pm.expect(validation.valid).to.be.true;
    });
    
    if (validation.valid) {
        console.log('✅ Esquema JSON válido');
    } else {
        console.log('❌ Errores en esquema JSON:');
        validation.errors.forEach(error => {
            console.log(`   - ${error}`);
        });
    }
}
```

---

## 🎯 Instrucciones de Uso

### Aplicar Scripts a Nivel de Colección
1. **Clic derecho** en la colección "API Móvil - Gestión de Productos"
2. **"Edit"**
3. **Ir a la pestaña "Pre-request Script"** o **"Tests"**
4. **Copiar y pegar** el script deseado
5. **"Update"**

### Aplicar Scripts a Requests Específicas
1. **Seleccionar** la request específica
2. **Ir a la pestaña "Pre-request Script"** o **"Tests"**
3. **Copiar y pegar** el script deseado
4. **"Save"**

### Personalizar Scripts
- **Modificar configuraciones** en las variables al inicio de cada script
- **Añadir validaciones específicas** según tus necesidades
- **Combinar múltiples scripts** para funcionalidad completa

### Monitoreo Continuo
- Los scripts de monitoreo mantienen estadísticas entre requests
- **Usar el generador de reportes** al final de las pruebas
- **Limpiar environment** entre series de pruebas diferentes

---

¡Estos scripts avanzados te darán un control completo sobre tus pruebas de API en Postman! 🚀
