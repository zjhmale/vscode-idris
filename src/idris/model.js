const IdrisIdeMode = require('./ide-mode')
const IdrisBuild = require('./idris-build')
const Rx = require('rx-lite')
const path = require('path')

class IdrisModel {
  constructor() {
    this.requestId = 0
    this.ideModeRef = null
    this.idrisBuildRef = null
    this.subjects = {}
    this.warnings = {}
    this.idrisBuildSubject = null
    this.compilerOptions = {}
  }

  ideMode(compilerOptions) {
    // Stop and nullify ideModeRef if it is already running but with
    // outdated options, so that it can be restarted.
    if (!this.ideModeRef) {
      this.ideModeRef = new IdrisIdeMode()
      this.ideModeRef.on('message', (obj) => { this.handleIdeModeCommand(obj) })
      this.ideModeRef.start(compilerOptions)
    }
    return this.ideModeRef
  }

  idrisBuild(compilerOptions, ipkgFile) {
    this.idrisBuildRef = new IdrisBuild(ipkgFile)
    this.idrisBuildRef.on('message', (obj) => { this.handleIdrisBuildCommand(obj) })
    this.idrisBuildRef.start(compilerOptions)
    return this.idrisBuildRef
  }

  objectEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }

  stop() {
    if (this.ideModeRef)
      this.ideModeRef.stop()
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

  handleIdrisBuildCommand(cmd) {
    this.idrisBuildSubject.onNext(cmd)
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

  getDirectory(uri) {
    if (this.compilerOptions && this.compilerOptions.src) {
      return this.compilerOptions.src
    } else {
      return path.dirname(uri)
    }
  }

  build(ipkgFile) {
    this.idrisBuildSubject = new Rx.Subject
    this.idrisBuild(this.compilerOptions, ipkgFile)
    return this.idrisBuildSubject
  }

  load(uri) {
    let dir = this.getDirectory(uri)
    let cd

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

  addProofClause(line, word) {
    return this.prepareCommand([':add-proof-clause', line, word])
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
