import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '@/context/ThemeContext';
import { useToast, Toast } from '@/context/ToastContext';

const { width: screenWidth } = Dimensions.get('window');

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { theme } = useTheme();

  const getToastColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: theme.cardBackground,
          borderColor: theme.green,
          iconColor: theme.green,
          iconName: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          backgroundColor: theme.cardBackground,
          borderColor: theme.red,
          iconColor: theme.red,
          iconName: 'close-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: theme.cardBackground,
          borderColor: theme.orange,
          iconColor: theme.orange,
          iconName: 'warning' as const,
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.cardBackground,
          borderColor: theme.blue,
          iconColor: theme.blue,
          iconName: 'information-circle' as const,
        };
    }
  };

  const colors = getToastColors();

  return (
    <MotiView
      from={{ opacity: 0, translateY: -50, scale: 0.9 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      exit={{ opacity: 0, translateY: -50, scale: 0.9 }}
      transition={{ type: 'spring', damping: 15, stiffness: 150 }}
      style={[
        styles.toastItem,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          shadowColor: colors.borderColor,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Ionicons 
          name={colors.iconName} 
          size={24} 
          color={colors.iconColor} 
          style={styles.toastIcon}
        />
        
        <View style={styles.toastText}>
          <Text style={[styles.toastTitle, { color: theme.textPrimary }]}>
            {toast.title}
          </Text>
          {toast.message && (
            <Text style={[styles.toastMessage, { color: theme.textSecondary }]}>
              {toast.message}
            </Text>
          )}
        </View>

        {toast.action && (
          <TouchableOpacity
            style={[styles.toastAction, { borderColor: colors.borderColor }]}
            onPress={toast.action.onPress}
          >
            <Text style={[styles.toastActionText, { color: colors.iconColor }]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => onDismiss(toast.id)}
        >
          <Ionicons name="close" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      <View style={styles.toastList}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={hideToast}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  toastList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  toastItem: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: screenWidth - 32,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  toastIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  toastText: {
    flex: 1,
    marginRight: 8,
  },
  toastTitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    lineHeight: 20,
  },
  toastAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginTop: 2,
  },
  toastActionText: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
  },
  dismissButton: {
    padding: 4,
    marginTop: -2,
  },
});
