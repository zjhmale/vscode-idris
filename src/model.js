let IdrisIdeMode = require('./ide-mode')
let Rx           = require('rx-lite')

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
    if (this.ideModeRef && !this.objectEqual(this.oldCompilerOptions, compilerOptions)) {
      this.ideModeRef.process.removeAllListeners()
      this.ideModeRef.stop()
      this.ideModeRef = null
    }
    if (!this.ideModeRef) {
      this.ideModeRef = new IdrisIdeMode()
      this.ideModeRef.on('message', (obj) => { this.handleCommand(obj) })
      let listenerEventsArr = this.ideModeRef.listeners('message');
      console.log(listenerEventsArr.length)
      this.ideModeRef.start(compilerOptions)
      this.oldCompilerOptions = compilerOptions
    }
    return this.ideModeRef
  }
  
  objectEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }

  stop() {
    this.ideModeRef.stop()
  }

  setCompilerOptions(options) {
    this.compilerOptions = options
  }

  prepareCommand(cmd) {
    console.log("prepare command")
    let id = this.getUID()
    let subject = new Rx.Subject
    this.subjects[id] = subject
    this.warnings[id] = []
    this.ideMode(this.compilerOptions).send([cmd, id])
    return subject
  }

  getUID() {
    return ++this.requestId
  }

  handleCommand(cmd) {
    if (cmd.length > 0) {
      let op = cmd[0]
      let params = cmd.slice(1, cmd.length - 1)
      let id = cmd[cmd.length - 1]
      if (this.subjects[id] != null) {
        let subject = this.subjects[id]
        switch (op) {
          case ':return':
            let ret = params[0]
            if (ret[0] === ':ok') {
              let okparams = ret[1]
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
              let message = ret[1]
              let highlightInformation = ret[2]
              console.log("ret => " + ret)            
              subject.onError({
                message: message,
                warnings: this.warnings[id],
                highlightInformation: highlightInformation,
                cwd: this.compilerOptions.src
              })
            }
            subject.onCompleted()
            delete this.subjects[id]
            break
          case ':write-string':
            let msg = params[0]
            subject.onNext({
              responseType: 'write-string',
              msg: msg
            })
            break
          case ':warning':
            let warning = params[0]
            this.warnings[id].push(warning)
            break
          case ':set-prompt':
            break
        }
      }
    }
  }

  load(uri) {
    return this.prepareCommand([':load-file', uri])
  }
}

module.exports = IdrisModel
