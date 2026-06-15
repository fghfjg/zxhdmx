import React from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { Challenge } from '@/types/game';
import styles from './index.module.scss';

interface ChallengeCardProps {
  challenge: Challenge;
  showAnswer?: boolean;
  answer?: string;
  onAnswerChange?: (answer: string) => void;
  onComplete?: () => void;
  onRefresh?: () => void;
  onReaction?: (type: 'like' | 'laugh') => void;
  isOwner?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  showAnswer = false,
  answer = '',
  onAnswerChange,
  onComplete,
  onRefresh,
  onReaction,
  isOwner = false,
}) => {
  const getTypeText = () => {
    return challenge.type === 'truth' ? '真心话' : '大冒险';
  };

  const getTypeClass = () => {
    return challenge.type === 'truth' ? styles.typeTruth : styles.typeDare;
  };

  const getLikeCount = () => {
    return challenge.reactions.filter(r => r.type === 'like').length;
  };

  const getLaughCount = () => {
    return challenge.reactions.filter(r => r.type === 'laugh').length;
  };

  return (
    <View className={styles.challengeCard}>
      <View className={`${styles.challengeType} ${getTypeClass()}`}>
        <Text>{getTypeText()}</Text>
      </View>
      
      <Text className={styles.challengeContent}>{challenge.content}</Text>
      
      {showAnswer && challenge.type === 'truth' && (
        <Input
          className={styles.challengeAnswer}
          type="text"
          value={answer}
          onInput={(e) => onAnswerChange?.(e.detail.value)}
          placeholder="请输入你的回答..."
          disabled={!isOwner || challenge.completed}
        />
      )}
      
      {challenge.completed && (
        <View className={styles.completedBadge}>
          <Text>已完成</Text>
        </View>
      )}
      
      {!challenge.completed && isOwner && (
        <View style={{ display: 'flex', gap: '16rpx', marginTop: '24rpx' }}>
          <Button
            style={{
              flex: 1,
              height: '80rpx',
              borderRadius: '48rpx',
              background: 'linear-gradient(135deg, #9B59B6 0%, #FF6B9D 100%)',
              color: 'white',
              border: 'none',
            }}
            onClick={onComplete}
          >
            {challenge.type === 'truth' ? '提交回答' : '完成任务'}
          </Button>
          {onRefresh && (
            <Button
              style={{
                width: '120rpx',
                height: '80rpx',
                borderRadius: '48rpx',
                background: 'white',
                color: '#9B59B6',
                border: '2rpx solid #9B59B6',
              }}
              onClick={onRefresh}
            >
              换一题
            </Button>
          )}
        </View>
      )}
      
      <View className={styles.reactionSection}>
        <View
          className={styles.reactionButton}
          onClick={() => onReaction?.('like')}
        >
          <Text className={styles.reactionIcon}>👍</Text>
          <Text className={styles.reactionCount}>{getLikeCount()}</Text>
        </View>
        <View
          className={styles.reactionButton}
          onClick={() => onReaction?.('laugh')}
        >
          <Text className={styles.reactionIcon}>😂</Text>
          <Text className={styles.reactionCount}>{getLaughCount()}</Text>
        </View>
      </View>
    </View>
  );
};

export default ChallengeCard;