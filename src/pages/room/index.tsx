import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useGame } from '@/store/gameStore';
import PlayerAvatar from '@/components/PlayerAvatar';
import styles from './index.module.scss';

const RoomPage: React.FC = () => {
  const router = useRouter();
  const { currentRoom, currentPlayer, setCurrentRoom } = useGame();
  const [roomId, setRoomId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { roomId: roomIdParam } = router.params;
    if (roomIdParam) {
      setRoomId(roomIdParam);
      loadRoomData(roomIdParam);
    }
  }, []);

  const loadRoomData = async (roomId: string) => {
    try {
      console.log('[Room] 加载房间数据', roomId);
      // 这里应该从云数据库加载房间数据
      // 暂时使用模拟数据
      const mockRoom = {
        roomId,
        ownerId: 'mock_owner_id',
        ownerName: '房主',
        players: [
          {
            openId: 'mock_owner_id',
            nickName: '房主',
            avatarUrl: 'https://picsum.photos/id/64/200/200',
            roomId,
            challengeCount: 0,
            reactionReceived: 0,
            isOwner: true,
            joinTime: Date.now(),
          },
        ],
        status: 'waiting' as const,
        gameStats: {
          totalChallenges: 0,
          truthCount: 0,
          dareCount: 0,
          mostActivePlayer: '房主',
        },
        createTime: Date.now(),
      };
      
      setCurrentRoom(mockRoom);
      console.log('[Room] 房间数据加载成功', mockRoom);
    } catch (error) {
      console.error('[Room] 加载房间数据失败', error);
      Taro.showToast({
        title: '加载失败，请重试',
        icon: 'none',
      });
    }
  };

  const handleTruth = () => {
    if (!currentRoom || currentRoom.status === 'ended') {
      Taro.showToast({
        title: '游戏已结束',
        icon: 'none',
      });
      return;
    }
    
    Taro.navigateTo({
      url: `/pages/game/index?type=truth&roomId=${roomId}`,
    });
  };

  const handleDare = () => {
    if (!currentRoom || currentRoom.status === 'ended') {
      Taro.showToast({
        title: '游戏已结束',
        icon: 'none',
      });
      return;
    }
    
    Taro.navigateTo({
      url: `/pages/game/index?type=dare&roomId=${roomId}`,
    });
  };

  const handleMessage = () => {
    Taro.navigateTo({
      url: `/pages/message/index?roomId=${roomId}`,
    });
  };

  const handleStartGame = async () => {
    if (!currentPlayer?.isOwner) {
      Taro.showToast({
        title: '只有房主可以开始游戏',
        icon: 'none',
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log('[Room] 开始游戏');
      
      // 更新房间状态为游戏中
      if (currentRoom) {
        const updatedRoom = {
          ...currentRoom,
          status: 'playing' as const,
        };
        setCurrentRoom(updatedRoom);
      }
      
      Taro.showToast({
        title: '游戏开始！',
        icon: 'success',
      });
    } catch (error) {
      console.error('[Room] 开始游戏失败', error);
      Taro.showToast({
        title: '开始失败，请重试',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndGame = async () => {
    if (!currentPlayer?.isOwner) {
      Taro.showToast({
        title: '只有房主可以结束游戏',
        icon: 'none',
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log('[Room] 结束游戏');
      
      // 更新房间状态为已结束
      if (currentRoom) {
        const updatedRoom = {
          ...currentRoom,
          status: 'ended' as const,
        };
        setCurrentRoom(updatedRoom);
      }
      
      Taro.showToast({
        title: '游戏已结束',
        icon: 'success',
      });
    } catch (error) {
      console.error('[Room] 结束游戏失败', error);
      Taro.showToast({
        title: '结束失败，请重试',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResult = () => {
    Taro.navigateTo({
      url: `/pages/result/index?roomId=${roomId}`,
    });
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

  if (!currentRoom) {
    return (
      <View className={styles.roomContainer}>
        <View style={{ textAlign: 'center', padding: '100rpx 0' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.roomContainer}>
      <View className={styles.roomInfo}>
        <Text className={styles.roomLabel}>房间号</Text>
        <Text className={styles.roomNumber}>{currentRoom.roomId}</Text>
        <View className={styles.roomStatus}>
          <Text>{getStatusText(currentRoom.status)}</Text>
        </View>
      </View>
      
      <View className={styles.playersSection}>
        <Text className={styles.sectionTitle}>在线玩家 ({currentRoom.players.length})</Text>
        {currentRoom.players.length > 0 ? (
          <ScrollView className={styles.playersList} scrollX>
            {currentRoom.players.map((player) => (
              <PlayerAvatar key={player.openId} player={player} />
            ))}
          </ScrollView>
        ) : (
          <View className={styles.emptyPlayers}>
            <Text>暂无玩家</Text>
          </View>
        )}
      </View>
      
      <View className={styles.statsSection}>
        <Text className={styles.sectionTitle}>游戏统计</Text>
        <View className={styles.statsCard}>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{currentRoom.gameStats.totalChallenges}</Text>
              <Text className={styles.statLabel}>总挑战</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{currentRoom.gameStats.truthCount}</Text>
              <Text className={styles.statLabel}>真心话</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{currentRoom.gameStats.dareCount}</Text>
              <Text className={styles.statLabel}>大冒险</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View className={styles.actionsSection}>
        <View className={styles.actionButtons}>
          <Button
            className={`${styles.actionButton} ${styles.buttonTruth}`}
            onClick={handleTruth}
            disabled={currentRoom.status === 'ended'}
          >
            <Text className={styles.buttonIcon}>💬</Text>
            <Text className={styles.buttonText}>真心话</Text>
          </Button>
          <Button
            className={`${styles.actionButton} ${styles.buttonDare}`}
            onClick={handleDare}
            disabled={currentRoom.status === 'ended'}
          >
            <Text className={styles.buttonIcon}>🎯</Text>
            <Text className={styles.buttonText}>大冒险</Text>
          </Button>
          <Button
            className={`${styles.actionButton} ${styles.buttonMessage}`}
            onClick={handleMessage}
          >
            <Text className={styles.buttonIcon}>💬</Text>
            <Text className={styles.buttonText}>留言板</Text>
          </Button>
        </View>
      </View>
      
      {currentPlayer?.isOwner && (
        <View className={styles.controlButtons}>
          {currentRoom.status === 'waiting' && (
            <Button
              className={`${styles.controlButton} ${styles.buttonStart}`}
              onClick={handleStartGame}
              disabled={loading}
            >
              开始游戏
            </Button>
          )}
          {currentRoom.status === 'playing' && (
            <Button
              className={`${styles.controlButton} ${styles.buttonEnd}`}
              onClick={handleEndGame}
              disabled={loading}
            >
              结束游戏
            </Button>
          )}
          <Button
            className={`${styles.controlButton} ${styles.buttonResult}`}
            onClick={handleResult}
          >
            查看结果
          </Button>
        </View>
      )}
    </View>
  );
};

export default RoomPage;