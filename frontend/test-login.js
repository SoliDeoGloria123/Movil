// Script de prueba para verificar el login
const API_BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
    try {
        console.log('🧪 Probando login...');
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },            body: JSON.stringify({
                username: 'admin@ejemplo.com',
                password: 'admin123'
            }),
        });

        const data = await response.json();
        console.log('📊 Respuesta del servidor:', data);
        
        if (data.success) {
            console.log('✅ Login exitoso');
            console.log('👤 Usuario:', data.user);
            console.log('🔑 Token:', data.token ? 'Presente' : 'Ausente');
        } else {
            console.log('❌ Login falló:', data.message);
        }
        
        return data;
    } catch (error) {
        console.error('💥 Error:', error);
        return null;
    }
}

// Ejecutar la prueba
testLogin();
