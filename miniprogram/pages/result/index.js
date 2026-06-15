Page({
  data: {
    statistics: {
      totalGames: 15,
      truthCount: 8,
      dareCount: 7,
      completionRate: 93
    },
    rankings: [
      { rank: 1, user: '小明', avatar: '👦', score: 150, truth: 5, dare: 4 },
      { rank: 2, user: '小红', avatar: '👧', score: 120, truth: 4, dare: 3 },
      { rank: 3, user: '小刚', avatar: '👨', score: 90, truth: 3, dare: 3 },
      { rank: 4, user: '小美', avatar: '👩', score: 60, truth: 2, dare: 2 },
      { rank: 5, user: '我', avatar: '👤', score: 45, truth: 2, dare: 1 }
    ],
    records: [
      { id: 1, type: 'truth', question: '你最尴尬的一件事是什么？', player: '小明', time: '今天 10:20' },
      { id: 2, type: 'dare', question: '模仿动物叫声', player: '小红', time: '今天 10:25' },
      { id: 3, type: 'truth', question: '你暗恋过多少人？', player: '小刚', time: '今天 10:30' }
    ]
  },

  goBack() {
    wx.navigateBack();
  }
});