App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-d4gx3e3a20a25fc7a',
        traceUser: true
      });
    }
    this.getUserInfo();
  },

  getUserInfo: function () {
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: res => {
        this.globalData.openId = res.result.openid;
        console.log('获取openId成功:', this.globalData.openId);
      },
      fail: err => {
        console.error('获取openId失败:', err);
        this.globalData.openId = 'mock_openid_' + Math.random().toString(36).substr(2, 9);
        console.log('使用模拟openId:', this.globalData.openId);
      }
    });
  },

  globalData: {
    openId: '',
    userInfo: { nickName: '玩家', avatarUrl: '' }
  },

  mockQuestions: [
    { type: 'truth', content: '💭 真心话：你做过最疯狂的事是什么？' },
    { type: 'truth', content: '💭 真心话：你暗恋过多少人？' },
    { type: 'truth', content: '💭 真心话：你最想改掉的坏习惯是什么？' },
    { type: 'truth', content: '💭 真心话：你有没有撒过谎？是什么谎？' },
    { type: 'truth', content: '💭 真心话：你最害怕什么？' },
    { type: 'truth', content: '💭 真心话：你最喜欢的人是谁？' },
    { type: 'truth', content: '💭 真心话：你最后悔的一件事是什么？' },
    { type: 'truth', content: '💭 真心话：如果能重来，你会改变什么？' },
    { type: 'truth', content: '💭 真心话：你最尴尬的经历是什么？' },
    { type: 'truth', content: '💭 真心话：你偷偷做过什么坏事？' },
    { type: 'truth', content: '💭 真心话：你对谁有过好感但没说？' },
    { type: 'truth', content: ' 真心话：你最大的秘密是什么？' },
    { type: 'dare', content: '🎲 大冒险：学青蛙跳一圈' },
    { type: 'dare', content: '🎲 大冒险：表演一段舞蹈' },
    { type: 'dare', content: '🎲 大冒险：给通讯录第一个人打电话' },
    { type: 'dare', content: '🎲 大冒险：模仿一种动物的叫声' },
    { type: 'dare', content: '🎲 大冒险：说出自己的三个缺点' },
    { type: 'dare', content: '🎲 大冒险：用屁股写字' },
    { type: 'dare', content: '🎲 大冒险：做10个俯卧撑' },
    { type: 'dare', content: '🎲 大冒险：唱一首歌给在场的人听' },
    { type: 'dare', content: '🎲 大冒险：对左边的人说一句真心话' },
    { type: 'dare', content: '🎲 大冒险：做一个鬼脸并保持10秒' },
    { type: 'dare', content: '🎲 大冒险：用方言读一段话' },
    { type: 'dare', content: '🎲 大冒险：和右边的人击掌并说"你好"' }
  ],

  mockRooms: [
    {
      _id: 'mock_room_1',
      roomName: '欢乐聚会',
      description: '一起来玩真心话大冒险吧！',
      creatorId: 'mock_user_1',
      createTime: new Date().toISOString(),
      status: 'waiting',
      maxPlayers: 6,
      password: '',
      bannedUsers: [],
      shareCount: 3,
      participants: [
        { openId: 'mock_user_1', nickName: '小明', questionText: '💭 真心话：你做过最疯狂的事是什么？', timestamp: new Date().toISOString() }
      ]
    },
    {
      _id: 'mock_room_2',
      roomName: '深夜真心话',
      description: '深夜聊聊天',
      creatorId: 'mock_user_2',
      createTime: new Date().toISOString(),
      status: 'waiting',
      maxPlayers: 4,
      password: '1234',
      bannedUsers: [],
      shareCount: 1,
      participants: []
    },
    {
      _id: 'mock_room_3',
      roomName: '大冒险专场',
      description: '敢来挑战吗？',
      creatorId: 'mock_user_3',
      createTime: new Date().toISOString(),
      status: 'waiting',
      maxPlayers: 8,
      password: '',
      bannedUsers: [],
      shareCount: 5,
      participants: [
        { openId: 'mock_user_3', nickName: '小红', questionText: '🎲 大冒险：学青蛙跳一圈', timestamp: new Date().toISOString() },
        { openId: 'mock_user_4', nickName: '小李', questionText: '🎲 大冒险：表演一段舞蹈', timestamp: new Date().toISOString() }
      ]
    }
  ]
});