let IdrisModel = require('./model')
let vscode     = require('vscode')

let model = null
let outputChannel = vscode.window.createOutputChannel('Idris')
let replChannel = vscode.window.createOutputChannel('Idris REPL')
let diagnosticCollection = vscode.languages.createDiagnosticCollection()

let initialize = (compilerOptions) => {
  if (!model) {
    model = new IdrisModel()
  }
  model.setCompilerOptions(compilerOptions);
}

let showLoading = () => {
    outputChannel.clear()
    outputChannel.show()
    outputChannel.append("loading...")
}

let getWord = () => {
  let editor = vscode.window.activeTextEditor
  let document = editor.document
  let position = editor.selection.active
  let wordRange = document.getWordRangeAtPosition(position)
  let currentWord = document.getText(wordRange)
  if (currentWord.match(/\r|\n| /g)) {
    outputChannel.clear()
    vscode.window.showWarningMessage("Please move cursor to an Identifier")
    return null
  } else {
    return currentWord
  }
}

let typecheckFile = (uri) => {
  let successHandler = (_) => {
    outputChannel.clear()
    outputChannel.show()
    outputChannel.append("Idris: File loaded successfull")
    diagnosticCollection.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let cmdMsgs = {
  type: 'Type of',
  docs: 'Docs for',
  definition: 'Definition of'
}

let getInfoForWord = (uri, cmd) => {
  let currentWord = getWord()
  if (!currentWord) return
  
  let successHandler = (arg) => {
    let info = arg.msg[0]
    let highlightingInfo = arg.msg[1]
    outputChannel.clear()
    outputChannel.show()
    outputChannel.appendLine('Idris: ' + cmdMsgs[cmd] + ' ' + currentWord)
    outputChannel.append(info)
    diagnosticCollection.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      switch (cmd) {
        case 'type':
          return model.getType(currentWord)
          break
        case 'docs':
          return model.getDocs(currentWord)
          break
        case 'definition':
          return model.printDefinition(currentWord)
          break
      }
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let typeForWord = (uri) => {
  getInfoForWord(uri, 'type')
}

let docsForWord = (uri) => {
  getInfoForWord(uri, 'docs')
}

let printDefinition = (uri) => {
  getInfoForWord(uri, 'definition')
}

let showHoles = (uri) => {
  let successHandler = (arg) => {
    let holes = arg.msg[0]
    let hs = holes.map(([name, premises, [type, _]]) => {
      let ps = premises.map(([name, type, _]) => {
        return `    ${ name } : ${ type }`
      })
      let conclusion = `${ name } : ${ type }`
      let divider = '-'.repeat(conclusion.length)
      return `${ name }\n${ ps.join('\n') }\n${ divider }\n${ conclusion }`
    })
    outputChannel.clear()
    outputChannel.show()
    outputChannel.appendLine('Idris: Holes')
    outputChannel.append(hs.join('\n'))
    diagnosticCollection.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.holes(80)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let idrisAscii = (version) => {
  return [
    "    ____    __     _"
  , "   /  _/___/ /____(_)____"
  , "   / // __  / ___/ / ___/     Version " + version
  , " _/ // /_/ / /  / (__  )      http://www.idris-lang.org/"
  , "/___/\_____/_/  /_/____/       Type :? for help"
  ]
} 

let runREPL = (uri) => {
  let editor = vscode.window.activeTextEditor
  let text = editor.document.lineAt(editor.selection.start).text

  let successHandler = (arg) => {
    let result = arg.msg[0]
    let highlightingInfo = arg.msg[1]
    
    outputChannel.clear()
    diagnosticCollection.clear()
    replChannel.clear()
    replChannel.show()
    
    model.getVersion().subscribe((arg) => {
      let version = arg.msg[0][0].join(".")
      replChannel.appendLine(idrisAscii(version).join('\n'))
      replChannel.appendLine("\nType checking " + uri + "\n")
      replChannel.appendLine("λΠ> " + text)
      replChannel.appendLine(result)
    }, displayErrors)
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.interpret(text)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let addClause = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor 
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let clause = arg.msg[0]
    editor.edit((edit) => {
      edit.insert(new vscode.Position(line + 1, 0), clause)
    })

    outputChannel.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.addClause(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let caseSplit = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor 
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let split = arg.msg[0]
    editor.edit((edit) => {
      let start = new vscode.Position(line, 0)
      let end = new vscode.Position(line + 1, 0)
      edit.replace(new vscode.Range(start, end), split)
    })

    outputChannel.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.caseSplit(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let displayErrors = (err) => {
  replChannel.clear()
  outputChannel.clear()
  outputChannel.show()
  diagnosticCollection.clear()
  let buf = []
  let diagnostics = []
  if (err.warnings) {
    let len = err.warnings.length
    buf.push("Errors (" + len + ")")
    err.warnings.forEach(function(w) {
      let file = w[0].replace("./", err.cwd + "/")
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
}

let destroy = () => {
  if(model != null) model.stop()
}

module.exports = {
  diagnosticCollection,
  initialize,
  typecheckFile,
  typeForWord,
  docsForWord,
  printDefinition,
  showHoles,
  addClause,
  caseSplit,
  runREPL,
  destroy
}
