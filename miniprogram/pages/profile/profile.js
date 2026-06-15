const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    openId: '',
    historyList: [],
    stats: { totalGames: 0, truthCount: 0, dareCount: 0, todayGames: 0, uniqueRooms: 0 },
    trendData: []
  },

  onLoad: function () { this.loadHistory(); },
  onShow: function () { this.loadHistory(); },

  loadHistory: function () {
    const openId = app.globalData.openId || 'mock_openid_test';
    this.setData({ openId });

    // 优先从 gameRecords 集合加载
    db.collection('gameRecords')
      .where({ openId })
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get()
      .then(res => {
        const historyList = res.data.length > 0 ? res.data : this.getMockHistory();
        this.setData({ historyList });
        this.calculateStats(historyList);
        this.calculateTrend(historyList);
      })
      .catch(err => {
        console.error('获取历史记录失败:', err);
        const mockHistory = this.getMockHistory();
        this.setData({ historyList: mockHistory });
        this.calculateStats(mockHistory);
        this.calculateTrend(mockHistory);
      });
  },

  getMockHistory: function () {
    const now = new Date();
    return [
      { roomId: 'mock_room_1', roomName: '欢乐聚会', questionContent: '💭 真心话：你做过最疯狂的事是什么？', type: 'truth', timestamp: now.toISOString() },
      { roomId: 'mock_room_3', roomName: '大冒险专场', questionContent: '🎲 大冒险：学青蛙跳一圈', type: 'dare', timestamp: new Date(now - 3600000).toISOString() },
      { roomId: 'mock_room_1', roomName: '欢乐聚会', questionContent: '🎲 大冒险：表演一段舞蹈', type: 'dare', timestamp: new Date(now - 86400000).toISOString() },
      { roomId: 'mock_room_2', roomName: '深夜真心话', questionContent: '💭 真心话：你暗恋过多少人？', type: 'truth', timestamp: new Date(now - 86400000 * 2).toISOString() },
      { roomId: 'mock_room_3', roomName: '大冒险专场', questionContent: '💭 真心话：你最害怕什么？', type: 'truth', timestamp: new Date(now - 86400000 * 3).toISOString() }
    ];
  },

  calculateStats: function (historyList) {
    const stats = { totalGames: historyList.length, truthCount: 0, dareCount: 0, todayGames: 0, uniqueRooms: 0 };
    const today = new Date().toDateString();
    const roomIds = new Set();

    historyList.forEach(item => {
      if (item.type === 'truth') stats.truthCount++;
      else stats.dareCount++;

      if (item.timestamp && new Date(item.timestamp).toDateString() === today) stats.todayGames++;
      if (item.roomId) roomIds.add(item.roomId);
    });

    stats.uniqueRooms = roomIds.size;
    this.setData({ stats });
  },

  // 计算7天趋势
  calculateTrend: function (historyList) {
    const trendData = [];
    const now = new Date();
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const label = i === 0 ? '今天' : '周' + dayNames[date.getDay()];

      const count = historyList.filter(item =>
        item.timestamp && new Date(item.timestamp).toDateString() === dateStr
      ).length;

      trendData.push({ label, count, percent: 0 });
    }

    const maxCount = Math.max(...trendData.map(d => d.count), 1);
    trendData.forEach(d => { d.percent = (d.count / maxCount) * 100; });

    this.setData({ trendData });
  },

  goToHome: function () { wx.switchTab({ url: '/pages/index/index' }); },

  onShare: function () {
    wx.showShareMenu({ withShareTicket: true });
    wx.showToast({ title: '点击右上角分享', icon: 'none' });
  },

  onShareAppMessage: function () {
    return { title: '快来玩真心话大冒险！', path: '/pages/index/index' };
  },

  onAbout: function () {
    wx.showModal({
      title: '关于游戏',
      content: '真心话大冒险 v2.0\n\n创建房间，邀请好友一起玩耍！\n支持房间密码、人数限制、聊天互动、踢人功能。\n随机抽取真心话或大冒险题目，享受欢乐时光。',
      showCancel: false
    });
  },

  formatTime: function (timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  }
});