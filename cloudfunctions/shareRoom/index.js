// 云函数：shareRoom - 分享房间时增加分享计数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { roomId } = event;

  try {
    await db.collection('rooms').doc(roomId).update({
      data: {
        shareCount: _.inc(1)
      }
    });
    return { code: 0, msg: '分享计数+1' };
  } catch (err) {
    console.error('shareRoom error:', err);
    return { code: -1, msg: '操作失败: ' + err.message };
  }
};