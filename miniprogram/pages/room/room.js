const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

// 头像颜色池
const AVATAR_COLORS = ['#7C3AED', '#A78BFA', '#6D28D9', '#8B5CF6', '#C084FC', '#E879F9', '#F472B6', '#FB923C'];

Page({
  data: {
    roomId: '',
    roomInfo: {},
    isCreator: false,
    showQuestion: false,
    currentQuestion: null,
    isDrawing: false,
    useMockData: false,
    myOpenId: '',
    messages: [],
    chatInput: '',
    scrollToMsg: '',
    emojiList: ['👍', '😂', '🎉', '❤️', '🔥', '😎', '🤣', '💪'],
    showKickModal: false,
    kickTargetOpenId: '',
    kickTargetNickName: ''
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ roomId: options.id });
      this.loadRoomInfo();
    }
  },

  onShow: function () {
    if (this.data.roomId) {
      this.loadRoomInfo();
      this.loadMessages();
    }
  },

  // 加载房间信息
  loadRoomInfo: function () {
    const openId = app.globalData.openId || 'mock_openid_test';
    this.setData({ myOpenId: openId });

    db.collection('rooms').doc(this.data.roomId).get()
      .then(res => {
        this.setData({ roomInfo: res.data, useMockData: false });
        this.checkUserStatus(res.data);
      })
      .catch(err => {
        console.error('获取房间信息失败:', err);
        const mockRoom = app.mockRooms.find(r => r._id === this.data.roomId);
        if (mockRoom) {
          this.setData({ roomInfo: mockRoom, useMockData: true });
          this.checkUserStatus(mockRoom);
        } else {
          wx.showToast({ title: '房间不存在', icon: 'none' });
        }
      });
  },

  checkUserStatus: function (roomInfo) {
    const openId = this.data.myOpenId;
    this.setData({ isCreator: roomInfo.creatorId === openId });
  },

  // 加载聊天消息（最近10条）
  loadMessages: function () {
    db.collection('messages')
      .where({ roomId: this.data.roomId })
      .orderBy('createTime', 'asc')
      .limit(10)
      .get()
      .then(res => {
        this.setData({ messages: res.data });
      })
      .catch(err => {
        console.error('加载消息失败:', err);
        this.setData({ messages: [] });
      });
  },

  // 发送聊天
  onChatInput: function (e) {
    this.setData({ chatInput: e.detail.value });
  },

  onSendChat: function () {
    const content = this.data.chatInput.trim();
    if (!content) return;

    const openId = this.data.myOpenId;
    const nickName = '玩家' + Math.floor(Math.random() * 1000);
    const msg = {
      roomId: this.data.roomId,
      openId: openId,
      nickName: nickName,
      content: content,
      createTime: new Date(),
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };

    db.collection('messages').add({ data: msg })
      .then(() => {
        this.setData({ chatInput: '', scrollToMsg: 'msg-' + this.data.messages.length });
        this.loadMessages();
      })
      .catch(err => {
        if (err.errCode !== -502005) console.error('发送消息失败:', err);
        const localMsg = Object.assign({}, msg, { _id: 'msg_' + Date.now(), createTime: new Date().toISOString() });
        const messages = this.data.messages.concat(localMsg);
        if (messages.length > 10) messages.shift();
        this.setData({ chatInput: '', messages: messages, scrollToMsg: 'msg-' + (messages.length - 1) });
      });
  },

  onSendEmoji: function (e) {
    const emoji = e.currentTarget.dataset.emoji;
    this.setData({ chatInput: emoji });
    this.onSendChat();
  },

  // 开始游戏
  onStartGame: function () {
    this.setData({ isDrawing: true, showQuestion: true, currentQuestion: null });

    const drawAndShow = (question) => {
      setTimeout(() => {
        this.setData({ isDrawing: false, currentQuestion: question });
        this.updateParticipant(question);
        this.saveGameRecord(question);
      }, 1500);
    };

    wx.cloud.callFunction({
      name: 'drawQuestion',
      success: res => { drawAndShow(res.result); },
      fail: err => {
        console.error('抽取题目失败:', err);
        const questions = app.mockQuestions;
        const q = questions[Math.floor(Math.random() * questions.length)];
        drawAndShow(q);
      }
    });
  },

  // 更新参与者（仅首次添加，重复抽题只更新题目）
  updateParticipant: function (question) {
    const openId = this.data.myOpenId;
    const nickName = '玩家' + Math.floor(Math.random() * 1000);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    if (this.data.useMockData) {
      const roomInfo = this.data.roomInfo;
      if (!roomInfo.participants) roomInfo.participants = [];
      const exists = roomInfo.participants.some(p => p.openId === openId);
      if (exists) {
        roomInfo.participants = roomInfo.participants.map(p =>
          p.openId === openId ? Object.assign({}, p, { questionText: question.content, timestamp: new Date().toISOString() }) : p
        );
      } else {
        roomInfo.participants.push({
          openId, nickName, questionText: question.content,
          timestamp: new Date().toISOString(), avatarColor
        });
      }
      this.setData({ roomInfo });
      return;
    }

    db.collection('rooms').doc(this.data.roomId).get().then(res => {
      const room = res.data;
      const participants = room.participants || [];
      const exists = participants.some(p => p.openId === openId);
      if (exists) {
        const updated = participants.map(p =>
          p.openId === openId ? Object.assign({}, p, { questionText: question.content, timestamp: db.serverDate() }) : p
        );
        return db.collection('rooms').doc(this.data.roomId).update({
          data: { participants: updated }
        });
      } else {
        return db.collection('rooms').doc(this.data.roomId).update({
          data: {
            participants: _.push({
              openId, nickName, questionText: question.content,
              timestamp: db.serverDate(), avatarColor
            })
          }
        });
      }
    }).then(() => { this.loadRoomInfo(); })
      .catch(err => { console.error('更新参与记录失败:', err); });
  },

  // 保存游戏记录
  saveGameRecord: function (question) {
    const openId = this.data.myOpenId;
    const nickName = '玩家' + Math.floor(Math.random() * 1000);
    const record = {
      roomId: this.data.roomId,
      openId, nickName,
      questionContent: question.content,
      type: question.type,
      timestamp: new Date()
    };

    db.collection('gameRecords').add({ data: record })
      .then(() => { console.log('保存游戏记录成功'); })
      .catch(err => {
        if (err.errCode !== -502005) console.error('保存游戏记录失败:', err);
      });
  },

  // 踢人
  onLongPressParticipant: function (e) {
    if (!this.data.isCreator) return;
    const targetOpenId = e.currentTarget.dataset.openid;
    const targetNickName = e.currentTarget.dataset.nickname;
    if (targetOpenId === this.data.myOpenId) return; // 不能踢自己

    this.setData({
      showKickModal: true,
      kickTargetOpenId: targetOpenId,
      kickTargetNickName: targetNickName
    });
  },

  onCloseKick: function () {
    this.setData({ showKickModal: false });
  },

  onConfirmKick: function () {
    const targetOpenId = this.data.kickTargetOpenId;
    this.setData({ showKickModal: false });

    if (this.data.useMockData) {
      const roomInfo = this.data.roomInfo;
      roomInfo.participants = roomInfo.participants.filter(p => p.openId !== targetOpenId);
      if (!roomInfo.bannedUsers) roomInfo.bannedUsers = [];
      roomInfo.bannedUsers.push(targetOpenId);
      this.setData({ roomInfo });
      wx.showToast({ title: '已踢出（模拟）', icon: 'success' });
      return;
    }

    wx.cloud.callFunction({
      name: 'kickUser',
      data: { roomId: this.data.roomId, targetOpenId },
      success: res => {
        wx.showToast({ title: '已踢出该用户', icon: 'success' });
        this.loadRoomInfo();
      },
      fail: err => {
        console.error('踢人失败:', err);
        // 本地降级：先读取再更新
        db.collection('rooms').doc(this.data.roomId).get().then(roomRes => {
          const room = roomRes.data;
          const newParticipants = room.participants.filter(p => p.openId !== targetOpenId);
          const bannedUsers = room.bannedUsers || [];
          if (bannedUsers.indexOf(targetOpenId) === -1) bannedUsers.push(targetOpenId);
          return db.collection('rooms').doc(this.data.roomId).update({
            data: { participants: newParticipants, bannedUsers: bannedUsers }
          });
        }).then(() => {
          wx.showToast({ title: '已踢出', icon: 'success' });
          this.loadRoomInfo();
        }).catch(e => { wx.showToast({ title: '操作失败', icon: 'none' }); });
      }
    });
  },

  // 结束房间
  onEndRoom: function () {
    wx.showModal({
      title: '确认结束',
      content: '确定要结束这个房间吗？',
      success: (res) => {
        if (!res.confirm) return;
        if (this.data.useMockData) {
          const roomInfo = this.data.roomInfo;
          roomInfo.status = 'ended';
          this.setData({ roomInfo });
          wx.showToast({ title: '房间已结束', icon: 'success' });
          return;
        }
        db.collection('rooms').doc(this.data.roomId).update({
          data: { status: 'ended' }
        }).then(() => {
          wx.showToast({ title: '房间已结束', icon: 'success' });
          this.loadRoomInfo();
        }).catch(err => { wx.showToast({ title: '操作失败', icon: 'none' }); });
      }
    });
  },

  closeQuestion: function () {
    this.setData({ showQuestion: false });
  },

  stopPropagation: function () {},

  onCopyRoomId: function () {
    const roomId = this.data.roomInfo._id;
    if (!roomId) { wx.showToast({ title: '房间号不存在', icon: 'none' }); return; }
    wx.setClipboardData({
      data: roomId,
      success: () => { wx.showToast({ title: '房间号已复制', icon: 'success' }); }
    });
  },

  onShareAppMessage: function () {
    const roomInfo = this.data.roomInfo;
    const count = roomInfo.participants ? roomInfo.participants.length : 0;
    const max = roomInfo.maxPlayers || 6;
    return {
      title: `${roomInfo.roomName || '真心话大冒险'} (${count}/${max}人) 快来一起玩！`,
      path: `/pages/room/room?id=${this.data.roomId}`,
      imageUrl: ''
    };
  },

  formatTime: function (timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
});