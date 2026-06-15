import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import { Player } from '@/types/room';
import styles from './index.module.scss';

interface PlayerAvatarProps {
  player: Player;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player }) => {
  return (
    <View className={styles.avatarContainer}>
      <Image
        src={player.avatarUrl}
        className={`${styles.avatar} ${player.isOwner ? styles.avatarOwner : ''}`}
        mode="aspectFill"
      />
      <Text className={styles.name}>{player.nickName}</Text>
      {player.isOwner && <Text className={styles.ownerTag}>房主</Text>}
    </View>
  );
};

export default PlayerAvatar;