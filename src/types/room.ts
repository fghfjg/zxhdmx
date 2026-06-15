// 房间类型定义
export interface Room {
  roomId: string; // 6位房间号
  ownerId: string; // 房主openId
  ownerName: string; // 房主昵称
  players: Player[]; // 玩家列表
  status: 'waiting' | 'playing' | 'ended'; // 房间状态
  gameStats: GameStats; // 游戏统计数据
  createTime: number; // 创建时间
}

export interface Player {
  openId: string; // 用户openId
  nickName: string; // 用户昵称
  avatarUrl: string; // 头像URL
  roomId: string; // 所在房间号
  challengeCount: number; // 挑战次数
  reactionReceived: number; // 收到表情数
  isOwner: boolean; // 是否房主
  joinTime: number; // 加入时间
}

export interface GameStats {
  totalChallenges: number; // 总挑战次数
  truthCount: number; // 真心话次数
  dareCount: number; // 大冒险次数
  mostActivePlayer: string; // 最活跃玩家昵称
}