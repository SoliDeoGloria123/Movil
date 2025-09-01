import React from 'react';
import { 
    View, 
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    FlatList,
    Modal,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { User } from '../types';
import { colors, spacing, typography, borderRadius, layout, globalStyles } from '../styles';

const UsersScreen: React.FC = () => {
  // Autenticación y permisos
  const { hasRole, canEdit, canDelete } = useAuth();

  // Estados de los componentes
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Estados para el modal de crear/editar
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [username, setUsername] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');  const [role, setRole] = React.useState<'admin' | 'coordinador' | 'user'>('user');
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // Estados adicionales para los selectores
  const [rolePickerVisible, setRolePickerVisible] = React.useState<boolean>(false);

  // Verificar permisos de admin
  React.useEffect(() => {
    if (!hasRole('admin')) {
      Alert.alert(
        'Acceso denegado',
        'Solo los administradores pueden acceder a la gestión de usuarios',
        [{ text: 'OK', onPress: () => {/* navegar atrás */} }]
      );
      return;
    }
    loadUsers();
  }, []);

  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get('/users');
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setError('Error al cargar los usuarios');
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUsers();
    setIsRefreshing(false);
  };

  // Función para abrir modal de crear
  const handleCreate = () => {
    setEditingUser(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('user');
    setModalVisible(true);
  };

  // Función para abrir modal de editar
  const handleEdit = (user: User) => {
    if (!canEdit()) {
      Alert.alert('Sin permisos', 'No tienes permisos para editar usuarios');
      return;
    }
    setEditingUser(user);
    setUsername(user.username || '');
    setEmail(user.email || '');
    setPassword(''); // No mostramos la contraseña actual
    setRole(user.role);
    setModalVisible(true);
  };

  // Función para validar formulario
  const validateForm = (): boolean => {
    if (!username.trim()) {
      Alert.alert('Error', 'El nombre de usuario es obligatorio');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'El email es obligatorio');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'El email debe tener un formato válido');
      return false;
    }

    if (!editingUser && !password.trim()) {
      Alert.alert('Error', 'La contraseña es obligatoria para nuevos usuarios');
      return false;
    }

    if (password.trim() && password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  // Función para guardar (crear o editar)
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const userData: any = {
        username: username.trim(),
        email: email.trim(),
        role: role,
      };

      // Solo incluir contraseña si se proporciona
      if (password.trim()) {
        userData.password = password.trim();
      }

      if (editingUser) {
        // Editar usuario existente
        await apiService.put(`/users/${editingUser._id}`, userData);
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        await apiService.post('/users', userData);
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }

      setModalVisible(false);
      await loadUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar el usuario');
    } finally {
      setIsSaving(false);
    }
  };

  // Función para eliminar
  const handleDelete = (user: User) => {
    if (!canDelete()) {
      Alert.alert('Sin permisos', 'No tienes permisos para eliminar usuarios');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar el usuario "${user.username}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.delete(`/users/${user._id}`);
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
              await loadUsers();
            } catch (error: any) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', error.response?.data?.message || 'Error al eliminar el usuario');
            }
          }
        }
      ]
    );
  };

  // Función para obtener el color del rol
  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return colors.error;
      case 'coordinador':
        return colors.warning;
      default:
        return colors.info;
    }
  };
  // Función para obtener el texto del rol
  const getRoleText = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return 'Administrador';
      case 'coordinador':
        return 'Coordinador';
      default:
        return 'Usuario';
    }
  };

  // Función para obtener el texto del rol seleccionado
  const getSelectedRoleText = () => {
    return getRoleText(role);
  };

  // Función para seleccionar rol
  const handleRoleSelect = (selectedRole: 'admin' | 'coordinador' | 'user') => {
    setRole(selectedRole);
    setRolePickerVisible(false);
  };

  // Lista de roles disponibles
  const availableRoles: Array<{value: 'admin' | 'coordinador' | 'user', label: string}> = [
    { value: 'user', label: 'Usuario' },
    { value: 'coordinador', label: 'Coordinador' },
    { value: 'admin', label: 'Administrador' },
  ];

  // Renderizar item de usuario
  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
          <Text style={[styles.roleBadgeText, { color: getRoleColor(item.role) }]}>
            {getRoleText(item.role)}
          </Text>
        </View>        <Text style={styles.userDate}>
          Creado: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'No disponible'}
        </Text>
      </View>
      <View style={styles.userActions}>
        {canEdit() && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={16} color={colors.surface} />
          </TouchableOpacity>
        )}
        {canDelete() && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={16} color={colors.surface} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Si no es admin, mostrar mensaje de acceso denegado
  if (!hasRole('admin')) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Ionicons name="shield-outline" size={64} color={colors.error} />
        <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
        <Text style={styles.accessDeniedText}>
          Solo los administradores pueden acceder a la gestión de usuarios
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Lista de usuarios */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          renderItem={renderUserItem}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No hay usuarios</Text>
              <Text style={styles.emptySubtext}>Toca el botón + para crear uno</Text>
            </View>
          }
        />
      )}

      {/* Modal para crear/editar usuario */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre de usuario *</Text>
                <TextInput
                  style={styles.textInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Ingresa el nombre de usuario"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="usuario@ejemplo.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Contraseña {editingUser ? '(dejar vacío para mantener actual)' : '*'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rol *</Text>
                <TouchableOpacity 
                  style={styles.selectorButton}
                  onPress={() => setRolePickerVisible(true)}
                >
                  <Text style={styles.selectorText}>
                    {getSelectedRoleText()}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingUser ? 'Actualizar' : 'Crear'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>        </View>
      </Modal>

      {/* Modal para seleccionar rol */}
      <Modal
        visible={rolePickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRolePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Seleccionar Rol</Text>
              <TouchableOpacity onPress={() => setRolePickerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {availableRoles.map((roleOption) => (
                <TouchableOpacity
                  key={roleOption.value}
                  style={[
                    styles.pickerItem,
                    role === roleOption.value && styles.selectedPickerItem
                  ]}
                  onPress={() => handleRoleSelect(roleOption.value)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    role === roleOption.value && styles.selectedPickerItemText
                  ]}>
                    {roleOption.label}
                  </Text>
                  {role === roleOption.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },  addButton: {
    backgroundColor: colors.primaryDark,
    padding: spacing.sm,
    borderRadius: borderRadius.round,
    ...layout.shadow.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: spacing.md,
    flexGrow: 1,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...layout.shadow.medium,
  },
  userInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  roleBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  userDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },  actionButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    ...layout.shadow.small,
  },
  editButton: {
    backgroundColor: colors.warning,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  accessDeniedTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  accessDeniedText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    ...layout.shadow.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  selectorButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    flex: 1,
  },
  pickerModalContent: {    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '60%',
    ...layout.shadow.large,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedPickerItem: {
    backgroundColor: colors.primaryLight,
  },
  pickerItemText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    flex: 1,
  },
  selectedPickerItemText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  modalButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.surface,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.surface,
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    color: colors.surface,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
});

export default UsersScreen;
