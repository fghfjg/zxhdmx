import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getLeaderboard, getPersonalBest, getStatistics } from '@/utils/cloud';
import styles from './index.module.scss';

interface ScoreItem {
  rank: number;
  playerName: string;
  playerAvatar: string;
  score: number;
  gameMode: string;
}

const LeaderboardPage: React.FC = () => {
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [statistics, setStatistics] = useState({ totalGames: 0, highestScore: 0, topPlayer: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行获取排行榜、个人最高分和统计数据
      const [leaderboardResult, personalResult, statsResult] = await Promise.all([
        getLeaderboard(10),
        getPersonalBest(),
        getStatistics()
      ]);

      if (leaderboardResult.success && leaderboardResult.scores) {
        setScores(leaderboardResult.scores);
      }

      if (personalResult.success) {
        setPersonalBest(personalResult.bestScore || 0);
      }

      if (statsResult.success) {
        setStatistics({
          totalGames: statsResult.totalGames || 0,
          highestScore: statsResult.highestScore || 0,
          topPlayer: statsResult.topPlayer || '暂无'
        });
      }

      console.log('[Leaderboard] 数据加载完成');
    } catch (error) {
      console.error('[Leaderboard] 数据加载失败', error);
      Taro.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1: return styles.rankFirst;
      case 2: return styles.rankSecond;
      case 3: return styles.rankThird;
      default: return styles.rankOther;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  };

  if (loading) {
    return (
      <View className={styles.container}>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      {/* 顶部导航 */}
      <View className={styles.header}>
        <Button className={styles.backButton} onClick={handleBack}>
          ← 返回
        </Button>
        <Text className={styles.title}>排行榜</Text>
        <Button className={styles.refreshButton} onClick={handleRefresh}>
          刷新
        </Button>
      </View>

      {/* 统计卡片 */}
      <View className={styles.statsCard}>
        <View className={styles.statRow}>
          <View className={styles.statBox}>
            <Text className={styles.statNumber}>{statistics.totalGames}</Text>
            <Text className={styles.statLabel}>总游戏次数</Text>
          </View>
          <View className={styles.statBox}>
            <Text className={styles.statNumber}>{statistics.highestScore}</Text>
            <Text className={styles.statLabel}>最高分</Text>
          </View>
          <View className={styles.statBox}>
            <Text className={styles.statNumber}>{statistics.topPlayer}</Text>
            <Text className={styles.statLabel}>最高分玩家</Text>
          </View>
        </View>
      </View>

      {/* 个人最高分 */}
      <View className={styles.personalCard}>
        <Text className={styles.personalTitle}>🏆 我的最高分</Text>
        <Text className={styles.personalScore}>{personalBest}</Text>
      </View>

      {/* 排行榜列表 */}
      <View className={styles.leaderboardSection}>
        <Text className={styles.sectionTitle}>🏅 排行榜</Text>
        
        {scores.length > 0 ? (
          <View className={styles.scoreList}>
            {scores.map((item, index) => (
              <View key={index} className={styles.scoreItem}>
                <View className={`${styles.rank} ${getRankClass(item.rank)}`}>
                  <Text>{getRankIcon(item.rank)}</Text>
                </View>
                <Image
                  src={item.playerAvatar}
                  className={styles.avatar}
                  mode="aspectFill"
                />
                <View className={styles.info}>
                  <Text className={styles.name}>{item.playerName}</Text>
                  <Text className={styles.mode}>
                    {item.gameMode === 'truth' ? '真心话' : '大冒险'}
                  </Text>
                </View>
                <View className={styles.score}>
                  <Text className={styles.scoreNumber}>{item.score}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📊</Text>
            <Text className={styles.emptyText}>暂无排行数据</Text>
            <Text className={styles.emptyHint}>快去玩游戏，登上排行榜吧！</Text>
          </View>
        )}
      </View>

      {/* 底部按钮 */}
      <View className={styles.bottomActions}>
        <Button className={styles.actionButton} onClick={() => {
          Taro.switchTab({ url: '/pages/home/index' });
        }}>
          🎮 开始游戏
        </Button>
      </View>
    </View>
  );
};

export default LeaderboardPage;