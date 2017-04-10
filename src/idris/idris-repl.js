const IdrisProcessBase = require('./idris-process-base')

class IdrisRepl extends IdrisProcessBase {
  constructor() {
    super([])
  }
}

module.exports = IdrisRepl
