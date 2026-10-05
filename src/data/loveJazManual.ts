export interface ManualSituation {
  id: string;
  situation: string;
  icon: string;
  whatToDo: string;
  whatNotToDo: string;
}

export interface RulePillar {
  key: string;
  name: string;
  icon: string;
  description: string;
}

export const LOVE_JAZ_SITUATIONS: ManualSituation[] = [
  {
    id: 'morning',
    situation: 'Morning',
    icon: '🌅',
    whatToDo: 'Say good morning, ask if she slept well, and wish her a good day.',
    whatNotToDo: 'Make her feel obligated to reply the moment she wakes up.',
  },
  {
    id: 'school-exams',
    situation: 'School / Exams',
    icon: '🎒',
    whatToDo: 'Remind her to eat and sleep. Tell her that her health and comfort matter more to you than her score.',
    whatNotToDo: 'Pressure her to get a high score.',
  },
  {
    id: 'when-shes-tired',
    situation: "When she's tired",
    icon: '🥀',
    whatToDo: 'Ask: "Do you want me to listen, or do you want me to help you solve it?"',
    whatNotToDo: 'Force her to cheer up immediately.',
  },
  {
    id: 'when-you-miss-her',
    situation: 'When you miss her',
    icon: '💖',
    whatToDo: 'Tell her directly. Send a cute message, voice note, photo, or a little "chuu."',
    whatNotToDo: 'Act cold on purpose just to see if she\'ll chase you.',
  },
  {
    id: 'when-she-feels-insecure',
    situation: 'When she feels insecure',
    icon: '🌌',
    whatToDo: 'Reassure her through both words and consistent actions.',
    whatNotToDo: 'Tell her she\'s "overthinking" and dismiss her feelings.',
  },
  {
    id: 'when-youre-busy',
    situation: "When you're busy",
    icon: '🤓',
    whatToDo: 'Let her know beforehand: "I\'ll be busy for a while, but I\'ll come back later."',
    whatNotToDo: 'Suddenly disappear for hours without explanation.',
  },
  {
    id: 'gaming',
    situation: 'Gaming',
    icon: '🎮',
    whatToDo: 'Play together and have fun, but keep enough time for school and real life.',
    whatNotToDo: 'Let gaming consume all your time together.',
  },
  {
    id: 'at-night',
    situation: 'At night',
    icon: '🌙',
    whatToDo: 'Encourage her to sleep, especially when she has school or an exam the next day.',
    whatNotToDo: 'Stay awake until morning just because neither of you wants to end the call.',
  },
  {
    id: 'when-something-bothers-you',
    situation: 'When something bothers you',
    icon: '💭',
    whatToDo: 'Explain what hurt you and focus on the specific action.',
    whatNotToDo: 'Attack her character, threaten to break up, or deliberately hurt her back.',
  },
  {
    id: 'trust',
    situation: 'Trust',
    icon: '🔒',
    whatToDo: 'Keep the promise of no unnecessary lying or hiding important things. If something happens, talk about it.',
    whatNotToDo: 'Try to control who she can talk to.',
  },
  {
    id: 'other-guys',
    situation: 'Other guys',
    icon: '👱',
    whatToDo: 'Distinguish between normal friendship and actual secrecy, lying, or crossing boundaries.',
    whatNotToDo: 'Treat every guy she talks to as a rival.',
  },
  {
    id: 'when-youre-jealous',
    situation: "When you're jealous",
    icon: '💖',
    whatToDo: 'Say: "I\'m feeling jealous because this situation made me insecure."',
    whatNotToDo: 'Interrogate her or demand that she cut everyone off.',
  },
  {
    id: 'after-a-mistake',
    situation: 'After a mistake',
    icon: '🩹',
    whatToDo: 'Give her a chance to rebuild trust through consistent actions.',
    whatNotToDo: 'Expect her to prove her love every single day.',
  },
  {
    id: 'during-an-argument',
    situation: 'During an argument',
    icon: '🗣️',
    whatToDo: 'Remember that the goal is to solve the problem, not to win.',
    whatNotToDo: 'Bring up every mistake from the past just to win the argument.',
  },
  {
    id: 'when-she-apologizes',
    situation: 'When she apologizes',
    icon: '🙏',
    whatToDo: 'If the apology is sincere and her behavior changes, learn to forgive.',
    whatNotToDo: 'Forgive her verbally but punish her with the same mistake forever.',
  },
  {
    id: 'when-youre-hurt',
    situation: "When you're hurt",
    icon: '🥶',
    whatToDo: 'It\'s okay to say: "I need some time to calm down, then we can talk."',
    whatNotToDo: 'Give her the silent treatment as punishment.',
  },
  {
    id: 'gifts',
    situation: 'Gifts',
    icon: '🎁',
    whatToDo: 'Give because you want to make each other happy, not because of gender roles or obligation.',
    whatNotToDo: 'Think that the boyfriend must always pay for everything.',
  },
  {
    id: 'showing-love',
    situation: 'Showing love',
    icon: '💖',
    whatToDo: 'Use both words and actions: affection, attention, remembering little things, and being there when she needs you.',
    whatNotToDo: 'Only say "I love you" while your actions say otherwise.',
  },
  {
    id: 'the-future',
    situation: 'The future',
    icon: '🏡',
    whatToDo: 'Talk about marriage and your future together as something you both dream about.',
    whatNotToDo: 'Use the future or marriage to pressure her into staying.',
  },
  {
    id: 'your-own-life',
    situation: 'Your own life',
    icon: '🌱',
    whatToDo: 'Keep studying, working toward your JLPT, taking care of yourself, seeing friends, and enjoying your hobbies.',
    whatNotToDo: 'Give up your own goals just to spend every moment with her.',
  },
  {
    id: 'the-relationship',
    situation: 'The relationship',
    icon: '👩‍❤️‍👨',
    whatToDo: 'Remember: you are two people who love each other, not one person living entirely around the other.',
    whatNotToDo: 'Assume that her being busy means she loves you less.',
  },
  {
    id: 'the-ultimate-goal',
    situation: 'The ultimate goal',
    icon: '💖',
    whatToDo: 'Make Jaz feel: "I am loved, respected, and safe enough to be honest with him."',
    whatNotToDo: 'Make her feel: "If I tell him the truth, he will punish me for it."',
  },
];

export const THE_FOUR_RULES: RulePillar[] = [
  {
    key: 'affection',
    name: 'Affection',
    icon: '💖',
    description: 'Say "I love you," give her chuu, hugs, cute nicknames, and affection.',
  },
  {
    key: 'trust',
    name: 'Trust',
    icon: '🔒',
    description: 'Keep your promises, and be honest when something goes wrong.',
  },
  {
    key: 'boundaries',
    name: 'Boundaries',
    icon: '🛡️',
    description: 'Both of you can have friends and personal space, but neither should turn important things into secrets.',
  },
  {
    key: 'independence',
    name: 'Independence',
    icon: '🌱',
    description: 'You should still be Emu with your own studies, JLPT, future, friends, hobbies, and dreams.',
  },
];
