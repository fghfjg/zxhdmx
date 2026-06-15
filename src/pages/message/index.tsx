import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Input, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useGame } from '@/store/gameStore';
import { Message } from '@/types/message';
import MessageItem from '@/components/MessageItem';
import styles from './index.module.scss';

const MessagePage: React.FC = () => {
  const router = useRouter();
  const { currentPlayer, messages, addMessage } = useGame();
  const [roomId, setRoomId] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    const { roomId: roomIdParam } = router.params;
    if (roomIdParam) {
      setRoomId(roomIdParam);
      loadMessages(roomIdParam);
    }
  }, []);

  useEffect(() => {
    // 新消息时滚动到底部
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = 999999;
    }
  }, [messages]);

  const loadMessages = async (roomId: string) => {
    try {
      setLoading(true);
      console.log('[Message] 加载留言', roomId);
      
      // 这里应该从云数据库加载消息
      // 暂时使用模拟数据
      const mockMessages: Message[] = [
        {
          id: '1',
          roomId,
          senderId: 'mock_sender_1',
          senderName: '玩家1',
          avatarUrl: 'https://picsum.photos/id/91/200/200',
          content: '大家好！',
          timestamp: Date.now() - 60000,
        },
        {
          id: '2',
          roomId,
          senderId: 'mock_sender_2',
          senderName: '玩家2',
          avatarUrl: 'https://picsum.photos/id/177/200/200',
          content: '欢迎来到房间！',
          timestamp: Date.now() - 30000,
        },
      ];
      
      // 模拟加载到store
      mockMessages.forEach(msg => addMessage(msg));
      
      console.log('[Message] 留言加载成功', mockMessages);
    } catch (error) {
      console.error('[Message] 加载留言失败', error);
      Taro.showToast({
        title: '加载失败，请重试',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) {
      Taro.showToast({
        title: '请输入内容',
        icon: 'none',
      });
      return;
    }

    if (!currentPlayer) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
      });
      return;
    }

    try {
      console.log('[Message] 发送留言', inputText);

      const newMessage: Message = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roomId,
        senderId: currentPlayer.openId,
        senderName: currentPlayer.nickName,
        avatarUrl: currentPlayer.avatarUrl,
        content: inputText.trim(),
        timestamp: Date.now(),
      };

      addMessage(newMessage);
      setInputText('');

      // 这里应该调用云函数保存到数据库
      // 并进行敏感词过滤

      console.log('[Message] 留言发送成功', newMessage);
    } catch (error) {
      console.error('[Message] 发送留言失败', error);
      Taro.showToast({
        title: '发送失败，请重试',
        icon: 'none',
      });
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  if (loading) {
    return (
      <View className={styles.messageContainer}>
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.messageContainer}>
      <ScrollView
        className={styles.messageList}
        scrollY
        ref={scrollViewRef}
        scrollTop={999999}
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.senderId === currentPlayer?.openId}
            />
          ))
        ) : (
          <View className={styles.emptyMessages}>
            <Text className={styles.emptyText}>暂无留言，快来聊天吧！</Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.inputSection}>
        <Input
          className={styles.inputField}
          type="text"
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          placeholder="输入消息..."
          onConfirm={handleSend}
          maxlength={200}
        />
        <Button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          发送
        </Button>
      </View>
    </View>
  );
};

export default MessagePage;