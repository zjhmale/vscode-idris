const IdrisProcessBase = require('./idris-process-base')

class IdrisIdeMode extends IdrisProcessBase {
  constructor() {
    super(['--ide-mode'])
  }
}

module.exports = IdrisIdeMode
