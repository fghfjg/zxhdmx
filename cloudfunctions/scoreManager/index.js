const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const scoresCollection = db.collection('scores');

// 保存游戏分数
exports.saveScore = async (event) => {
  const { playerName, playerAvatar, score, gameMode, roomId } = event;
  const openid = cloud.getWXContext().OPENID;
  
  try {
    const result = await scoresCollection.add({
      data: {
        openid,
        playerName,
        playerAvatar,
        score,
        gameMode,
        roomId: roomId || null,
        createdAt: db.serverDate(),
      }
    });
    
    return {
      success: true,
      message: '分数保存成功',
      id: result._id
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// 获取排行榜
exports.getLeaderboard = async (event) => {
  const { limit = 20, gameMode } = event;
  
  try {
    let query = scoresCollection.orderBy('score', 'desc');
    
    if (gameMode) {
      query = query.where({ gameMode });
    }
    
    const result = await query.limit(limit).get();
    
    return {
      success: true,
      scores: result.data.map((item, index) => ({
        rank: index + 1,
        playerName: item.playerName,
        playerAvatar: item.playerAvatar,
        score: item.score,
        gameMode: item.gameMode,
        date: item.createdAt
      }))
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// 获取用户个人最高分
exports.getPersonalBest = async (event) => {
  const openid = cloud.getWXContext().OPENID;
  
  try {
    const result = await scoresCollection
      .where({ openid })
      .orderBy('score', 'desc')
      .limit(1)
      .get();
    
    if (result.data.length === 0) {
      return {
        success: true,
        bestScore: 0,
        message: '暂无记录'
      };
    }
    
    return {
      success: true,
      bestScore: result.data[0].score,
      record: result.data[0]
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// 获取统计数据
exports.getStatistics = async () => {
  try {
    const countResult = await scoresCollection.count();
    const topScoreResult = await scoresCollection.orderBy('score', 'desc').limit(1).get();
    
    return {
      success: true,
      totalGames: countResult.total,
      highestScore: topScoreResult.data.length > 0 ? topScoreResult.data[0].score : 0,
      topPlayer: topScoreResult.data.length > 0 ? topScoreResult.data[0].playerName : '暂无'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// 主入口
exports.main = async (event, context) => {
  const { action } = event;
  
  switch (action) {
    case 'saveScore':
      return await exports.saveScore(event);
    case 'getLeaderboard':
      return await exports.getLeaderboard(event);
    case 'getPersonalBest':
      return await exports.getPersonalBest(event);
    case 'getStatistics':
      return await exports.getStatistics(event);
    default:
      return { success: false, message: '未知操作' };
  }
};