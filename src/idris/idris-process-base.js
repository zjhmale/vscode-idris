const ipkg = require('../ipkg/ipkg')
const cp = require('child_process')
const EventEmitter = require('events').EventEmitter
const vscode = require('vscode')

class IdrisProcessBase extends EventEmitter {
  constructor(labels, isBuild) {
    super()
    this.process = null
    this.buffer = ''
    this.labels = labels
    this.isBuild = isBuild
  }

  start(compilerOptions) {
    if ((this.process == null) || !this.process.connected) {
      let pathToIdris = vscode.workspace.getConfiguration('idris').get('executablePath')

      let params = this.isBuild ? this.labels : this.labels.concat(ipkg.getPkgOpts(compilerOptions))
      let options = compilerOptions.src ? {
        cwd: this.isBuild ? vscode.workspace.rootPath : compilerOptions.src
      } : {}

      this.process = cp.spawn(pathToIdris, params, options)

      if (!this.isBuild) {
        this.process.on('error', this.error)
        this.process.on('exit', this.exited)
        this.process.on('close', this.exited)
        this.process.on('disconnect', this.exited)
      }

      if (this.process.pid) {
        this.process.stdout.setEncoding('utf8').on('data', (data) => { this.stdout(data) })
      }
    }
  }

  stop() {
    if (this.process != null) {
      this.process.removeAllListeners()
      this.process.kill()
      this.process = null
    }
  }

  error(error) {
    let msg = error.code == 'ENOENT'
      ? "Couldn't find idris executable at \"" + error.path + "\""
      : error.message + '(' + error.code + ')'
    vscode.window.showErrorMessage(msg)
  }

  exited(code, signal) {
    if (signal == "SIGTERM") {
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

  send(cmd) {
    console.info(`send command: ${cmd}`)
  }

  stdout(data) {
    console.info(`on data: ${data}`)
  }
}

module.exports = IdrisProcessBase
