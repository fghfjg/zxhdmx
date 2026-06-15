const truthQuestions = [
  '你最尴尬的一件事是什么？',
  '你暗恋过在场的某个人吗？',
  '你做过最疯狂的事情是什么？',
  '你最害怕失去什么？',
  '你最近一次哭是因为什么？',
  '你对自己最不满意的地方是什么？',
  '你做过最后悔的决定是什么？',
  '你最想对某个人说的话是什么？',
  '你最大的秘密是什么？',
  '你最讨厌自己的哪个习惯？',
  '你曾经在背后说过谁的坏话？',
  '你最想改变过去的哪件事？',
  '你觉得自己最大的优点是什么？',
  '你曾经对谁撒过最大的谎？',
  '你最难忘的第一次是什么？',
  '你觉得自己最像哪种动物？',
  '你最想拥有什么超能力？',
  '你最怕别人知道你的什么事？',
  '你最近一次失眠是因为什么？',
  '你最想对前任说什么？'
];

const dareTasks = [
  '模仿一种动物的叫声',
  '用屁股写字',
  '给通讯录第3个人打电话表白',
  '做10个俯卧撑',
  '学鸭子走路绕场一周',
  '喝一大杯水',
  '做一个鬼脸保持10秒',
  '用方言念一段台词',
  '给在场某人按摩1分钟',
  '唱一首歌的高潮部分',
  '模仿一位明星的经典动作',
  '做20个深蹲',
  '用嘴叼着杯子走一圈',
  '给异性发一条暧昧消息',
  '表演一段即兴舞蹈',
  '用撒娇的语气说一段话',
  '模仿婴儿哭的声音',
  '做10个仰卧起坐',
  '用鼻子写自己的名字',
  '给在场某人一个拥抱'
];

Page({
  data: {
    room: null,
    players: [
      { id: 1, name: '小明', avatar: '👦', role: 'host', status: 'online' },
      { id: 2, name: '小红', avatar: '👧', role: 'player', status: 'online' },
      { id: 3, name: '小刚', avatar: '👨', role: 'player', status: 'online' },
      { id: 4, name: '小美', avatar: '👩', role: 'player', status: 'away' }
    ],
    gameStarted: false,
    currentTurn: null,
    showGameModal: false,
    gameType: '',
    currentQuestion: '',
    usedPlayers: [],
    roomId: ''
  },

  onShow() {
    const room = wx.getStorageSync('currentRoom');
    if (room) {
      this.setData({ room, roomId: room.id });
      this.loadPlayers();
    }
  },

  async loadPlayers() {
    const { roomId } = this.data;
    if (!roomId) return;
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'roomManager',
        data: { action: 'getRoom', roomId }
      });
      
      if (result.result.success && result.result.room.players) {
        const players = result.result.room.players.map((p, index) => ({
          id: index + 1,
          openid: p.openid,
          name: p.name,
          avatar: p.avatar,
          role: p.role,
          status: p.status
        }));
        this.setData({ players });
      }
    } catch (error) {
      console.log('加载玩家列表失败，使用本地数据', error);
    }
  },

  startGame() {
    const onlinePlayers = this.data.players.filter(p => p.status === 'online');
    if (onlinePlayers.length === 0) {
      wx.showToast({ title: '没有在线玩家', icon: 'none' });
      return;
    }
    const firstPlayer = this.getRandomPlayer(onlinePlayers);
    this.setData({ 
      gameStarted: true,
      currentTurn: firstPlayer,
      usedPlayers: firstPlayer ? [firstPlayer.id] : []
    });
    wx.showToast({ title: '游戏开始！', icon: 'success' });
  },

  getRandomPlayer(onlinePlayers) {
    const availablePlayers = onlinePlayers.filter(p => !this.data.usedPlayers.includes(p.id));
    
    if (availablePlayers.length === 0) {
      this.setData({ usedPlayers: [] });
      const randomIndex = Math.floor(Math.random() * onlinePlayers.length);
      const player = onlinePlayers[randomIndex];
      this.setData({ usedPlayers: [player.id] });
      return player;
    }
    
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    return availablePlayers[randomIndex];
  },

  nextTurn() {
    const onlinePlayers = this.data.players.filter(p => p.status === 'online');
    if (onlinePlayers.length === 0) return;
    
    const nextPlayer = this.getRandomPlayer(onlinePlayers);
    if (nextPlayer) {
      this.setData({
        currentTurn: nextPlayer,
        usedPlayers: [...this.data.usedPlayers, nextPlayer.id]
      });
    }
  },

  endGame() {
    this.setData({ gameStarted: false, currentTurn: null, usedPlayers: [] });
    wx.showToast({ title: '游戏结束', icon: 'none' });
  },

  getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  chooseTruth() {
    this.setData({ 
      showGameModal: true, 
      gameType: 'truth',
      currentQuestion: this.getRandomItem(truthQuestions)
    });
  },

  chooseDare() {
    this.setData({ 
      showGameModal: true, 
      gameType: 'dare',
      currentQuestion: this.getRandomItem(dareTasks)
    });
  },

  goToMessages() {
    wx.navigateTo({ url: '/pages/message/index' });
  },

  goToResult() {
    wx.navigateTo({ url: '/pages/result/index' });
  },

  closeGameModal() {
    this.setData({ showGameModal: false });
    this.nextTurn();
  },

  selectPlayer(e) {
    const player = e.currentTarget.dataset.player;
    this.setData({ currentTurn: player });
  },

  kickPlayer(e) {
    const playerId = e.currentTarget.dataset.playerId;
    this.setData({
      players: this.data.players.filter(p => p.id !== playerId)
    });
    wx.showToast({ title: '已移出', icon: 'none' });
  },

  refreshPlayers() {
    this.loadPlayers();
    wx.showToast({ title: '已刷新', icon: 'success' });
  }
});