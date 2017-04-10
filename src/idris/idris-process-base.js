const formatter    = require('../wire/formatter')
const parser       = require('../wire/parser')
const ipkg         = require('../ipkg/ipkg')
const cp           = require('child_process')
const EventEmitter = require('events').EventEmitter
const vscode       = require('vscode')

class IdrisProcessBase extends EventEmitter {
  constructor(labels) {
    super()
    this.process = null
    this.buffer = ''
    this.labels = labels
  }

  start(compilerOptions) {
    if ((this.process == null) || !this.process.connected) {
      let pathToIdris = vscode.workspace.getConfiguration('idris').get('executablePath')

      let params = this.labels.concat(ipkg.getPkgOpts(compilerOptions))
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
    return this.process.stdin.write(formatter.serialize(cmd))
  }

  stop() {
    if (this.process != null) {
      this.process.kill()
    }
  }

  error(error) {
    let msg = error.code == 'ENOENT'
      ? "Couldn't find idris executable at \"" + error.path + "\""
      : error.message + '(' + error.code + ')'
    vscode.window.showErrorMessage(msg)
  }

  exited(code, signal) {
    if(signal == "SIGTERM") {
      let msg = "The idris compiler was closed"
      console.info(msg)
    } else {
      let short = "The idris compiler was closed or crashed"
      let long = signal
        ? "It was closed with the signal: " + signal
        : "It (probably) crashed with the error code: " + code
      vscode.window.showErrorMessage(short + " " + long)
    }
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

module.exports = IdrisProcessBase
