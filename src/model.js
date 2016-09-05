let IdrisIdeMode = require('./ide-mode')

class IdrisModel {
  constructor() {
    this.requestId = 0
    this.ideModeRef = null
    this.subjects = {}
    this.warnings = {}
    this.compilerOptions = {}
    this.oldCompilerOptions = {}
  }

  ideMode(compilerOptions) {
    if (this.ideModeRef && !JS.objectEqual(this.oldCompilerOptions, compilerOptions)) {
      this.ideModeRef.process.removeAllListeners()
      this.ideModeRef.stop()
      this.ideModeRef = null
    }
    if (!this.ideModeRef) {
      this.ideModeRef = new IdrisIdeMode()
      this.ideModeRef.on('message', this.handleCommand)
      this.ideModeRef.start(compilerOptions)
      this.oldCompilerOptions = compilerOptions
    }
    return this.ideModeRef
  }

  stop() {
    var ref
    return (ref = this.ideModeRef) != null ? ref.stop() : void 0
  }

  setCompilerOptions(options) {
    return this.compilerOptions = options
  }

  handleCommand(cmd) {
    /*
    var i, id, msg, okparams, op, params, ret, subject, warning
    if (cmd.length > 0) {
      op = cmd[0], params = 3 <= cmd.length ? slice.call(cmd, 1, i = cmd.length - 1) : (i = 1, []), id = cmd[i++]
      if (this.subjects[id] != null) {
        subject = this.subjects[id]
        switch (op) {
          case ':return':
            ret = params[0]
            if (ret[0] === ':ok') {
              okparams = ret[1]
              if (okparams[0] === ':metavariable-lemma') {
                subject.onNext({
                  responseType: 'return',
                  msg: okparams
                })
              } else {
                subject.onNext({
                  responseType: 'return',
                  msg: ret.slice(1)
                })
              }
            } else {
              subject.onError({
                message: ret[1],
                warnings: this.warnings[id],
                highlightInformation: ret[2]
              })
            }
            subject.onCompleted()
            return delete this.subjects[id]
          case ':write-string':
            msg = params[0]
            return subject.onNext({
              responseType: 'write-string',
              msg: msg
            })
          case ':warning':
            warning = params[0]
            return this.warnings[id].push(warning)
          case ':set-prompt':
            break
          default:
            return console.log(op, params)
        }
      }
    }
    */
  }

  getUID() {
    return ++this.requestId
  }

  load(uri) {
    this.ideMode(this.compilerOptions).send([':load-file', uri])
  }
}

module.exports = IdrisModel
