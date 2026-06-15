Page({
  data: {
    gameType: '',
    questions: [
      '你最想重来的一件事是什么？',
      '你暗恋过多少人？',
      '你做过最疯狂的事是什么？',
      '你最讨厌自己的哪个缺点？',
      '如果可以拥有超能力，你想要什么？'
    ],
    dares: [
      '模仿一种动物的叫声',
      '用屁股写自己的名字',
      '跳一段搞笑的舞蹈',
      '给手机通讯录第3个人打电话',
      '喝一大杯水并做出夸张表情'
    ],
    currentQuestion: '',
    currentPlayer: { name: '小明', avatar: '👦' },
    isCompleting: false,
    completed: false
  },

  onLoad(options) {
    const type = options && options.type || 'truth';
    this.setData({ 
      gameType: type,
      currentQuestion: type === 'truth' 
        ? this.data.questions[Math.floor(Math.random() * this.data.questions.length)]
        : this.data.dares[Math.floor(Math.random() * this.data.dares.length)]
    });
  },

  startComplete() {
    this.setData({ isCompleting: true });
    setTimeout(() => {
      this.setData({ isCompleting: false, completed: true });
    }, 3000);
  },

  nextRound() {
    const type = this.data.gameType;
    this.setData({
      currentQuestion: type === 'truth' 
        ? this.data.questions[Math.floor(Math.random() * this.data.questions.length)]
        : this.data.dares[Math.floor(Math.random() * this.data.dares.length)],
      completed: false
    });
  },

  backToRoom() {
    wx.navigateBack();
  }
});