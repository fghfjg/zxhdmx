import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

interface CustomModalProps {
  visible: boolean;
  title?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmText?: string;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  onClose,
  onConfirm,
  confirmDisabled = false,
  confirmText = '确认',
  children,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View className={styles.modalOverlay} onClick={onClose}>
      <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {title && (
          <View className={styles.modalHeader}>
            <Text className={styles.modalTitle}>{title}</Text>
          </View>
        )}
        <View className={styles.modalBody}>{children}</View>
        <View className={styles.modalFooter}>
          <Button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={onClose}>
            取消
          </Button>
          <Button
            className={`${styles.modalButton} ${styles.modalButtonConfirm}`}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmText}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default CustomModal;