const IdrisProcessBase = require('./idris-process-base')

class IdrisRepl extends IdrisProcessBase {
  constructor() {
    super([], false)
  }

  send(cmd) {
    return this.process.stdin.write(cmd)
  }

  stdout(data) {
    this.emit('message', data)
  }
}

module.exports = IdrisRepl
