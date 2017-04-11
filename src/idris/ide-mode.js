const formatter    = require('../wire/formatter')
const parser       = require('../wire/parser')
const IdrisProcessBase = require('./idris-process-base')

class IdrisIdeMode extends IdrisProcessBase {
  constructor() {
    super(['--ide-mode'])
  }

  send(cmd) {
    return this.process.stdin.write(formatter.serialize(cmd))
  }

  stdout(data) {
    this.buffer += data
    while (this.buffer.length > 6) {
      this.buffer = this.buffer.trimLeft().replace(/\r\n/g, "\n")
      let len = parseInt(this.buffer.substr(0, 6), 16)
      if (this.buffer.length >= 6 + len) {
        let cmd = this.buffer.substr(6, len).trim()
        this.buffer = this.buffer.substr(6 + len)
        let obj = parser.parse(cmd.trim())
        this.emit('message', obj)
      } else {
        break
      }
    }
  }
}

module.exports = IdrisIdeMode
