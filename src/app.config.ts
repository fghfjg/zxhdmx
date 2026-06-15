export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/room/index',
    'pages/game/index',
    'pages/message/index',
    'pages/result/index',
    'pages/leaderboard/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#667eea',
    navigationBarTitleText: '真心话大冒险',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#7F8C8D',
    selectedColor: '#667eea',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/room/index',
        text: '房间'
      },
      {
        pagePath: 'pages/leaderboard/index',
        text: '排行'
      }
    ]
  }
})
