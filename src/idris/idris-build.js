const IdrisProcessBase = require('./idris-process-base')

class IdrisBuild extends IdrisProcessBase {
  constructor(ipkgFile) {
    super(["--build", ipkgFile], true)
  }

  stdout(data) {
    this.emit('message', data)
  }
}

module.exports = IdrisBuild
