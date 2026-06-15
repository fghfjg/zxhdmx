import { Question } from '@/types/game';

// 真心话问题库
export const questions: Question[] = [
  {
    id: '1',
    content: '你最尴尬的经历是什么？',
    type: 'truth',
    difficulty: 'medium'
  },
  {
    id: '2',
    content: '你有没有暗恋过在场的人？',
    type: 'truth',
    difficulty: 'hard'
  },
  {
    id: '3',
    content: '你最害怕失去什么？',
    type: 'truth',
    difficulty: 'medium'
  },
  {
    id: '4',
    content: '你做过最勇敢的事情是什么？',
    type: 'truth',
    difficulty: 'easy'
  },
  {
    id: '5',
    content: '你最大的秘密是什么？',
    type: 'truth',
    difficulty: 'hard'
  },
  {
    id: '6',
    content: '你最喜欢在场哪个人？为什么？',
    type: 'truth',
    difficulty: 'hard'
  },
  {
    id: '7',
    content: '你最想实现的愿望是什么？',
    type: 'truth',
    difficulty: 'easy'
  },
  {
    id: '8',
    content: '你有没有撒过谎？最大的谎言是什么？',
    type: 'truth',
    difficulty: 'medium'
  },
  {
    id: '9',
    content: '你最讨厌什么样的行为？',
    type: 'truth',
    difficulty: 'easy'
  },
  {
    id: '10',
    content: '你觉得自己最大的优点和缺点是什么？',
    type: 'truth',
    difficulty: 'medium'
  },
  {
    id: '11',
    content: '你最难忘的一次旅行是哪里？为什么？',
    type: 'truth',
    difficulty: 'easy'
  },
  {
    id: '12',
    content: '你有没有做过后悔的事情？',
    type: 'truth',
    difficulty: 'medium'
  },
  {
    id: '13',
    content: '你最想对在场某个人说什么？',
    type: 'truth',
    difficulty: 'hard'
  },
  {
    id: '14',
    content: '你最喜欢的电影是什么？为什么？',
    type: 'truth',
    difficulty: 'easy'
  },
  {
    id: '15',
    content: '你觉得自己十年后会在做什么？',
    type: 'truth',
    difficulty: 'medium'
  }
];

// 随机获取一个问题
export const getRandomQuestion = (): Question => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};