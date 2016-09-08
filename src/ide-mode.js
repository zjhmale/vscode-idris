let formatter    = require('./wire/formatter')
let parser       = require('./wire/parser')
let cp           = require('child_process')
let EventEmitter = require('events').EventEmitter

var buffer = ''

class IdrisIdeMode extends EventEmitter {
  constructor() {
    super()
    this.process = null
    this.buffer = ''
  }

  start(compilerOptions) {
    if ((this.process == null) || !this.process.connected) {
      let pathToIdris = 'idris'
      let pkgs = compilerOptions.pkgs && compilerOptions.pkgs.length ? (p = compilerOptions.pkgs.map((p) => {
        return ["-p", p]
      }), [].concat.apply([], p)) : []
      let params = ['--ide-mode'].concat(pkgs, compilerOptions.options ? compilerOptions.options.split(' ') : [])
      let options = compilerOptions.src ? {
        cwd: compilerOptions.src
      } : {}

      this.process = cp.spawn(pathToIdris, params, options)

      this.process.on('error', this.error)
      this.process.on('exit', this.exited)
      this.process.on('close', this.exited)
      this.process.on('disconnect', this.exited)

      if (this.process.pid) {
        this.process.stdout.setEncoding('utf8').on('data', (data) => { this.stdout(data) })
      }
    }
  }

  send(cmd) {
    console.log("send command => " + cmd)
    return this.process.stdin.write(formatter.serialize(cmd))
  }

  stop() {
    if (this.process != null) {
      this.process.kill()
    }
  }

  error(error) {
    vscode.window.showErrorMessage('Cannot find Idris.')
  }

  exited(code, signal) {
    vscode.window.showErrorMessage('The idris compiler was closed or crashed.')
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
