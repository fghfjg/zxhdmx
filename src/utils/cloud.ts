import Taro from '@tarojs/taro';

// 判断是否在微信小程序环境
export const isWeChatEnv = (): boolean => {
  return typeof Taro.cloud !== 'undefined';
};

// 云开发初始化
export const initCloud = () => {
  if (!isWeChatEnv()) {
    console.log('[Cloud] 非微信环境，跳过云开发初始化');
    return false;
  }
  
  try {
    Taro.cloud.init({
      env: 'cloud1-t4gx3e2a30a25fc7a',
      traceUser: true,
    });
    console.log('[Cloud] 云开发初始化成功');
    return true;
  } catch (error) {
    console.error('[Cloud] 云开发初始化失败', error);
    return false;
  }
};

// 获取用户openId（模拟数据用于H5预览）
export const getOpenId = async (): Promise<string> => {
  if (!isWeChatEnv()) {
    // 在非微信环境中返回模拟的openId
    const mockOpenId = `mock_openid_${Math.random().toString(36).substr(2, 9)}`;
    console.log('[Cloud] 非微信环境，使用模拟openId:', mockOpenId);
    return mockOpenId;
  }
  
  try {
    const res = await Taro.cloud.callFunction({
      name: 'getOpenId',
    });
    return res.result.openid;
  } catch (error) {
    console.error('[Cloud] 获取openId失败', error);
    // 返回模拟的openId作为备用
    return `mock_openid_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// 获取用户信息（模拟数据用于H5预览）
export const getUserInfo = async (): Promise<{ nickName: string; avatarUrl: string }> => {
  if (!isWeChatEnv()) {
    // 在非微信环境中返回模拟的用户信息
    const nickNames = ['玩家小明', '游戏达人', '快乐玩家', '冒险王', '真心话大师'];
    const randomName = nickNames[Math.floor(Math.random() * nickNames.length)];
    const randomId = Math.floor(Math.random() * 10) + 1;
    return {
      nickName: randomName,
      avatarUrl: `https://picsum.photos/id/${randomId * 10}/200/200`,
    };
  }
  
  try {
    const res = await Taro.getUserInfo({
      withCredentials: true,
    });
    return {
      nickName: res.nickName || '玩家',
      avatarUrl: res.avatarUrl || 'https://picsum.photos/id/64/200/200',
    };
  } catch (error) {
    console.error('[Cloud] 获取用户信息失败', error);
    return {
      nickName: '玩家',
      avatarUrl: 'https://picsum.photos/id/64/200/200',
    };
  }
};

// 生成6位房间号
export const generateRoomId = (): string => {
  const roomId = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('[Utils] 生成房间号:', roomId);
  return roomId;
};

// 获取数据库实例（仅在微信环境中可用）
const getDb = () => {
  if (!isWeChatEnv()) {
    throw new Error('数据库操作仅在微信小程序环境中可用');
  }
  return Taro.cloud.database();
};

// 创建房间
export const createRoom = async (roomData: any) => {
  if (!isWeChatEnv()) {
    console.log('[Cloud] 非微信环境，模拟创建房间:', roomData.roomId);
    return { _id: roomData.roomId };
  }
  
  try {
    const db = getDb();
    const res = await db.collection('rooms').add({
      data: roomData,
    });
    console.log('[Cloud] 创建房间成功', res);
    return res;
  } catch (error) {
    console.error('[Cloud] 创建房间失败', error);
    throw error;
  }
};

// 加入房间
export const joinRoom = async (roomId: string, playerData: any) => {
  if (!isWeChatEnv()) {
    console.log('[Cloud] 非微信环境，模拟加入房间:', roomId);
    return { stats: { updated: 1 } };
  }
  
  try {
    const db = getDb();
    const res = await db.collection('rooms').doc(roomId).update({
      data: {
        players: db.command.push([playerData]),
      },
    });
    console.log('[Cloud] 加入房间成功', res);
    return res;
  } catch (error) {
    console.error('[Cloud] 加入房间失败', error);
    throw error;
  }
};

// 获取房间信息
export const getRoom = async (roomId: string) => {
  if (!isWeChatEnv()) {
    console.log('[Cloud] 非微信环境，返回模拟房间数据:', roomId);
    return {
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
      status: 'waiting',
      gameStats: {
        totalChallenges: 0,
        truthCount: 0,
        dareCount: 0,
        mostActivePlayer: '房主',
      },
      createTime: Date.now(),
    };
  }
  
  try {
    const db = getDb();
    const res = await db.collection('rooms').doc(roomId).get();
    console.log('[Cloud] 获取房间信息成功', res);
    return res.data;
  } catch (error) {
    console.error('[Cloud] 获取房间信息失败', error);
    throw error;
  }
};

