// 游戏类型定义
export interface Challenge {
  id: string; // 挑战ID
  type: 'truth' | 'dare'; // 挑战类型
  content: string; // 挑战内容
  playerId: string; // 发起玩家ID
  playerName: string; // 发起玩家昵称
  answer?: string; // 玩家回答（真心话）
  completed: boolean; // 是否完成
  reactions: Reaction[]; // 表情回应
  createTime: number; // 创建时间
  completeTime?: number; // 完成时间
}

export interface Reaction {
  playerId: string; // 反应玩家ID
  playerName: string; // 反应玩家昵称
  type: 'like' | 'laugh'; // 表情类型
  createTime: number; // 反应时间
}

export interface Question {
  id: string;
  content: string;
  type: 'truth';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Task {
  id: string;
  content: string;
  type: 'dare';
  difficulty: 'easy' | 'medium' | 'hard';
}