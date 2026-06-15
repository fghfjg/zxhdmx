import React, { useState, useEffect } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { RoomHistory } from '@/types/message';
import { generateRoomId, getOpenId, getUserInfo } from '@/utils/cloud';
import { useGame } from '@/store/gameStore';
import CustomModal from '@/components/CustomModal';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { setCurrentRoom, setCurrentPlayer } = useGame();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [historyList, setHistoryList] = useState<RoomHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const history = Taro.getStorageSync('roomHistory') || [];
      setHistoryList(history);
      console.log('[Home] 加载历史记录', history);
    } catch (error) {
      console.error('[Home] 加载历史记录失败', error);
    }
  };

  const saveToHistory = (roomId: string, status: 'waiting' | 'playing' | 'ended') => {
    try {
      const history: RoomHistory = {
        roomId,
        roomName: `房间 ${roomId}`,
        playerCount: 1,
        joinTime: Date.now(),
        status,
      };
      
      const existingHistory = Taro.getStorageSync('roomHistory') || [];
      const newHistory = [history, ...existingHistory].slice(0, 10); // 只保留最近10条
      Taro.setStorageSync('roomHistory', newHistory);
      loadHistory();
    } catch (error) {
      console.error('[Home] 保存历史记录失败', error);
    }
  };

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      console.log('[Home] 开始创建房间');
      
      const openId = await getOpenId();
      const roomId = generateRoomId();
      
      // 获取用户信息（使用封装的函数，支持H5预览）
      const userInfo = await getUserInfo();
      
      const currentPlayer = {
        openId,
        nickName: userInfo.nickName || '玩家',
        avatarUrl: userInfo.avatarUrl || 'https://picsum.photos/id/64/200/200',
        roomId,
        challengeCount: 0,
        reactionReceived: 0,
        isOwner: true,
        joinTime: Date.now(),
      };
      
      const newRoom = {
        roomId,
        ownerId: openId,
        ownerName: currentPlayer.nickName,
        players: [currentPlayer],
        status: 'waiting' as const,
        gameStats: {
          totalChallenges: 0,
          truthCount: 0,
          dareCount: 0,
          mostActivePlayer: currentPlayer.nickName,
        },
        createTime: Date.now(),
      };
      
      setCurrentRoom(newRoom);
      setCurrentPlayer(currentPlayer);
      saveToHistory(roomId, 'waiting');
      
      Taro.showToast({
        title: '房间创建成功',
        icon: 'success',
      });
      
      Taro.navigateTo({
        url: `/pages/room/index?roomId=${roomId}`,
      });
      
      console.log('[Home] 房间创建成功', roomId);
    } catch (error) {
      console.error('[Home] 创建房间失败', error);
      Taro.showToast({
        title: '创建失败，请重试',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    setShowJoinModal(true);
  };

  const handleConfirmJoin = async () => {
    if (!roomIdInput || roomIdInput.length !== 6) {
      Taro.showToast({
        title: '请输入6位房间号',
        icon: 'none',
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log('[Home] 开始加入房间', roomIdInput);
      
      const openId = await getOpenId();
      
      // 获取用户信息（使用封装的函数，支持H5预览）
      const userInfo = await getUserInfo();
      
      const currentPlayer = {
        openId,
        nickName: userInfo.nickName || '玩家',
        avatarUrl: userInfo.avatarUrl || 'https://picsum.photos/id/64/200/200',
        roomId: roomIdInput,
        challengeCount: 0,
        reactionReceived: 0,
        isOwner: false,
        joinTime: Date.now(),
      };
      
      setCurrentPlayer(currentPlayer);
      saveToHistory(roomIdInput, 'waiting');
      
      Taro.showToast({
        title: '加入房间成功',
        icon: 'success',
      });
      
      Taro.navigateTo({
        url: `/pages/room/index?roomId=${roomIdInput}`,
      });
      
      setShowJoinModal(false);
      setRoomIdInput('');
      
      console.log('[Home] 加入房间成功', roomIdInput);
    } catch (error) {
      console.error('[Home] 加入房间失败', error);
      Taro.showToast({
        title: '加入失败，请重试',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJoin = () => {
    setShowJoinModal(false);
    setRoomIdInput('');
  };

  const handleHistoryClick = (roomId: string) => {
    Taro.navigateTo({
      url: `/pages/room/index?roomId=${roomId}`,
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
    return `${Math.floor(minutes / 1440)}天前`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return '等待中';
      case 'playing':
        return '游戏中';
      case 'ended':
        return '已结束';
      default:
        return '未知';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'waiting':
        return styles.statusWaiting;
      case 'playing':
        return styles.statusPlaying;
      case 'ended':
        return styles.statusEnded;
      default:
        return styles.statusEnded;
    }
  };

  return (
    <View className={styles.homeContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>真心话大冒险</Text>
        <Text className={styles.subtitle}>和朋友一起玩更有趣</Text>
      </View>
      
      <View className={styles.content}>
        <View className={styles.actionButtons}>
          <Button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleCreateRoom}
            disabled={loading}
          >
            创建房间
          </Button>
          <Button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleJoinRoom}
            disabled={loading}
          >
            加入房间
          </Button>
        </View>
        
        <View className={styles.historySection}>
          <Text className={styles.historyTitle}>历史记录</Text>
          {historyList.length > 0 ? (
            <View className={styles.historyList}>
              {historyList.map((item) => (
                <View
                  key={item.roomId}
                  className={styles.historyItem}
                  onClick={() => handleHistoryClick(item.roomId)}
                >
                  <View className={styles.historyInfo}>
                    <Text className={styles.historyRoomId}>{item.roomName}</Text>
                    <Text className={styles.historyTime}>{formatTime(item.joinTime)}</Text>
                  </View>
                  <View className={`${styles.historyStatus} ${getStatusClass(item.status)}`}>
                    <Text>{getStatusText(item.status)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyHistory}>
              <Text>暂无历史记录</Text>
            </View>
          )}
        </View>
      </View>
      
      <CustomModal
        visible={showJoinModal}
        title="加入房间"
        onClose={handleCancelJoin}
        onConfirm={handleConfirmJoin}
        confirmDisabled={loading}
        confirmText="确认加入"
      >
        <View className={styles.inputModal}>
          <Text className={styles.inputTitle}>请输入6位房间号</Text>
          <Input
            className={styles.inputField}
            type="number"
            maxlength={6}
            value={roomIdInput}
            onInput={(e) => setRoomIdInput(e.detail.value)}
            placeholder="000000"
          />
        </View>
      </CustomModal>
    </View>
  );
};

export default HomePage;