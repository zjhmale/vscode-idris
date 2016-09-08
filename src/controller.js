let vscode     = require('vscode')
let ipkg       = require('./ipkg')
let IdrisModel = require('./model')

let model = null
let outputChannel = vscode.window.createOutputChannel('Idris')
let diagnosticCollection = vscode.languages.createDiagnosticCollection()

let getCommands = () => {
  return [
    ['idris.typecheck', typecheckFile]
  ]
}

var buffer = ''

let initialize = (compilerOptions) => {
  if (!model) {
    model = new IdrisModel()
  }
  model.setCompilerOptions(compilerOptions);
}

let handleCommand = (cmd, cwd) => {
  if (cmd.length > 0) {
    let op = cmd[0]
    let params = cmd.slice(1, cmd.length - 1)
    let id = cmd[cmd.length - 1]
    switch (op) {
      case ':return':
      let ret = params[0]
      if (ret[0] === ':ok') {
        let okparams = ret[1]
        outputChannel.clear()
        outputChannel.show()
        outputChannel.append("Idris: File loaded successfull")
        diagnosticCollection.clear()
      } else {
        let message = ret[1]
        let warning = warnings[id]
        outputChannel.clear()
        outputChannel.show()
        diagnosticCollection.clear()
        let buf = []
        let diagnostics = []
        let len = warning.length
        buf.push("Errors (" + len + ")")
        warning.forEach(function(w) {
          let file = w[0].replace("./", cwd + "/")
          let line = w[1][0]
          let char = w[1][1]
          let message = w[3]
          buf.push(file + ":" + line + ":" + char)
          buf.push(message)
          buf.push("")
          if (line > 0) {
            let range = new vscode.Range(line - 1, char - 1, line, 0)
            let diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)
            diagnostics.push([vscode.Uri.file(file), [diagnostic]])          
          }
        })
        outputChannel.appendLine(buf.join('\n'))
        diagnosticCollection.set(diagnostics)
      }
      break
      case ':write-string':
      let msg = params[0]
      break
      case ':warning':
      warning = params[0]
      warnings[id].push(warning)
      break
      case ':set-prompt':
      break
    }
  }
}

let stdout = (data, cwd) => {
  buffer += data
  while (buffer.length > 6) {
    buffer = buffer.trimLeft().replace(/\r\n/g, "\n")
    let len = parseInt(buffer.substr(0, 6), 16)
    if (buffer.length >= 6 + len) {
      let cmd = buffer.substr(6, len).trim()
      buffer = buffer.substr(6 + len)
      let obj = parser.parse(cmd.trim())
      handleCommand(obj, cwd)
    } else {
      break
    }
  }
}

let initChildProcess = (resolve, params, options) => {
  let childProcess = cp.spawn('idris', params, options)
  childProcess.on('error', (error) => {
    vscode.window.showErrorMessage('Cannot find Idris.')
    resolve()
  })

  if (childProcess.pid) {
    childProcess.stdout.setEncoding('utf8').on('data', (data) => {
      stdout(data, options.cwd)
      resolve()
    })
  }
  return childProcess
}

let typecheckFile = () => {
  let root = vscode.workspace.rootPath
  let compilerOptions = ipkg.compilerOptions(root)
  compilerOptions.subscribe((compilerOptions) => {
    initialize(compilerOptions)
    let uri = vscode.window.activeTextEditor.document.uri.path
    let successHandler = (arg) => {
      outputChannel.clear()
      outputChannel.show()
      outputChannel.append("Idris: File loaded successfull")
      diagnosticCollection.clear()
    }
    console.log("type check file");    
    new Promise((resolve, reject) => {
      model.load(uri).filter((arg) => {
        return arg.responseType === 'return'
      }).subscribe(successHandler, displayErrors)
      outputChannel.clear()
      outputChannel.show()
      outputChannel.append("loading...")
      resolve()
    }).then(function () {
    }).catch(function () {
    })
  })

  /*let root = vscode.workspace.rootPath
  let compilerOptions = ipkg.compilerOptions(root)
  
  let uri = vscode.window.activeTextEditor.document.uri.path
  let uid = getUID()
  warnings[uid] = []
  let cmd = [[':load-file', uri], uid]
  
  compilerOptions.subscribe((compilerOptions) => {
    let pkgs = compilerOptions.pkgs && compilerOptions.pkgs.length ? (p = compilerOptions.pkgs.map((p) => {
        return ["-p", p]
    }), [].concat.apply([], p)) : []
    let parameters = ['--ide-mode'].concat(pkgs, compilerOptions.options ? compilerOptions.options.split(' ') : [])
    let options = compilerOptions.src ? {
      cwd: compilerOptions.src
    } : {}
    new Promise(function (resolve, reject) {
      if (!childProcess) childProcess = initChildProcess(resolve, parameters, options)
      childProcess.stdin.write(formatter.serialize(cmd))
      outputChannel.clear()
      outputChannel.show()
      outputChannel.append("loading...")
    }).then(function () {
    }).catch(function () {
    })
  })*/
}

let displayErrors = (err) => {
  let message = ret[1]
  let warning = warnings[id]
  outputChannel.clear()
  outputChannel.show()
  diagnosticCollection.clear()
  let buf = []
  let diagnostics = []
  let len = err.warnings.length
  buf.push("Errors (" + len + ")")
  err.warnings.forEach(function(w) {
    let file = w[0].replace("./", cwd + "/")
    let line = w[1][0]
    let char = w[1][1]
    let message = w[3]
    buf.push(file + ":" + line + ":" + char)
    buf.push(message)
    buf.push("")
    if (line > 0) {
      let range = new vscode.Range(line - 1, char - 1, line, 0)
      let diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)
      diagnostics.push([vscode.Uri.file(file), [diagnostic]])          
    }
  })
  outputChannel.appendLine(buf.join('\n'))
  diagnosticCollection.set(diagnostics)
}

module.exports = {
  getCommands,
  diagnosticCollection
}
