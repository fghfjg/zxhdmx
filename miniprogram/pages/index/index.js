const app = getApp();
const db = wx.cloud.database();
const PAGE_SIZE = 10;

Page({
  data: {
    searchKeyword: '',
    rooms: [],
    totalRooms: 0,
    page: 0,
    hasMore: true,
    showCreateModal: false,
    roomName: '真心话大冒险',
    description: '',
    maxPlayers: 6,
    maxPlayerOptions: [2, 3, 4, 5, 6, 7, 8],
    roomPassword: ''
  },

  onLoad: function () {
    this.loadRooms(true);
  },

  onShow: function () {
    this.loadRooms(true);
  },

  // 加载房间列表（分页）
  loadRooms: function (reset) {
    const page = reset ? 0 : this.data.page;
    const keyword = this.data.searchKeyword.trim();

    let query = db.collection('rooms').where({ status: 'waiting' });
    if (keyword) {
      query = query.where({
        roomName: db.RegExp({ regexp: keyword, options: 'i' })
      });
    }

    query.orderBy('createTime', 'desc')
      .skip(page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .get()
      .then(res => {
        const newRooms = res.data.map(r => {
          r.playerPercent = r.maxPlayers ? Math.round(r.participants.length / r.maxPlayers * 100) : 0;
          return r;
        });
        this.setData({
          rooms: reset ? newRooms : this.data.rooms.concat(newRooms),
          totalRooms: newRooms.length,
          page: page + 1,
          hasMore: newRooms.length === PAGE_SIZE
        });
      })
      .catch(err => {
        console.error('获取房间列表失败:', err);
        let mockRooms = app.mockRooms.filter(r => r.status === 'waiting').map(r => {
          r.playerPercent = r.maxPlayers ? Math.round(r.participants.length / r.maxPlayers * 100) : 0;
          return r;
        });
        if (keyword) {
          mockRooms = mockRooms.filter(r => r.roomName.indexOf(keyword) !== -1);
        }
        this.setData({
          rooms: reset ? mockRooms : this.data.rooms.concat(mockRooms),
          totalRooms: mockRooms.length,
          hasMore: false
        });
      });
  },

  // 搜索
  onSearchInput: function (e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearch: function () {
    this.loadRooms(true);
  },

  onClearSearch: function () {
    this.setData({ searchKeyword: '' });
    this.loadRooms(true);
  },

  // 加载更多
  onLoadMore: function () {
    this.loadRooms(false);
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.loadRooms(true);
    setTimeout(() => { wx.stopPullDownRefresh(); }, 800);
  },

  // 创建房间弹窗
  onShowCreate: function () {
    this.setData({
      showCreateModal: true,
      roomName: '真心话大冒险',
      description: '',
      maxPlayers: 6,
      roomPassword: ''
    });
  },

  onCloseCreate: function () {
    this.setData({ showCreateModal: false });
  },

  stopPropagation: function () {},

  onRoomNameInput: function (e) {
    this.setData({ roomName: e.detail.value || '真心话大冒险' });
  },

  onDescriptionInput: function (e) {
    this.setData({ description: e.detail.value });
  },

  onSelectMaxPlayers: function (e) {
    this.setData({ maxPlayers: e.currentTarget.dataset.count });
  },

  onPasswordInput: function (e) {
    this.setData({ roomPassword: e.detail.value });
  },

  // 创建房间
  onCreateRoom: function () {
    const roomName = this.data.roomName.trim() || '真心话大冒险';
    const password = this.data.roomPassword.trim();

    if (password && password.length !== 4) {
      wx.showToast({ title: '密码必须为4位数字', icon: 'none' });
      return;
    }

    const openId = app.globalData.openId || 'mock_openid_' + Math.random().toString(36).substr(2, 9);

    const roomData = {
      roomName: roomName,
      description: this.data.description,
      creatorId: openId,
      createTime: new Date(),
      status: 'waiting',
      maxPlayers: this.data.maxPlayers,
      password: password,
      bannedUsers: [],
      shareCount: 0,
      participants: []
    };

    db.collection('rooms').add({ data: roomData })
      .then(res => {
        console.log('创建房间成功（云端）:', res);
        wx.showToast({ title: '创建房间成功', icon: 'success' });
        this.setData({ showCreateModal: false });
        setTimeout(() => {
          wx.navigateTo({ url: `/pages/room/room?id=${res._id}` });
        }, 1000);
      })
      .catch(err => {
        console.error('云端创建失败，使用本地模拟:', err);
        const newRoom = Object.assign({}, roomData, {
          _id: 'room_' + Date.now(),
          createTime: new Date().toISOString()
        });
        app.mockRooms.unshift(newRoom);
        this.setData({
          rooms: app.mockRooms.filter(r => r.status === 'waiting'),
          showCreateModal: false
        });
        wx.showToast({ title: '创建成功（模拟）', icon: 'success' });
        setTimeout(() => {
          wx.navigateTo({ url: `/pages/room/room?id=${newRoom._id}` });
        }, 1000);
      });
  },

  // 加入房间
  onJoinRoom: function (e) {
    const roomId = e.currentTarget.dataset.roomid;
    const room = this.data.rooms.find(r => r._id === roomId);

    if (!room) return;

    // 检查是否被ban
    const openId = app.globalData.openId || 'mock_openid_test';
    if (room.bannedUsers && room.bannedUsers.indexOf(openId) !== -1) {
      wx.showToast({ title: '你已被移出该房间', icon: 'none' });
      return;
    }

    // 检查人数
    if (room.participants.length >= room.maxPlayers) {
      wx.showToast({ title: '房间已满', icon: 'none' });
      return;
    }

    // 检查密码
    if (room.password) {
      wx.showModal({
        title: '输入房间密码',
        editable: true,
        placeholderText: '请输入4位密码',
        success: (res) => {
          if (res.confirm) {
            if (res.content === room.password) {
              wx.navigateTo({ url: `/pages/room/room?id=${roomId}` });
            } else {
              wx.showToast({ title: '密码错误', icon: 'none' });
            }
          }
        }
      });
    } else {
      wx.navigateTo({ url: `/pages/room/room?id=${roomId}` });
    }
  }
});