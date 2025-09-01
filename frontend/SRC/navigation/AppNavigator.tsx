import React from "react";
import { Ionicons } from '@expo/vector-icons';

// Importar de react navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Importaciones de contextos y tipos
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList, MainTabParamList } from "../types/navigation";
import { colors, spacing, typography } from "../styles";
import { LoadingScreen } from "../components/LoadingScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import UsersScreen from "../screens/UsersScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import SubcategoriesScreen from "../screens/SubcategoriesScreen";
import ProductsScreen from "../screens/ProductsScreen";
import ProfileScreen from "../screens/ProfileScreen";

// Creacion de navegadores
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Navegador principal
const MainTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingBottom: spacing.sm,
                    paddingTop: spacing.sm,
                },
                tabBarLabelStyle: {
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                },
            }}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ 
                    title: 'Inicio', 
                    tabBarIcon: ({ focused, color, size }) => {
                        const iconName = focused ? 'home' : 'home-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } 
                }} 
            />
            <Tab.Screen 
                name="Categories" 
                component={CategoriesScreen} 
                options={{ 
                    title: 'Categorías', 
                    tabBarIcon: ({ focused, color, size }) => {
                        const iconName = focused ? 'list' : 'list-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } 
                }} 
            />
            <Tab.Screen 
                name="Subcategories" 
                component={SubcategoriesScreen} 
                options={{ 
                    title: 'Subcategorías', 
                    tabBarIcon: ({ focused, color, size }) => {
                        const iconName = focused ? 'layers' : 'layers-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } 
                }} 
            />
            <Tab.Screen 
                name="Products" 
                component={ProductsScreen} 
                options={{ 
                    title: 'Productos', 
                    tabBarIcon: ({ focused, color, size }) => {
                        const iconName = focused ? 'pricetag' : 'pricetag-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } 
                }} 
            />
            <Tab.Screen 
                name="Users" 
                component={UsersScreen} 
                options={{ 
                    title: 'Usuarios', 
                    tabBarIcon: ({ focused, color, size }) => {
                        const iconName = focused ? 'people' : 'people-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } 
                }} 
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ 
                    title: 'Perfil', 
                    tabBarIcon: ({ focused, color, size }) => {
                        const iconName = focused ? 'person' : 'person-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } 
                }} 
            />
        </Tab.Navigator>
    );
};

// Navegador principal de la aplicación
const AppNavigator: React.FC = () => {
    const { user, isLoading } = useAuth();

    console.log('AppNavigator render:', { user: user?.username, isLoading });

    // Mostrar pantalla de carga mientras se verifica la autenticación
    if (isLoading) {
        console.log('Mostrando LoadingScreen');
        return <LoadingScreen />;
    }

    console.log('Renderizando NavigationContainer', { authenticated: !!user });

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                {user ? (
                    // Usuario autenticado - mostrar pestañas principales
                    <Stack.Screen 
                        name="Main" 
                        component={MainTabNavigator} 
                    />
                ) : (
                    // Usuario no autenticado - mostrar login
                    <Stack.Screen 
                        name="Login" 
                        component={LoginScreen} 
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;