import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useGame } from '@/store/gameStore';
import { getRandomQuestion } from '@/data/questions';
import { getRandomTask } from '@/data/tasks';
import { Challenge, Reaction } from '@/types/game';
import ChallengeCard from '@/components/ChallengeCard';
import { saveScore } from '@/utils/cloud';
import styles from './index.module.scss';

const GamePage: React.FC = () => {
  const router = useRouter();
  const { currentPlayer, addChallenge, updateChallenge, challenges } = useGame();
  const [type, setType] = useState<'truth' | 'dare'>('truth');
  const [roomId, setRoomId] = useState<string>('');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(5);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const { type: typeParam, roomId: roomIdParam } = router.params;
    if (typeParam && roomIdParam) {
      setType(typeParam as 'truth' | 'dare');
      setRoomId(roomIdParam);
      generateChallenge(typeParam as 'truth' | 'dare');
    }
  }, []);

  const generateChallenge = (challengeType: 'truth' | 'dare') => {
    try {
      setLoading(true);
      setError('');
      console.log('[Game] 生成挑战', challengeType);

      let content = '';
      let baseScore = 0;
      
      if (challengeType === 'truth') {
        const question = getRandomQuestion();
        content = question.content;
        // 根据难度设置分数
        switch (question.difficulty) {
          case 'easy': baseScore = 10; break;
          case 'medium': baseScore = 20; break;
          case 'hard': baseScore = 30; break;
        }
      } else {
        const task = getRandomTask();
        content = task.content;
        switch (task.difficulty) {
          case 'easy': baseScore = 15; break;
          case 'medium': baseScore = 25; break;
          case 'hard': baseScore = 35; break;
        }
      }

      const newChallenge: Challenge = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: challengeType,
        content,
        playerId: currentPlayer?.openId || '',
        playerName: currentPlayer?.nickName || '玩家',
        completed: false,
        reactions: [],
        createTime: Date.now(),
      };

      setChallenge(newChallenge);
      setAnswer('');
      console.log('[Game] 挑战生成成功', newChallenge);
    } catch (error) {
      console.error('[Game] 生成挑战失败', error);
      setError('生成挑战失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    generateChallenge(type);
  };

  const handleComplete = async () => {
    if (!challenge || !currentPlayer) {
      return;
    }

    if (type === 'truth' && !answer.trim()) {
      Taro.showToast({
        title: '请输入回答',
        icon: 'none',
      });
      return;
    }

    try {
      setLoading(true);
      console.log('[Game] 完成挑战', challenge.id);

      // 计算本轮得分（基础分 + 反应加成）
      let roundScore = type === 'truth' ? 10 : 15;
      roundScore += challenge.reactions.length * 5; // 每个反应加5分

      const updatedChallenge: Challenge = {
        ...challenge,
        answer: type === 'truth' ? answer : undefined,
        completed: true,
        completeTime: Date.now(),
      };

      setChallenge(updatedChallenge);
      updateChallenge(challenge.id, updatedChallenge);
      addChallenge(updatedChallenge);

      // 更新分数
      const newScore = score + roundScore;
      setScore(newScore);

      Taro.showToast({
        title: `${type === 'truth' ? '回答提交成功' : '任务完成'} +${roundScore}分`,
        icon: 'success',
      });

      // 延迟进入下一轮或结束游戏
      setTimeout(() => {
        if (round >= maxRounds) {
          endGame(newScore);
        } else {
          // 切换类型
          const nextType = type === 'truth' ? 'dare' : 'truth';
          setType(nextType);
          setRound(round + 1);
          generateChallenge(nextType);
        }
      }, 1500);

    } catch (error) {
      console.error('[Game] 完成挑战失败', error);
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  const endGame = async (finalScore: number) => {
    try {
      setGameState('finished');
      console.log('[Game] 游戏结束，得分:', finalScore);

      // 保存分数到云数据库
      if (currentPlayer) {
        await saveScore(
          currentPlayer.nickName,
          currentPlayer.avatarUrl,
          finalScore,
          type,
          roomId
        );
        console.log('[Game] 分数已保存到云数据库');
      }

      setShowResult(true);
    } catch (error) {
      console.error('[Game] 保存分数失败', error);
    }
  };

  const handleReaction = async (reactionType: 'like' | 'laugh') => {
    if (!challenge || !currentPlayer) {
      return;
    }

    // 检查是否已经反应过
    const hasReacted = challenge.reactions.some(
      r => r.playerId === currentPlayer.openId && r.type === reactionType
    );

    if (hasReacted) {
      Taro.showToast({
        title: '你已经反应过了',
        icon: 'none',
      });
      return;
    }

    try {
      console.log('[Game] 添加表情反应', reactionType);

      const newReaction: Reaction = {
        playerId: currentPlayer.openId,
        playerName: currentPlayer.nickName,
        type: reactionType,
        createTime: Date.now(),
      };

      const updatedChallenge: Challenge = {
        ...challenge,
        reactions: [...challenge.reactions, newReaction],
      };

      setChallenge(updatedChallenge);
      updateChallenge(challenge.id, updatedChallenge);

      Taro.showToast({
        title: reactionType === 'like' ? '点赞成功' : '笑死',
        icon: 'success',
      });
    } catch (error) {
      console.error('[Game] 添加反应失败', error);
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

  const handleRestart = () => {
    setScore(0);
    setRound(1);
    setGameState('playing');
    setShowResult(false);
    generateChallenge('truth');
  };

  // 游戏结果页面
  if (showResult) {
    return (
      <View className={styles.resultContainer}>
        <View className={styles.resultContent}>
          <Text className={styles.resultTitle}>🎉 游戏结束</Text>
          <View className={styles.scoreDisplay}>
            <Text className={styles.scoreLabel}>最终得分</Text>
            <Text className={styles.scoreValue}>{score}</Text>
          </View>
          <View className={styles.stats}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{round}</Text>
              <Text className={styles.statLabel}>完成轮数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{challenges.length}</Text>
              <Text className={styles.statLabel}>完成挑战</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{roomId}</Text>
              <Text className={styles.statLabel}>房间号</Text>
            </View>
          </View>
          <Text className={styles.saveMessage}>✓ 分数已保存到云端</Text>
          <View className={styles.resultActions}>
            <Button className={`${styles.actionButton} ${styles.buttonPrimary}`} onClick={handleRestart}>
              再来一局
            </Button>
            <Button className={`${styles.actionButton} ${styles.buttonSecondary}`} onClick={handleHome}>
              返回首页
            </Button>
          </View>
        </View>
      </View>
    );
  }

  if (loading && !challenge) {
    return (
      <View className={styles.gameContainer}>
        <View className={styles.loadingContainer}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className={styles.gameContainer}>
        <View className={styles.errorContainer}>
          <Text className={styles.errorText}>{error}</Text>
          <Button className={styles.retryButton} onClick={handleRefresh}>
            重新生成
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.gameContainer}>
      {/* 顶部信息栏 */}
      <View className={styles.topBar}>
        <View className={styles.roundInfo}>
          <Text className={styles.roundLabel}>第 {round}/{maxRounds} 轮</Text>
        </View>
        <View className={styles.scoreInfo}>
          <Text className={styles.scoreLabel}>得分</Text>
          <Text className={styles.scoreNum}>{score}</Text>
        </View>
      </View>

      {currentPlayer && (
        <View className={styles.playerInfo}>
          <Image
            src={currentPlayer.avatarUrl}
            className={styles.playerAvatar}
            mode="aspectFill"
          />
          <View className={styles.playerDetails}>
            <Text className={styles.playerName}>{currentPlayer.nickName}</Text>
            <Text className={styles.challengeCount}>
              已完成 {currentPlayer.challengeCount} 次挑战
            </Text>
          </View>
        </View>
      )}

      {challenge && (
        <ChallengeCard
          challenge={challenge}
          showAnswer={type === 'truth'}
          answer={answer}
          onAnswerChange={setAnswer}
          onComplete={handleComplete}
          onRefresh={handleRefresh}
          onReaction={handleReaction}
          isOwner={challenge.playerId === currentPlayer?.openId}
        />
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

export default GamePage;