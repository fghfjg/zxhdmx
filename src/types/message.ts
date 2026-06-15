// 留言类型定义
export interface Message {
  id: string; // 留言ID
  roomId: string; // 房间号
  senderId: string; // 发送者ID
  senderName: string; // 发送者昵称
  avatarUrl: string; // 发送者头像
  content: string; // 留言内容
  timestamp: number; // 发送时间
}

export interface RoomHistory {
  roomId: string; // 房间号
  roomName: string; // 房间名称
  playerCount: number; // 参与人数
  joinTime: number; // 加入时间
  status: 'waiting' | 'playing' | 'ended'; // 房间状态
}