import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useGame } from '@/store/gameStore';
import styles from './index.module.scss';

const ResultPage: React.FC = () => {
  const router = useRouter();
  const { currentRoom, challenges } = useGame();
  const [loading, setLoading] = useState(false);
  const [courageRank, setCourageRank] = useState<any[]>([]);
  const [popularRank, setPopularRank] = useState<any[]>([]);

  useEffect(() => {
    const { roomId } = router.params;
    if (roomId && currentRoom) {
      calculateRanks();
    }
  }, [currentRoom, challenges]);

  const calculateRanks = () => {
    if (!currentRoom) return;

    console.log('[Result] 计算排行榜', currentRoom.players, challenges);

    // 计算勇气排行榜（按挑战完成数）
    const courageData = currentRoom.players
      .map(player => ({
        ...player,
        challengeCount: challenges.filter(
          c => c.playerId === player.openId && c.completed
        ).length,
      }))
      .sort((a, b) => b.challengeCount - a.challengeCount);

    setCourageRank(courageData);

    // 计算受欢迎排行榜（按收到表情数）
    const popularData = currentRoom.players
      .map(player => {
        const receivedReactions = challenges.flatMap(c =>
          c.reactions.filter(r => r.playerId === player.openId)
        );
        return {
          ...player,
          reactionCount: receivedReactions.length,
        };
      })
      .sort((a, b) => b.reactionCount - a.reactionCount);

    setPopularRank(popularData);

    console.log('[Result] 排行榜计算完成', { courageData, popularData });
  };

  const getRankClass = (index: number) => {
    switch (index) {
      case 0:
        return styles.rankFirst;
      case 1:
        return styles.rankSecond;
      case 2:
        return styles.rankThird;
      default:
        return styles.rankOther;
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleHome = () => {
    Taro.switchTab({
      url: '/pages/home/index',
    });
  };

  if (loading) {
    return (
      <View className={styles.resultContainer}>
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!currentRoom) {
    return (
      <View className={styles.resultContainer}>
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>房间数据加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.resultContainer}>
      <View className={styles.overviewCard}>
        <Text className={styles.overviewTitle}>游戏总览</Text>
        <View className={styles.overviewStats}>
          <View className={styles.overviewStat}>
            <Text className={styles.overviewValue}>
              {currentRoom.gameStats.totalChallenges}
            </Text>
            <Text className={styles.overviewLabel}>总挑战</Text>
          </View>
          <View className={styles.overviewStat}>
            <Text className={styles.overviewValue}>
              {currentRoom.gameStats.truthCount}
            </Text>
            <Text className={styles.overviewLabel}>真心话</Text>
          </View>
          <View className={styles.overviewStat}>
            <Text className={styles.overviewValue}>
              {currentRoom.gameStats.dareCount}
            </Text>
            <Text className={styles.overviewLabel}>大冒险</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>🏆 勇气排行榜</Text>
      {courageRank.length > 0 ? (
        <View className={styles.rankList}>
          {courageRank.map((player, index) => (
            <View key={player.openId} className={styles.rankItem}>
              <View className={`${styles.rankNumber} ${getRankClass(index)}`}>
                <Text>{index + 1}</Text>
              </View>
              <Image
                src={player.avatarUrl}
                className={styles.rankAvatar}
                mode="aspectFill"
              />
              <View className={styles.rankInfo}>
                <Text className={styles.rankName}>{player.nickName}</Text>
                <Text className={styles.rankValue}>
                  {player.isOwner ? '房主' : '玩家'}
                </Text>
              </View>
              <View className={styles.rankStat}>
                <Text>{player.challengeCount}次</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyRank}>
          <Text>暂无数据</Text>
        </View>
      )}

      <Text className={styles.sectionTitle}>❤️ 受欢迎榜</Text>
      {popularRank.length > 0 ? (
        <View className={styles.rankList}>
          {popularRank.map((player, index) => (
            <View key={player.openId} className={styles.rankItem}>
              <View className={`${styles.rankNumber} ${getRankClass(index)}`}>
                <Text>{index + 1}</Text>
              </View>
              <Image
                src={player.avatarUrl}
                className={styles.rankAvatar}
                mode="aspectFill"
              />
              <View className={styles.rankInfo}>
                <Text className={styles.rankName}>{player.nickName}</Text>
                <Text className={styles.rankValue}>
                  {player.isOwner ? '房主' : '玩家'}
                </Text>
              </View>
              <View className={styles.rankStat}>
                <Text>{player.reactionCount}❤️</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyRank}>
          <Text>暂无数据</Text>
        </View>
      )}

      <View className={styles.actions}>
        <Button
          className={`${styles.actionButton} ${styles.buttonBack}`}
          onClick={handleBack}
        >
          返回房间
        </Button>
        <Button
          className={`${styles.actionButton} ${styles.buttonHome}`}
          onClick={handleHome}
        >
          回到首页
        </Button>
      </View>
    </View>
  );
};

export default ResultPage;