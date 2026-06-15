const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const roomsCollection = db.collection('rooms');
const playersCollection = db.collection('players');

// 创建房间
exports.createRoom = async (event) => {
  const { hostName, hostAvatar } = event;
  const roomId = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    // 创建房间
    const roomResult = await roomsCollection.add({
      data: {
        roomId,
        name: `${hostName}的房间`,
        hostId: cloud.getWXContext().OPENID,
        hostName,
        hostAvatar,
        status: 'waiting',
        createdAt: db.serverDate(),
        players: [{
          openid: cloud.getWXContext().OPENID,
          name: hostName,
          avatar: hostAvatar,
          role: 'host',
          status: 'online'
        }]
      }
    });
    
    // 添加玩家记录
    await playersCollection.add({
      data: {
        openid: cloud.getWXContext().OPENID,
        roomId,
        name: hostName,
        avatar: hostAvatar,
        role: 'host',
        status: 'online',
        joinedAt: db.serverDate()
      }
    });
    
    return {
      success: true,
      roomId,
      message: '房间创建成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// 加入房间
exports.joinRoom = async (event) => {
  const { roomId, playerName, playerAvatar } = event;
  const openid = cloud.getWXContext().OPENID;
  
  try {
    // 查找房间
    const roomResult = await roomsCollection.where({ roomId }).get();
    if (roomResult.data.length === 0) {
      return { success: false, message: '房间不存在' };
    }
    
    const room = roomResult.data[0];
    
    // 检查是否已在房间中
    const existingPlayer = room.players.find(p => p.openid === openid);
    if (existingPlayer) {
      return { success: false, message: '您已在房间中' };
    }
    
    // 更新房间玩家列表
    await roomsCollection.doc(room._id).update({
      data: {
        players: db.command.push({
          openid,
          name: playerName,
          avatar: playerAvatar,
          role: 'player',
          status: 'online'
        }),
        status: 'waiting'
      }
    });
    
    // 添加玩家记录
    await playersCollection.add({
      data: {
        openid,
        roomId,
        name: playerName,
        avatar: playerAvatar,
        role: 'player',
        status: 'online',
        joinedAt: db.serverDate()
      }
    });
    
    return {
      success: true,
      room,
      message: '加入房间成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// 获取房间信息
exports.getRoom = async (event) => {
  const { roomId } = event;
  
  try {
    const result = await roomsCollection.where({ roomId }).get();
    if (result.data.length === 0) {
      return { success: false, message: '房间不存在' };
    }
    
    return {
      success: true,
      room: result.data[0]
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// 获取房间列表
exports.getRooms = async () => {
  try {
    const result = await roomsCollection.where({
      status: 'waiting'
    }).orderBy('createdAt', 'desc').get();
    
    return {
      success: true,
      rooms: result.data.map(room => ({
        id: room.roomId,
        name: room.name,
        count: room.players.length,
        status: room.status
      }))
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// 更新玩家状态
exports.updatePlayerStatus = async (event) => {
  const { roomId, status } = event;
  const openid = cloud.getWXContext().OPENID;
  
  try {
    const roomResult = await roomsCollection.where({ roomId }).get();
    if (roomResult.data.length === 0) {
      return { success: false, message: '房间不存在' };
    }
    
    const room = roomResult.data[0];
    const updatedPlayers = room.players.map(p => 
      p.openid === openid ? { ...p, status } : p
    );
    
    await roomsCollection.doc(room._id).update({
      data: { players: updatedPlayers }
    });
    
    await playersCollection.where({ roomId, openid }).update({
      data: { status }
    });
    
    return { success: true, message: '状态更新成功' };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// 删除房间
exports.deleteRoom = async (event) => {
  const { roomId } = event;
  const openid = cloud.getWXContext().OPENID;
  
  try {
    const roomResult = await roomsCollection.where({ roomId }).get();
    if (roomResult.data.length === 0) {
      return { success: false, message: '房间不存在' };
    }
    
    const room = roomResult.data[0];
    if (room.hostId !== openid) {
      return { success: false, message: '无权删除此房间' };
    }
    
    await roomsCollection.doc(room._id).remove();
    await playersCollection.where({ roomId }).remove();
    
    return { success: true, message: '房间已删除' };
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
    case 'createRoom':
      return await exports.createRoom(event);
    case 'joinRoom':
      return await exports.joinRoom(event);
    case 'getRoom':
      return await exports.getRoom(event);
    case 'getRooms':
      return await exports.getRooms(event);
    case 'updatePlayerStatus':
      return await exports.updatePlayerStatus(event);
    case 'deleteRoom':
      return await exports.deleteRoom(event);
    default:
      return { success: false, message: '未知操作' };
  }
};