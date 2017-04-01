let IdrisModel = require('./model')
let vscode     = require('vscode')

let model = null
let outputChannel = vscode.window.createOutputChannel('Idris')
let replChannel = vscode.window.createOutputChannel('Idris REPL')
let aproposChannel = vscode.window.createOutputChannel('Idris Apropos')
let diagnosticCollection = vscode.languages.createDiagnosticCollection()
let term = null
let compilerOptions

let getSafeRoot = () => {
  let root = vscode.workspace.rootPath
  let safeRoot = root === undefined ? "" : root
  return safeRoot
}

let init = (compilerOptions) => {
  if (compilerOptions) {
    this.compilerOptions = compilerOptions
    model.setCompilerOptions(compilerOptions)
  } else {
    vscode.window.showErrorMessage("Can not get compiler options for current project")
  }
}

let initialize = (compilerOptions) => {
  if (!model) {
    model = new IdrisModel()
  }
  init(compilerOptions)
}

let reInitialize = (compilerOptions) => {
  model = new IdrisModel()
  init(compilerOptions)
}

let getModel = () => {
  return model
}

let showLoading = () => {
  outputChannel.clear()
  outputChannel.show()
  outputChannel.append("loading...")
}

let getCurrentPosition = () => {
  let editor = vscode.window.activeTextEditor
  let document = editor.document
  document.save()
  let position = editor.selection.active
  return [document, position]
}

let getWordBase = (document, position, isHover) => {
  let wordRange = document.getWordRangeAtPosition(position, /'?\w+'?/i)
  let currentWord = document.getText(wordRange)
  if (currentWord.match(/\r|\n| /g)) {
    outputChannel.clear()
    if (!isHover) {
      vscode.window.showWarningMessage("Please move cursor to an Identifier")
    }
    return [null, null]
  } else {
    return [currentWord, wordRange]
  }
}

getWord = () => {
  let [document, position] = getCurrentPosition()
  return getWordBase(document, position, false)[0]
}

let typecheckFile = (uri) => {
  let successHandler = (_) => {
    outputChannel.clear()
    outputChannel.show()
    outputChannel.append("Idris: File loaded successfully")
    diagnosticCollection.clear()
    destroy()
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
    //let highlightingInfo = arg.msg[1]
    outputChannel.clear()
    outputChannel.show()
    outputChannel.appendLine('Idris: ' + cmdMsgs[cmd] + ' ' + currentWord)
    outputChannel.append(info.replace(/\n    \n    /g, "").replace(/\n        \n        /g, ""))
    diagnosticCollection.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      switch (cmd) {
        case 'type':
          return model.getType(currentWord)
        case 'docs':
          return model.getDocs(currentWord)
        case 'definition':
          return model.printDefinition(currentWord)
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

/*
let idrisAscii = (version) => {
  return [
    "    ____    __     _"
  , "   /  _/___/ /____(_)____"
  , "   / // __  / ___/ / ___/     Version " + version
  , " _/ // /_/ / /  / (__  )      http://www.idris-lang.org/"
  , "/___/\_____/_/  /_/____/       Type :? for help"
  , ""
  ]
}
*/

let evalSelection = (uri) => {
  let editor = vscode.window.activeTextEditor
  let selection = editor.selection
  let text = editor.document.getText(selection)

  let successHandler = (arg) => {
    let result = arg.msg[0]
    //let highlightingInfo = arg.msg[1]

    outputChannel.clear()
    diagnosticCollection.clear()
    replChannel.clear()
    replChannel.show()

    model.getVersion().subscribe((arg) => {
      let version = arg.msg[0][0].join(".")
      //replChannel.appendLine(idrisAscii(version).join('\n'))
      replChannel.appendLine("Type checking " + uri + "\n")
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

let startup = (uri) => {
  term = vscode.window.createTerminal("Idris REPL")
  term.sendText("idris")
  term.sendText(`:l ${uri}`)
  term.show()
}

let startREPL = (uri) => {
  if (term == null) {
    startup(uri)
  } else {
    term.hide()
    term.dispose()
    startup(uri)
  }
}

let sendREPL = (uri) => {
  let editor = vscode.window.activeTextEditor
  let selection = editor.selection
  let text = editor.document.getText(selection)

  if (term == null) {
    startup(uri)
  }

  term.show()
  term.sendText(text)
}

let addClause = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor 
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let clause = arg.msg[0] + "\n"
    editor.edit((edit) => {
      edit.insert(new vscode.Position(line + 1, 0), line + 1 == editor.document.lineCount ? "\n" + clause : clause)
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

let proofSearch = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line
  let position = editor.selection.active
  let wordRange = editor.document.getWordRangeAtPosition(position)

  let successHandler = (arg) => {
    let res = arg.msg[0]
    editor.edit((edit) => {
      let start = new vscode.Position(wordRange.start.line, wordRange.start.character - 1)
      let end = wordRange.end
      edit.replace(new vscode.Range(start, end), res)
    })

    outputChannel.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.proofSearch(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let makeWith = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let clause = arg.msg[0]
    editor.edit((edit) => {
      let start = new vscode.Position(line, 0)
      let end = new vscode.Position(line + 1, 0)
      edit.replace(new vscode.Range(start, end), clause)
    })

    outputChannel.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.makeWith(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let makeCase = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let clause = arg.msg[0]
    editor.edit((edit) => {
      let start = new vscode.Position(line, 0)
      let end = new vscode.Position(line + 1, 0)
      edit.replace(new vscode.Range(start, end), clause)
    })

    outputChannel.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.makeCase(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let makeLemma = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line
  let position = editor.selection.active
  let wordRange = editor.document.getWordRangeAtPosition(position)

  let successHandler = (arg) => {
    let lemty = arg.msg[0]
    let param1 = arg.msg[1]
    let param2 = arg.msg[2]
    if (lemty == ':metavariable-lemma') {
      editor.edit((edit) => {
        let start = new vscode.Position(wordRange.start.line, wordRange.start.character - 1)
        let end = wordRange.end
        edit.replace(new vscode.Range(start, end), param1[1])

        while (line > 0) {
          if (editor.document.lineAt(line).isEmptyOrWhitespace) break
          line--
        }
        edit.insert(new vscode.Position(line + 1, 0), param2[1] + "\n\n")
      })
    }

    outputChannel.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.makeLemma(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let apropos = (uri) => {
  vscode.window.showInputBox({prompt: 'Idris: Apropos'}).then(val => {
    let successHandler = (arg) => {
      let result = arg.msg[0]
      //let highlightingInfo = arg.msg[1]

      outputChannel.clear()
      diagnosticCollection.clear()
      aproposChannel.clear()
      aproposChannel.show()
      aproposChannel.appendLine(result)
    }

    new Promise((resolve, reject) => {
      model.load(uri).filter((arg) => {
        return arg.responseType === 'return'
      }).flatMap(() => {
        return model.apropos(val)
      }).subscribe(successHandler, displayErrors)
      showLoading()
      resolve()
    }).then(function () {
    }).catch(function () {
    })
  });
}

let displayErrors = (err) => {
  replChannel.clear()
  aproposChannel.clear()
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
  if(model != null) {
    model.stop()
    model = null
  }
}

module.exports = {
  getModel,
  diagnosticCollection,
  initialize,
  reInitialize,
  typecheckFile,
  typeForWord,
  docsForWord,
  printDefinition,
  showHoles,
  addClause,
  caseSplit,
  proofSearch,
  makeWith,
  makeCase,
  makeLemma,
  apropos,
  evalSelection,
  destroy,
  startREPL,
  sendREPL,
  getWordBase,
  getSafeRoot
}
