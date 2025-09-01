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
import { Product, Category, Subcategory } from '../types';
import { colors, spacing, typography, borderRadius, layout, globalStyles } from '../styles';

const ProductsScreen: React.FC = () => {
  // Autenticación y permisos
  const { canEdit, canDelete } = useAuth();

  // Estados de los componentes
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Estados para el modal de crear/editar
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [productName, setProductName] = React.useState<string>('');
  const [productDescription, setProductDescription] = React.useState<string>('');
  const [productPrice, setProductPrice] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<string>('');  // Estados adicionales para los selectores
  const [categoryPickerVisible, setCategoryPickerVisible] = React.useState<boolean>(false);
  const [subcategoryPickerVisible, setSubcategoryPickerVisible] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // Cargar datos al montar el componente
  React.useEffect(() => {
    loadInitialData();
  }, []);

  // Función para cargar todos los datos necesarios
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [productsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
        apiService.get('/productos'),
        apiService.get('/categories'),
        apiService.get('/subcategories')
      ]);

      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
      setSubcategories(subcategoriesResponse.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
      Alert.alert('Error', 'No se pudieron cargar los productos');
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
    setEditingProduct(null);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setModalVisible(true);
  };

  // Función para abrir modal de editar
  const handleEdit = (product: Product) => {
    if (!canEdit()) {
      Alert.alert('Sin permisos', 'No tienes permisos para editar productos');
      return;
    }
    setEditingProduct(product);
    setProductName(product.name || '');
    setProductDescription(product.description || '');
    setProductPrice(product.price?.toString() || '');
    setSelectedCategory(typeof product.category === 'string' ? product.category : product.category._id);
    setSelectedSubcategory(typeof product.subcategory === 'string' ? product.subcategory || '' : product.subcategory?._id || '');
    setModalVisible(true);
  };

  // Función para guardar (crear o editar)
  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }

    if (!productPrice.trim() || isNaN(Number(productPrice))) {
      Alert.alert('Error', 'El precio debe ser un número válido');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Debe seleccionar una categoría');
      return;
    }

    try {
      setIsSaving(true);
      const productData = {
        name: productName.trim(),
        description: productDescription.trim(),
        price: Number(productPrice),
        category: selectedCategory,
        subcategory: selectedSubcategory || undefined,
      };

      if (editingProduct) {
        // Editar producto existente
        await apiService.put(`/productos/${editingProduct._id}`, productData);
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        await apiService.post('/productos', productData);
        Alert.alert('Éxito', 'Producto creado correctamente');
      }

      setModalVisible(false);
      await loadInitialData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setIsSaving(false);
    }
  };

  // Función para eliminar
  const handleDelete = (product: Product) => {
    if (!canDelete()) {
      Alert.alert('Sin permisos', 'No tienes permisos para eliminar productos');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar el producto "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.delete(`/productos/${product._id}`);
              Alert.alert('Éxito', 'Producto eliminado correctamente');
              await loadInitialData();
            } catch (error: any) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', error.response?.data?.message || 'Error al eliminar el producto');
            }
          }
        }
      ]
    );
  };

  // Función para formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Función para obtener nombre de categoría
  const getCategoryName = (categoryId: string | Category) => {
    if (typeof categoryId === 'object') return categoryId.name;
    const category = categories.find(cat => cat._id === categoryId);
    return category?.name || 'Sin categoría';
  };

  // Función para obtener nombre de subcategoría
  const getSubcategoryName = (subcategoryId?: string | Subcategory) => {
    if (!subcategoryId) return '';
    if (typeof subcategoryId === 'object') return subcategoryId.name;
    const subcategory = subcategories.find(sub => sub._id === subcategoryId);
    return subcategory?.name || '';
  };
  // Filtrar subcategorías por categoría seleccionada
  const filteredSubcategories = subcategories.filter(sub => 
    typeof sub.category === 'string' ? sub.category === selectedCategory : sub.category._id === selectedCategory
  );

  // Función para obtener el nombre de la categoría seleccionada
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return 'Seleccionar categoría';
    const category = categories.find(cat => cat._id === selectedCategory);
    return category?.name || 'Categoría no encontrada';
  };

  // Función para obtener el nombre de la subcategoría seleccionada
  const getSelectedSubcategoryName = () => {
    if (!selectedSubcategory) return 'Seleccionar subcategoría (opcional)';
    const subcategory = subcategories.find(sub => sub._id === selectedSubcategory);
    return subcategory?.name || 'Subcategoría no encontrada';
  };

  // Función para seleccionar categoría
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(''); // Reset subcategory when category changes
    setCategoryPickerVisible(false);
  };

  // Función para seleccionar subcategoría
  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSubcategoryPickerVisible(false);
  };

  // Renderizar item de producto
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.productDescription}>{item.description}</Text>
        )}
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.productCategory}>
            📁 {getCategoryName(item.category)}
          </Text>
          {item.subcategory && (
            <Text style={styles.productSubcategory}>
              📂 {getSubcategoryName(item.subcategory)}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.productActions}>
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
        <Text style={styles.headerTitle}>Gestión de Productos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          renderItem={renderProductItem}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No hay productos</Text>
              <Text style={styles.emptySubtext}>Toca el botón + para crear uno</Text>
            </View>
          }
        />
      )}

      {/* Modal para crear/editar producto */}
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
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
                  value={productName}
                  onChangeText={setProductName}
                  placeholder="Ingresa el nombre del producto"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={productDescription}
                  onChangeText={setProductDescription}
                  placeholder="Descripción opcional"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Precio *</Text>
                <TextInput
                  style={styles.textInput}
                  value={productPrice}
                  onChangeText={setProductPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subcategoría</Text>
                <TouchableOpacity 
                  style={[styles.selectorButton, !selectedCategory && styles.disabledSelector]}
                  onPress={() => selectedCategory && setSubcategoryPickerVisible(true)}
                  disabled={!selectedCategory}
                >
                  <Text style={[styles.selectorText, !selectedSubcategory && styles.placeholderText]}>
                    {getSelectedSubcategoryName()}
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
                    {editingProduct ? 'Actualizar' : 'Crear'}
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

      {/* Modal para seleccionar subcategoría */}
      <Modal
        visible={subcategoryPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSubcategoryPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Seleccionar Subcategoría</Text>
              <TouchableOpacity onPress={() => setSubcategoryPickerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  !selectedSubcategory && styles.selectedPickerItem
                ]}
                onPress={() => handleSubcategorySelect('')}
              >
                <Text style={[
                  styles.pickerItemText,
                  !selectedSubcategory && styles.selectedPickerItemText
                ]}>
                  Sin subcategoría
                </Text>
                {!selectedSubcategory && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
              {filteredSubcategories.map((subcategory) => (
                <TouchableOpacity
                  key={subcategory._id}
                  style={[
                    styles.pickerItem,
                    selectedSubcategory === subcategory._id && styles.selectedPickerItem
                  ]}
                  onPress={() => handleSubcategorySelect(subcategory._id)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    selectedSubcategory === subcategory._id && styles.selectedPickerItemText
                  ]}>
                    {subcategory.name}
                  </Text>
                  {selectedSubcategory === subcategory._id && (
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
  },
  addButton: {    backgroundColor: colors.primaryDark,
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
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...layout.shadow.medium,
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  productName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  productPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  productMeta: {
    gap: spacing.xs,
  },
  productCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  productSubcategory: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
  },
  productActions: {
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
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,    width: '90%',
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
    maxHeight: 400,
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
  },  disabledSelector: {
    backgroundColor: colors.textLight,
    opacity: 0.6,
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

export default ProductsScreen;
