# Idris for Visual Studio Code

[![Build Status](https://travis-ci.org/zjhmale/vscode-idris.svg?branch=master)](https://travis-ci.org/zjhmale/vscode-idris)
[![Build Status](https://ci.appveyor.com/api/projects/status/github/zjhmale/vscode-idris?branch=master&svg=true)](https://ci.appveyor.com/project/zjhmale/vscode-idris)
![status](https://img.shields.io/badge/status-0.3.2-green.svg)

## Implemented features

[screenshots](https://github.com/zjhmale/vscode-idris/blob/master/features.md)

| command | shortcut |
|---|---|
| Typechecking | shift + cmd/ctrl + t |
| Show the types of a variable | shift + cmd/ctrl + o |
| Show the doc for a variable | shift + cmd/ctrl + d |
| Show the doc for a definition | shift + cmd/ctrl + f |
| Show holes | shift + cmd/ctrl + h |
| Add clause | shift + cmd/ctrl + a |
| Split case | shift + cmd/ctrl + c |
| Search proof | shift + cmd/ctrl + s |
| Make with | shift + cmd/ctrl + w |
| Make case | shift + cmd/ctrl + m |
| Make lemma | shift + cmd/ctrl + l |
| Apropos | shift + cmd/ctrl + k |
| Eval current line | shift + cmd/ctrl + e |
| Start / Refresh REPL | shift + cmd/ctrl + r |
| Send selection to REPL | shift + cmd/ctrl + x |

* ipkg highlighting
* autocompletion

## Installation

1. Within Visual Studio Code, open the command palette (Ctrl-Shift-P / Cmd-Shift-P).
2. Select `Install Extension` and search for 'Idris' or run `ext install Idris`.

## Acknowledgements

* Grammar file is taken from [idris-sublime](https://github.com/idris-hackers/idris-sublime).
* Internal design is inspired by [atom-language-idris](https://github.com/idris-hackers/atom-language-idris). 

## License

[BSD 3-Clause](https://opensource.org/licenses/BSD-3-Clause), the same as Idris.
