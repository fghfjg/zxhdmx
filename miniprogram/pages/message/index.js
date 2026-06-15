Page({
  data: {
    messages: [
      { id: 1, user: '小明', avatar: '👦', content: '今天玩得好开心！', time: '10:30', likes: 5, laughed: 3 },
      { id: 2, user: '小红', avatar: '👧', content: '那个大冒险太搞笑了😂', time: '10:32', likes: 8, laughed: 6 },
      { id: 3, user: '小刚', avatar: '👨', content: '下次还要一起玩！', time: '10:35', likes: 3, laughed: 1 }
    ],
    inputText: ''
  },

  inputMessage(e) {
    this.setData({ inputText: e.detail.value });
  },

  sendMessage() {
    if (!this.data.inputText.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    const newMessage = {
      id: Date.now(),
      user: '我',
      avatar: '👤',
      content: this.data.inputText,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      laughed: 0
    };
    this.setData({
      messages: [...this.data.messages, newMessage],
      inputText: ''
    });
  },

  likeMessage(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      messages: this.data.messages.map(msg => 
        msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg
      )
    });
  },

  laughMessage(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      messages: this.data.messages.map(msg => 
        msg.id === id ? { ...msg, laughed: msg.laughed + 1 } : msg
      )
    });
  }
});