import { Task } from '@/types/game';

// 大冒险任务库
export const tasks: Task[] = [
  {
    id: '1',
    content: '给在场第一个人发一条"我爱你"的消息',
    type: 'dare',
    difficulty: 'hard'
  },
  {
    id: '2',
    content: '模仿在场某个人的动作或表情',
    type: 'dare',
    difficulty: 'medium'
  },
  {
    id: '3',
    content: '唱一首歌的前两句',
    type: 'dare',
    difficulty: 'easy'
  },
  {
    id: '4',
    content: '做10个俯卧撑',
    type: 'dare',
    difficulty: 'medium'
  },
  {
    id: '5',
    content: '给在场某个人一个拥抱',
    type: 'dare',
    difficulty: 'medium'
  },
  {
    id: '6',
    content: '跳一段30秒的舞蹈',
    type: 'dare',
    difficulty: 'hard'
  },
  {
    id: '7',
    content: '说出在场每个人的一个优点',
    type: 'dare',
    difficulty: 'easy'
  },
  {
    id: '8',
    content: '用手机给在场某个人拍一张搞怪照片',
    type: 'dare',
    difficulty: 'medium'
  },
  {
    id: '9',
    content: '模仿动物的叫声',
    type: 'dare',
    difficulty: 'easy'
  },
  {
    id: '10',
    content: '给在场某个人按摩肩膀1分钟',
    type: 'dare',
    difficulty: 'medium'
  },
  {
    id: '11',
    content: '说出自己最害怕的三样东西',
    type: 'dare',
    difficulty: 'easy'
  },
  {
    id: '12',
    content: '用方言说一段话',
    type: 'dare',
    difficulty: 'medium'
  },
  {
    id: '13',
    content: '做鬼脸让大家拍照',
    type: 'dare',
    difficulty: 'easy'
  },
  {
    id: '14',
    content: '给在场某个人讲一个笑话',
    type: 'dare',
    difficulty: 'medium'
  },
  {
    id: '15',
    content: '用手机给在场某个人打一个电话，说"我想你了"',
    type: 'dare',
    difficulty: 'hard'
  }
];

// 随机获取一个任务
export const getRandomTask = (): Task => {
  const randomIndex = Math.floor(Math.random() * tasks.length);
  return tasks[randomIndex];
};