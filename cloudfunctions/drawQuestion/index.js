// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 预置题目数据
const questions = [
  { type: 'truth', content: '💭 真心话：你做过最疯狂的事是什么？' },
  { type: 'truth', content: '💭 真心话：你暗恋过多少人？' },
  { type: 'truth', content: '💭 真心话：你最想改掉的坏习惯是什么？' },
  { type: 'truth', content: '💭 真心话：你有没有撒过谎？是什么谎？' },
  { type: 'truth', content: '💭 真心话：你最害怕什么？' },
  { type: 'truth', content: '💭 真心话：你最喜欢的人是谁？' },
  { type: 'dare', content: '🎲 大冒险：学青蛙跳一圈' },
  { type: 'dare', content: '🎲 大冒险：表演一段舞蹈' },
  { type: 'dare', content: '🎲 大冒险：给通讯录第一个人打电话' },
  { type: 'dare', content: '🎲 大冒险：模仿一种动物的叫声' },
  { type: 'dare', content: '🎲 大冒险：说出自己的三个缺点' },
  { type: 'dare', content: '🎲 大冒险：用屁股写字' }
]

// 云函数入口函数
exports.main = async (event, context) => {
  const { type } = event || {} // 可选参数：'truth' 或 'dare'
  
  try {
    // 尝试从数据库获取题目
    let query = db.collection('questions')
    if (type === 'truth' || type === 'dare') {
      query = query.where({ type })
    }
    const result = await query.get()
    
    if (result.data && result.data.length > 0) {
      const randomIndex = Math.floor(Math.random() * result.data.length)
      return result.data[randomIndex]
    } else {
      // 如果数据库没有数据，使用预置数据
      let pool = questions
      if (type === 'truth' || type === 'dare') {
        pool = questions.filter(q => q.type === type)
      }
      const randomIndex = Math.floor(Math.random() * pool.length)
      return pool[randomIndex]
    }
  } catch (error) {
    console.error('从数据库获取题目失败:', error)
    // 如果数据库出错，使用预置数据
    let pool = questions
    if (type === 'truth' || type === 'dare') {
      pool = questions.filter(q => q.type === type)
    }
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }
}