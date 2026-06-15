// 云函数：kickUser - 踢出用户
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { roomId, targetOpenId } = event;
  const wxContext = cloud.getWXContext();
  const callerOpenId = wxContext.OPENID;

  try {
    // 验证调用者是否为房主
    const roomRes = await db.collection('rooms').doc(roomId).get();
    const room = roomRes.data;

    if (room.creatorId !== callerOpenId) {
      return { code: -1, msg: '只有房主可以踢人' };
    }

    if (targetOpenId === callerOpenId) {
      return { code: -1, msg: '不能踢出自己' };
    }

    // 从 participants 中移除
    const newParticipants = room.participants.filter(p => p.openId !== targetOpenId);

    // 添加到 bannedUsers
    const bannedUsers = room.bannedUsers || [];
    if (bannedUsers.indexOf(targetOpenId) === -1) {
      bannedUsers.push(targetOpenId);
    }

    // 更新房间
    await db.collection('rooms').doc(roomId).update({
      data: {
        participants: newParticipants,
        bannedUsers: bannedUsers
      }
    });

    // 删除该用户在房间内的聊天记录
    await db.collection('messages').where({
      roomId: roomId,
      openId: targetOpenId
    }).remove();

    return { code: 0, msg: '踢出成功' };
  } catch (err) {
    console.error('kickUser error:', err);
    return { code: -1, msg: '操作失败: ' + err.message };
  }
};