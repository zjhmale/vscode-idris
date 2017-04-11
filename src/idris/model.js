const IdrisIdeMode = require('./ide-mode')
const IdrisRepl = require('./idris-repl')
const Rx = require('rx-lite')
const path = require('path')

class IdrisModel {
  constructor() {
    this.requestId = 0
    this.ideModeRef = null
    this.idrisReplRef = null
    this.subjects = {}
    this.warnings = {}
    this.compilerOptions = {}
    this.oldCompilerOptions = {}
  }

  ideMode(compilerOptions) {
    if (this.ideModeRef && !this.objectEqual(this.oldCompilerOptions, compilerOptions)) {
      this.ideModeRef.stop()
    }
    if (!this.ideModeRef) {
      this.ideModeRef = new IdrisIdeMode()
      this.ideModeRef.on('message', (obj) => { this.handleIdeModeCommand(obj) })
      this.ideModeRef.start(compilerOptions)
      this.oldCompilerOptions = compilerOptions
    }
    return this.ideModeRef
  }

  idrisRepl(compilerOptions) {
    if (this.ideModeRef && !this.objectEqual(this.oldCompilerOptions, compilerOptions)) {
      this.idrisReplRef.stop()
    }
    if (!this.ideModeRef) {
      this.idrisReplRef = new IdrisRepl()
      this.idrisReplRef.on('message', (obj) => { this.handleIdrisReplCommand(obj) })
      this.idrisReplRef.start(compilerOptions)
      this.oldCompilerOptions = compilerOptions
    }
    return this.idrisReplRef
  }

  objectEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }

  stop() {
    if (this.ideModeRef)
      this.ideModeRef.stop()
    if (this.idrisReplRef)
      this.idrisReplRef.stop()
  }

  setCompilerOptions(options) {
    this.compilerOptions = options
  }

  prepareCommand(cmd) {
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

  handleIdrisReplCommand(cmd) {

  }

  handleIdeModeCommand(cmd) {
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
              subject.onError({
                message: ret[1],
                warnings: this.warnings[id],
                highlightInformation: ret[2],
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

  changeDirectory(dir) {
    return this.interpret(`:cd ${dir}`)
  }

  load(uri) {
    let dir, cd
    if (this.compilerOptions && this.compilerOptions.src) {
      dir = this.compilerOptions.src
    } else {
      dir = path.dirname(uri)
    }

    if (dir != this.compilerOptions.src) {
      this.compilerOptions.src = dir
      cd = this.changeDirectory(dir).map((_) => {
        return dir
      })
    } else {
      cd = Rx.Observable.of(dir)
    }

    return cd.flatMap((_) => {
      return this.prepareCommand([':load-file', uri])
    })
  }

  getType(word) {
    return this.prepareCommand([':type-of', word])
  }

  getDocs(word) {
    return this.prepareCommand([':docs-for', word])
  }

  printDefinition(name) {
    return this.prepareCommand([':print-definition', name])
  }

  interpret(code) {
    return this.prepareCommand([':interpret', code])
  }

  getVersion() {
    return this.prepareCommand(':version')
  }

  holes(width) {
    return this.prepareCommand([':metavariables', width])
  }

  addClause(line, word) {
    return this.prepareCommand([':add-clause', line, word])
  }

  caseSplit(line, word) {
    return this.prepareCommand([':case-split', line, word])
  }

  proofSearch(line, word) {
    return this.prepareCommand([':proof-search', line, word, []])
  }

  makeWith(line, word) {
    return this.prepareCommand([':make-with', line, word])
  }

  makeLemma(line, word) {
    return this.prepareCommand([':make-lemma', line, word])
  }

  makeCase(line, word) {
    return this.prepareCommand([':make-case', line, word])
  }

  apropos(name) {
    return this.prepareCommand([':apropos', name])
  }

  replCompletions(word) {
    return this.prepareCommand([':repl-completions', word])
  }

  browseNamespace(moduleName) {
    return this.prepareCommand([':browse-namespace', moduleName])
  }
}

module.exports = IdrisModel
