
module.exports = {
  unrenderedEmojiGlobal: /:([\w\d_?]+)(?:-(\d+))?:(?!\d+)/g,
  unrenderedEmoji: /:([\w\d_?]+)(?:-(\d+))?:(?!\d+)/,
  renderedEmoji: /<a?:[\w|\d_?]+:(\d*)>/,
  renderedEmojiGlobal: /<a?:[\w|\d_?]+:(\d*)>/g,
  emojiName: /([\w\d_?]+)(?:-(\d+))?/,
  userMention: /<@!?(\d+)>/
}
