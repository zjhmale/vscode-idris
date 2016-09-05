let vscode     = require('vscode')
let cp = require('child_process')
let formatter    = require('./wire/formatter')
let parser       = require('./wire/parser')

/*let IdrisModel = require('./model')
let IdrisIdeMode = require('./ide-mode')
let formatter    = require('./wire/formatter')

let handleCommand = (cmd) => {
  console.log("cmd => " + cmd)
}

var model = new IdrisModel()
let ideModeRef = new IdrisIdeMode()
ideModeRef.on('message', handleCommand)
ideModeRef.start({})

let initialize = (compilerOptions) => {
  if (!model) {
    model = new IdrisModel()
  }
  return model.setCompilerOptions(compilerOptions)
}*/

let getCommands = () => {
  return [
    ['idris.typecheck', typecheckFile]
  ]
}

var buffer = ''

let handleCommand = (cmd) => {
  if (cmd.length > 0) {
    let op = cmd[0]
    let params = cmd.slice(1, cmd.length - 1)
    let id = cmd[cmd.length - 1]
    switch (op) {
      case ':return':
        let ret = params[0]
        if (ret[0] === ':ok') {
          let okparams = ret[1]
          console.log("ok => " + okparams)
        } else {
          //console.log("error message => " + ret[1])
          //console.log("highlight info => " + ret[2])
        }
      case ':write-string':
        let msg = params[0]
        //console.log("write string msg => " + msg)
      case ':warning':
        warning = params[0]
        console.log("warning => " + warning)
      case ':set-prompt':
        break
      default:
        //console.log(op, params)
    }
  }
}


let stdout = (data) => {
  buffer += data
  while (buffer.length > 6) {
    buffer = buffer.trimLeft().replace(/\r\n/g, "\n")
    let len = parseInt(buffer.substr(0, 6), 16)
    if (buffer.length >= 6 + len) {
      let cmd = buffer.substr(6, len).trim()
      buffer = buffer.substr(6 + len)
      let obj = parser.parse(cmd.trim())
			//console.log("obj => " + obj)
			handleCommand(obj)
      //results.push(emit('message', obj))
    } else {
      break
    }
  }
}

let typecheckFile = () => {
	let uri = vscode.window.activeTextEditor.document.uri.path
	let cwd = vscode.workspace.rootPath + "/src"
  console.log(uri)
  console.log(cwd)

	let uid = 1
	let cmd = [[':load-file', uri], 1]

	new Promise(function (resolve, reject) {
		let decoded = ''

  	let options = vscode.workspace.rootPath ? { cwd : vscode.workspace.rootPath + "/src" } : {}

  	let childProcess = cp.spawn('idris', ['--ide-mode'], options)

  	console.log(childProcess.pid)

  	childProcess.on('error', (error) => {
    	console.log(error)
    	vscode.window.showInformationMessage('Cannot hlint the haskell file.')
			resolve()
  	})

  	if (childProcess.pid) {
    	childProcess.stdout.setEncoding('utf8').on('data', (data) => {
      	decoded += data
      	//console.log("data => " + data)
        stdout(data)
				resolve()
    	})
    }

		console.log(formatter.serialize(cmd))
		childProcess.stdin.write(formatter.serialize(cmd))
  }).then(function (value) {
    console.log(value)    // => 'Async Hello world'
	}).catch(function (error) {
    console.log(error)
	})

  /*
  
  */
}

module.exports = {
  getCommands
}