// 监听房间变化
export const watchRoom = (roomId: string, callback: (data: any) => void) => {
  if (!isWeChatEnv()) {
    console.log('[Cloud] 非微信环境，跳过监听');
    return { close: () => {} };
  }
  
  try {
    const db = getDb();
    const watcher = db.collection('rooms').doc(roomId).watch({
      onChange: (snapshot) => {
        console.log('[Cloud] 房间数据变化', snapshot);
        callback(snapshot.docs[0]);
      },
      onError: (error) => {
        console.error('[Cloud] 监听房间失败', error);
      },
    });
    return watcher;
  } catch (error) {
    console.error('[Cloud] 监听房间失败', error);
    throw error;
  }
};

// 保存游戏分数
export const saveScore = async (playerName: string, playerAvatar: string, score: number, gameMode: string, roomId?: string) => {
  if (!isWeChatEnv()) {
    console.log('[Cloud] 非微信环境，模拟保存分数:', score);
    return { success: true, id: 'mock_score_id' };
  }
  
  try {
    const res = await Taro.cloud.callFunction({
      name: 'scoreManager',
      data: {
        action: 'saveScore',
        playerName,
        playerAvatar,
        score,
        gameMode,
        roomId
      }
    });
    console.log('[Cloud] 保存分数成功', res);
    return res.result;
  } catch (error) {
    console.error('[Cloud] 保存分数失败', error);
    throw error;
  }
};

// 获取排行榜
export const getLeaderboard = async (limit: number = 20, gameMode?: string) => {
  if (!isWeChatEnv()) {
    console.log('[Cloud] 非微信环境，返回模拟排行榜数据');
    return {
      success: true,
      scores: [
        { rank: 1, playerName: '玩家小明', playerAvatar: 'https://picsum.photos/id/1/200/200', score: 150, gameMode: 'truth' },
        { rank: 2, playerName: '游戏达人', playerAvatar: 'https://picsum.photos/id/2/200/200', score: 120, gameMode: 'dare' },
        { rank: 3, playerName: '快乐玩家', playerAvatar: 'https://picsum.photos/id/3/200/200', score: 100, gameMode: 'truth' },
        { rank: 4, playerName: '冒险王', playerAvatar: 'https://picsum.photos/id/4/200/200', score: 80, gameMode: 'dare' },
        { rank: 5, playerName: '真心话大师', playerAvatar: 'https://picsum.photos/id/5/200/200', score: 60, gameMode: 'truth' },
      ]
    };
  }
  
  try {
    const res = await Taro.cloud.callFunction({
      name: 'scoreManager',
      data: {
        action: 'getLeaderboard',
        limit,
        gameMode
      }
    });
    console.log('[Cloud] 获取排行榜成功', res);
    return res.result;
  } catch (error) {
    console.error('[Cloud] 获取排行榜失败', error);
    throw error;
  }
};

// 获取个人最高分
export const getPersonalBest = async () => {
  if (!isWeChatEnv()) {
    console.log('[Cloud] 非微信环境，返回模拟个人最高分');
    return { success: true, bestScore: 0, message: '暂无记录' };
  }
  
  try {
    const res = await Taro.cloud.callFunction({
      name: 'scoreManager',
      data: {
        action: 'getPersonalBest'
      }
    });
    console.log('[Cloud] 获取个人最高分成功', res);
    return res.result;
  } catch (error) {
    console.error('[Cloud] 获取个人最高分失败', error);
    throw error;
  }
};

// 获取统计数据
export const getStatistics = async () => {
  if (!isWeChatEnv()) {
    console.log('[Cloud] 非微信环境，返回模拟统计数据');
    return { success: true, totalGames: 100, highestScore: 200, topPlayer: '玩家小明' };
  }
  
  try {
    const res = await Taro.cloud.callFunction({
      name: 'scoreManager',
      data: {
        action: 'getStatistics'
      }
    });
    console.log('[Cloud] 获取统计数据成功', res);
    return res.result;
  } catch (error) {
    console.error('[Cloud] 获取统计数据失败', error);
    throw error;
  }
};