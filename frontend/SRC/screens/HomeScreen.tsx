import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
// Iconos vectoriales 
import { Ionicons } from '@expo/vector-icons';
// Importaciones de contextos y navegacion 
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
// Importaciones de servicios y estilos 
import { apiService } from '../services/api';
import { globalStyles, componentsStyles, colors, spacing } from '../styles';

// Interfaz de estadisticas del dashboard 
interface DashboardStats {
    totalUsers: number;
    totalCategories: number;
    totalSubcategories: number;
    totalProducts: number;
}

//Componente principal de la pantalla home 
const HomeScreen: React.FC = () => {
    const { user, logout, hasRole } = useAuth();
    const navigation = useNavigation();

    // Estado de las estadisticas 
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        totalProducts: 0,
    });

    // Estado de carga y refresh 
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);    // Efecto para cargar datos al montar el componente 
    useEffect(() => {
        loadDashboardData();
    }, []);

    // Obtiene las estadisticas de usuarios, categorias, subcategorias y productos 
    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            const promises = [];
            
            // Solo admin puede ver estadisticas de los usuarios 
            if (hasRole('admin')) {
                promises.push(apiService.get('/users'));
            }
            
            // Cargar datos principales de categorias, subcategorias y productos 
            promises.push(
                apiService.get('/categories'),
                apiService.get('/subcategories'),
                apiService.get('/productos'), // Corregido: usar /productos en lugar de /products
            );
            
            // Ejecutar todas las consultas en paralelo 
            const results = await Promise.all(promises);
            let userCount = 0;
            let resultIndex = 0;

            // Procesar resultado de los usuarios si es admin 
            if (hasRole('admin')) {
                const usersResponse = results[resultIndex];
                userCount = usersResponse.success && usersResponse.data && Array.isArray(usersResponse.data) 
                    ? usersResponse.data.length // Corregido: length en lugar de lenght
                    : 0;
                resultIndex++;
            }

            const categoriesResponse = results[resultIndex];
            const subcategoriesResponse = results[resultIndex + 1];
            const productsResponse = results[resultIndex + 2];

            setStats({
                totalUsers: userCount,
                totalCategories: categoriesResponse.success && categoriesResponse.data && Array.isArray(categoriesResponse.data) 
                    ? categoriesResponse.data.length // Corregido: length en lugar de lenght
                    : 0,
                totalSubcategories: subcategoriesResponse.success && subcategoriesResponse.data && Array.isArray(subcategoriesResponse.data) 
                    ? subcategoriesResponse.data.length // Corregido: length en lugar de lenght
                    : 0,
                totalProducts: productsResponse.success && productsResponse.data && Array.isArray(productsResponse.data) 
                    ? productsResponse.data.length // Corregido: length en lugar de lenght
                    : 0,
            });
        } catch (error) {
            console.warn('Error cargando estadísticas:', error);
            Alert.alert('Error', 'No se pudieron cargar las estadísticas');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };    // Función para refrescar datos
    const handleRefresh = () => {
        setIsRefreshing(true);
        loadDashboardData();
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión', 
            '¿Estás seguro que deseas cerrar sesión?', 
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Salir',
                    style: 'destructive',
                    onPress: logout
                }
            ]
        );
    };    // Componente para tarjetas de estadisticas 
    const StatCard: React.FC<{
        title: string;
        value: number;
        color: string;
        iconName: keyof typeof Ionicons.glyphMap;
    }> = ({ title, value, color, iconName }) => (
        <View style={[componentsStyles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                {/* Iconos vectoriales dinamicos */}
                <Ionicons name={iconName} size={24} color={color} style={{ marginRight: spacing.sm }} />
                <Text style={[globalStyles.body, { fontWeight: '600' }]}>{title}</Text>
            </View>
            <Text style={[globalStyles.header, { color, fontSize: 28 }]}>{value}</Text>
        </View>
    );

    // Botones interactivos
    const QuickActionButton: React.FC<{
        title: string;
        iconName: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
        color?: string;
    }> = ({ title, iconName, onPress, color = colors.primary }) => (
        <TouchableOpacity
            style={[componentsStyles.card, { borderColor: color, borderWidth: 1, flexDirection: 'row', alignItems: 'center' }]}
            onPress={onPress}
        >
            {/* Color personalizable segun el tipo de accion */}
            <Ionicons name={iconName} size={20} color={color} style={{ marginRight: spacing.md }} />
            <Text style={[globalStyles.body, { color, fontWeight: '500' }]}>{title}</Text>
        </TouchableOpacity>
    );if (isLoading) {
        return (
            <View style={globalStyles.centerContainer}>
                <Text style={globalStyles.body}>Cargando dashboard...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={globalStyles.container}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.primary]}
                />
            }
        >            {/* Header */}
            <View style={[componentsStyles.card, { marginBottom: spacing.md, padding: spacing.lg }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={[globalStyles.header, { marginBottom: 0 }]}>¡Hola!</Text>
                        <Text style={globalStyles.body}>
                            {user?.email || 'Usuario'}
                        </Text>
                        <Text style={[globalStyles.caption, { color: colors.primary }]}>
                            {user?.role === 'admin' ? 'Administrador' : 'Coordinador'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[componentsStyles.button, { backgroundColor: colors.error, padding: spacing.sm }]}
                        onPress={handleLogout}
                    >
                        <Text style={[componentsStyles.buttonText, { fontSize: 14 }]}>Salir</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Estadisticas */}
            <View style={{ marginBottom: spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.sm }}>
                    <Ionicons name="bar-chart" size={24} color={colors.primary} style={{ marginRight: spacing.sm }} />
                    <Text style={globalStyles.subheader}>Resumen</Text>
                </View>
                
                {hasRole('admin') && (
                    <StatCard
                        title="Usuarios"
                        value={stats.totalUsers}
                        color={colors.admin}
                        iconName="people"
                    />
                )}
                <StatCard
                    title="Categorias"
                    value={stats.totalCategories}
                    color={colors.secondary}
                    iconName="folder"
                />
                <StatCard
                    title="Subcategorias"
                    value={stats.totalSubcategories}
                    color={colors.coordinador}
                    iconName="albums"
                />
                <StatCard
                    title="Productos"
                    value={stats.totalProducts}
                    color={colors.accent}
                    iconName="cube"
                />
            </View>

            {/* Acciones rapidas */}
            <View style={{ marginBottom: spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.sm }}>
                    <Ionicons name="flash" size={24} color={colors.primary} style={{ marginRight: spacing.sm }} />
                    <Text style={globalStyles.subheader}>Acciones Rapidas</Text>
                </View>
                
                {hasRole('admin') && (
                    <QuickActionButton
                        title="Gestion Usuarios"
                        iconName="people"
                        onPress={() => navigation.navigate('Users' as never)}
                        color={colors.admin}
                    />
                )}
                <QuickActionButton
                    title="Ver Categorias"
                    iconName="folder"
                    onPress={() => navigation.navigate('Categories' as never)}
                    color={colors.secondary}
                />
                <QuickActionButton
                    title="Ver Subcategorias"
                    iconName="albums"
                    onPress={() => navigation.navigate('Subcategories' as never)}
                    color={colors.coordinador}
                />
                <QuickActionButton
                    title="Ver Productos"
                    iconName="cube"
                    onPress={() => navigation.navigate('Products' as never)}
                    color={colors.accent}
                />
            </View>

            {/* Informacion del sistema */}
            <View style={{ marginBottom: spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.sm }}>
                    <Ionicons name="information-circle" size={24} color={colors.primary} style={{ marginRight: spacing.sm }} />
                    <Text style={globalStyles.subheader}>Información</Text>
                </View>                <View style={componentsStyles.card}>
                    <Text style={globalStyles.body}>
                        Bienvenido al sistema de gestión. Aquí puedes administrar 
                        {hasRole('admin') ? ' usuarios, ' : ' '}categorías, subcategorías y productos.
                    </Text>
                    <Text style={[globalStyles.caption, { marginTop: spacing.sm }]}>
                        Desliza hacia abajo para actualizar los datos
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default HomeScreen;