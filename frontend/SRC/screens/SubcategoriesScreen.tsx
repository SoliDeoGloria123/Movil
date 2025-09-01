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
import { Subcategory, Category } from '../types';
import { colors, spacing, typography, borderRadius, layout, globalStyles } from '../styles';

const SubcategoriesScreen: React.FC = () => {
  // Autenticación y permisos
  const { canEdit, canDelete } = useAuth();

  // Estados de los componentes
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Estados para el modal de crear/editar
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [editingSubcategory, setEditingSubcategory] = React.useState<Subcategory | null>(null);
  const [subcategoryName, setSubcategoryName] = React.useState<string>('');
  const [subcategoryDescription, setSubcategoryDescription] = React.useState<string>('');  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // Estados adicionales para los selectores
  const [categoryPickerVisible, setCategoryPickerVisible] = React.useState<boolean>(false);

  // Cargar datos al montar el componente
  React.useEffect(() => {
    loadInitialData();
  }, []);

  // Función para cargar todos los datos necesarios
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [subcategoriesResponse, categoriesResponse] = await Promise.all([
        apiService.get('/subcategories'),
        apiService.get('/categories')
      ]);

      setSubcategories(subcategoriesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
      Alert.alert('Error', 'No se pudieron cargar las subcategorías');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  };

  // Función para abrir modal de crear
  const handleCreate = () => {
    setEditingSubcategory(null);
    setSubcategoryName('');
    setSubcategoryDescription('');
    setSelectedCategory('');
    setModalVisible(true);
  };

  // Función para abrir modal de editar
  const handleEdit = (subcategory: Subcategory) => {
    if (!canEdit()) {
      Alert.alert('Sin permisos', 'No tienes permisos para editar subcategorías');
      return;
    }
    setEditingSubcategory(subcategory);
    setSubcategoryName(subcategory.name || '');
    setSubcategoryDescription(subcategory.description || '');
    setSelectedCategory(typeof subcategory.category === 'string' ? subcategory.category : subcategory.category._id);
    setModalVisible(true);
  };

  // Función para guardar (crear o editar)
  const handleSave = async () => {
    if (!subcategoryName.trim()) {
      Alert.alert('Error', 'El nombre de la subcategoría es obligatorio');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Debe seleccionar una categoría');
      return;
    }

    try {
      setIsSaving(true);
      const subcategoryData = {
        name: subcategoryName.trim(),
        description: subcategoryDescription.trim(),
        category: selectedCategory,
      };

      if (editingSubcategory) {
        // Editar subcategoría existente
        await apiService.put(`/subcategories/${editingSubcategory._id}`, subcategoryData);
        Alert.alert('Éxito', 'Subcategoría actualizada correctamente');
      } else {
        // Crear nueva subcategoría
        await apiService.post('/subcategories', subcategoryData);
        Alert.alert('Éxito', 'Subcategoría creada correctamente');
      }

      setModalVisible(false);
      await loadInitialData();
    } catch (error: any) {
      console.error('Error saving subcategory:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar la subcategoría');
    } finally {
      setIsSaving(false);
    }
  };

  // Función para eliminar
  const handleDelete = (subcategory: Subcategory) => {
    if (!canDelete()) {
      Alert.alert('Sin permisos', 'No tienes permisos para eliminar subcategorías');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la subcategoría "${subcategory.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.delete(`/subcategories/${subcategory._id}`);
              Alert.alert('Éxito', 'Subcategoría eliminada correctamente');
              await loadInitialData();
            } catch (error: any) {
              console.error('Error deleting subcategory:', error);
              Alert.alert('Error', error.response?.data?.message || 'Error al eliminar la subcategoría');
            }
          }
        }
      ]
    );
  };
  // Función para obtener nombre de categoría
  const getCategoryName = (categoryId: string | Category) => {
    if (typeof categoryId === 'object') return categoryId.name;
    const category = categories.find(cat => cat._id === categoryId);
    return category?.name || 'Sin categoría';
  };

  // Función para obtener el nombre de la categoría seleccionada
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return 'Seleccionar categoría';
    const category = categories.find(cat => cat._id === selectedCategory);
    return category?.name || 'Categoría no encontrada';
  };

  // Función para seleccionar categoría
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCategoryPickerVisible(false);
  };

  // Renderizar item de subcategoría
  const renderSubcategoryItem = ({ item }: { item: Subcategory }) => (
    <View style={styles.subcategoryCard}>
      <View style={styles.subcategoryInfo}>
        <Text style={styles.subcategoryName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.subcategoryDescription}>{item.description}</Text>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            📁 {getCategoryName(item.category)}
          </Text>
        </View>
      </View>
      <View style={styles.subcategoryActions}>
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

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Subcategorías</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Lista de subcategorías */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando subcategorías...</Text>
        </View>
      ) : (
        <FlatList
          data={subcategories}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          renderItem={renderSubcategoryItem}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="albums-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No hay subcategorías</Text>
              <Text style={styles.emptySubtext}>Toca el botón + para crear una</Text>
            </View>
          }
        />
      )}

      {/* Modal para crear/editar subcategoría */}
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
                {editingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre *</Text>
                <TextInput
                  style={styles.textInput}
                  value={subcategoryName}
                  onChangeText={setSubcategoryName}
                  placeholder="Ingresa el nombre de la subcategoría"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={subcategoryDescription}
                  onChangeText={setSubcategoryDescription}
                  placeholder="Descripción opcional"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Categoría *</Text>
                <TouchableOpacity 
                  style={styles.selectorButton}
                  onPress={() => setCategoryPickerVisible(true)}
                >
                  <Text style={[styles.selectorText, !selectedCategory && styles.placeholderText]}>
                    {getSelectedCategoryName()}
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
                    {editingSubcategory ? 'Actualizar' : 'Crear'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>        </View>
      </Modal>

      {/* Modal para seleccionar categoría */}
      <Modal
        visible={categoryPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Seleccionar Categoría</Text>
              <TouchableOpacity onPress={() => setCategoryPickerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.pickerItem,
                    selectedCategory === category._id && styles.selectedPickerItem
                  ]}
                  onPress={() => handleCategorySelect(category._id)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    selectedCategory === category._id && styles.selectedPickerItemText
                  ]}>
                    {category.name}
                  </Text>
                  {selectedCategory === category._id && (
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
  subcategoryCard: {
    backgroundColor: colors.surface,    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...layout.shadow.medium,
  },
  subcategoryInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  subcategoryName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subcategoryDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  subcategoryActions: {
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
  },  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  placeholderText: {
    color: colors.textSecondary,
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

export default SubcategoriesScreen;
