import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { Message } from '@/types/message';
import styles from './index.module.scss';

interface MessageItemProps {
  message: Message;
  isOwn?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn = false }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View className={`${styles.messageItem} ${isOwn ? styles.messageItemOwn : ''}`}>
      <Image
        src={message.avatarUrl}
        className={styles.messageAvatar}
        mode="aspectFill"
      />
      <View className={styles.messageContent}>
        <View className={styles.messageInfo}>
          <Text className={styles.messageName}>{message.senderName}</Text>
          <Text className={styles.messageTime}>{formatTime(message.timestamp)}</Text>
        </View>
        <View
          className={`${styles.messageBubble} ${
            isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther
          }`}
        >
          <Text>{message.content}</Text>
        </View>
      </View>
    </View>
  );
};

export default MessageItem;