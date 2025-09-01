import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    Modal,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Category } from '../types';
import { colors, spacing, typography, borderRadius, layout, globalStyles, componentsStyles } from '../styles';

const CategoriesScreen: React.FC = () => {
  // Autenticación y permisos
  const { canEdit, canDelete } = useAuth();

  // Estados de los componentes
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, []);

  // Función para cargar categorías desde la API
  const loadCategories = async () => {
    try {
      const response = await apiService.get<Category[]>('/categories');
      if (response.success && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.warn('Error cargando categorías:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Manejar actualización manual
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCategories();
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setIsModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    if (!canEdit()) {
      Alert.alert('Sin permisos', 'No tienes permisos para editar categorías');
      return;
    }
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      description: category.description || ''
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    try {
      setIsLoading(true);
      if (editingCategory) {
        // Actualizar categoría existente
        const response = await apiService.put(`/categories/${editingCategory._id}`, formData);
        if (response.success) {
          Alert.alert('Éxito', 'Categoría actualizada correctamente');
          closeModal();
          loadCategories();
        }
      } else {
        // Crear nueva categoría
        const response = await apiService.post('/categories', formData);
        if (response.success) {
          Alert.alert('Éxito', 'Categoría creada correctamente');
          closeModal();
          loadCategories();
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al guardar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (category: Category) => {
    if (!canDelete()) {
      Alert.alert('Sin permisos', 'No tienes permisos para eliminar categorías');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro que deseas eliminar la categoría "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => performDelete(category._id),
        },
      ]
    );
  };

  const performDelete = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.delete(`/categories/${categoryId}`);
      if (response.success) {
        Alert.alert('Éxito', 'Categoría eliminada correctamente');
        loadCategories();
      }
    } catch (error: any) {
      if (__DEV__) {
        console.log('Error en eliminación', error);
      }
      // Manejo específico para el error de subcategorías asociadas
      const errorMessage = error.message || '';
      if (errorMessage.includes('subcategorias asociadas') ||
          errorMessage.includes('tiene subcategorias') ||
          errorMessage.includes('subcategories associated') ||
          errorMessage.toLowerCase().includes('subcategorias asociadas')) {
        Alert.alert(
          'No se puede eliminar la categoría',
          'Esta categoría tiene subcategorías asociadas.\n\nPara eliminarla, primero debes:\n\n• Eliminar todas las subcategorías de esta categoría, o\n• Cambiar las subcategorías a otra categoría\n\nLuego podrás eliminar esta categoría.',
          [{ text: 'Entendido', style: 'default' }]
        );
      } else {
        Alert.alert('Error', errorMessage || 'Error al eliminar la categoría');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para activar o desactivar categoría
  const handleToggleStatus = (category: Category) => {
    const isActive = (category as any).isActive !== false; // Default true si no existe
    const action = isActive ? 'Desactivar' : 'Activar';
    const warningMessage = isActive 
      ? 'Al desactivar esta categoría, también se desactivarán todas las subcategorías y productos asociados'
      : 'Al activar esta categoría, podrás gestionar sus subcategorías y productos nuevamente';

    Alert.alert(
      `${action} Categoría`,
      `¿Estás seguro de que deseas ${action.toLowerCase()} la categoría "${category.name}"?\n\n${warningMessage}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action,
          style: isActive ? 'destructive' : 'default',
          onPress: () => performToggleStatus(category._id),
        }
      ]
    );
  };

  const performToggleStatus = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.patch(`/categories/${categoryId}/toggle-status`);
      if (response.success) {
        Alert.alert('Éxito', response.message || 'Estado de la categoría actualizado correctamente');
        loadCategories();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cambiar el estado de la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  // Componente para renderizar cada categoría
  const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
    const isActive = (category as any).isActive !== false; // Default true si no existe
    
    console.log('Category data:', {
      name: category.name,
      isActive: isActive,
      canEdit: canEdit()
    });

    return (
      <View style={[
        styles.categoryCard,
        !isActive && styles.categoryCardInactive
      ]}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.categoryName,
                !isActive && styles.categoryNameInactive
              ]}>
                {category.name}
              </Text>
              <View style={[
                styles.statusBadge,
                isActive ? styles.statusBadgeActive : styles.statusBadgeInactive
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  isActive ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive
                ]}>
                  {isActive ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
            </View>
            {category.description && (
              <Text style={[
                styles.categoryDescription,
                !isActive && styles.categoryDescriptionInactive
              ]}>
                {category.description}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.categoryActions}>
          {canEdit() && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openEditModal(category)}
            >
              <Ionicons name="pencil" size={16} color={colors.surface} />
            </TouchableOpacity>
          )}
          
          {canEdit() && (
            <TouchableOpacity 
              style={[styles.actionButton, isActive ? styles.deactivateButton : styles.activateButton]}
              onPress={() => handleToggleStatus(category)}
            >
              <Ionicons 
                name={isActive ? "pause" : "play"} 
                size={16} 
                color={colors.surface} 
              />
            </TouchableOpacity>
          )}
          
          {canDelete() && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(category)}
            >
              <Ionicons name="trash" size={16} color={colors.surface} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Categorías</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Lista de categorías */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        >
          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No hay categorías</Text>
              <Text style={styles.emptySubtext}>Toca el botón + para crear una</Text>
            </View>
          ) : (
            categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))
          )}
        </ScrollView>
      )}

      {/* Modal para crear/editar categoría */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Ingresa el nombre de la categoría"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Descripción opcional"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContainer: {
    flex: 1,
  },
  listContainer: {
    padding: spacing.md,
    flexGrow: 1,
  },  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...layout.shadow.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  categoryCardInactive: {
    backgroundColor: colors.background,
    borderLeftColor: colors.textSecondary,
    opacity: 0.7,
  },
  categoryHeader: {
    flex: 1,
  },
  categoryInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  categoryNameInactive: {
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  statusBadgeActive: {
    backgroundColor: colors.success + '20',
  },
  statusBadgeInactive: {
    backgroundColor: colors.textSecondary + '20',
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  statusBadgeTextActive: {
    color: colors.success,
  },
  statusBadgeTextInactive: {
    color: colors.textSecondary,
  },
  categoryDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  categoryDescriptionInactive: {
    color: colors.textLight,
  },
  categoryActions: {
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
  activateButton: {
    backgroundColor: colors.success,
  },
  deactivateButton: {
    backgroundColor: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 300,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxWidth: 400,
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
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
});

export default CategoriesScreen;
