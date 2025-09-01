// Tipos para la navegación de la aplicación

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Subcategories: undefined;
  Products: undefined;
  Users: undefined;
  Profile: undefined;
};

// Tipos adicionales para navegación anidada
export type CategoryStackParamList = {
  CategoryList: undefined;
  CategoryDetail: { categoryId: string };
  CreateCategory: undefined;
  EditCategory: { categoryId: string };
};

export type ProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
  CreateProduct: undefined;
  EditProduct: { productId: string };
};

export type UserStackParamList = {
  UserList: undefined;
  UserDetail: { userId: string };
  CreateUser: undefined;
  EditUser: { userId: string };
};
