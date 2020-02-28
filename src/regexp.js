
module.exports = {
  unrenderedEmojiGlobal: /:([\w?]+)(?:-(\d+))?:(?!\d+)/g,
  unrenderedEmoji: /:([\w?]+)(?:-(\d+))?:(?!\d+)/,
  renderedEmoji: /<a?:[\w?]+:(\d*)>/,
  renderedEmojiGlobal: /<a?:[\w?]+:(\d*)>/g,
  emojiName: /([\w?]+)(?:-(\d+))?/,
  userMention: /<@!?(\d+)>/,
};
