import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing, typography, layout } from './layout';

// 🌍 ESTILOS GLOBALES DE LA APLICACIÓN
export const globalStyles = StyleSheet.create({
  // 📱 CONTENEDORES PRINCIPALES
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // 📝 TIPOGRAFÍA
  header: {
    fontSize: typography.fontSize.titleLarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  subheader: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  body: {
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.normal,
  },
  
  caption: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
  },

  // 🏠 ESTILOS ESPECÍFICOS DEL HOME
  homeHeader: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  userWelcomeText: {
    fontSize: typography.fontSize.titleLarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },

  userName: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  userRole: {
    fontSize: typography.fontSize.small,
    color: colors.primary,
    textTransform: 'capitalize',
    marginTop: spacing.xs,
  },

  logoutButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: layout.borderRadius.medium,
  },

  logoutButtonText: {
    color: colors.surface,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
  },

  homeSection: {
    padding: spacing.lg,
  },

  homeStatsContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: layout.borderRadius.large,
  },

  homeSectionTitle: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },

  homeGrid: {
    marginTop: spacing.md,
  },

  homeCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.large,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  homeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  homeCardTitle: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  homeCardValue: {
    fontSize: typography.fontSize.titleLarge,
    fontWeight: typography.fontWeight.bold,
  },

  homeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.large,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  homeActionIcon: {
    marginRight: spacing.md,
  },

  homeActionTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },

  homeInfoCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: layout.borderRadius.large,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  homeInfoText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },

  // 📊 LOADING STATES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
  },
});

export default globalStyles;
