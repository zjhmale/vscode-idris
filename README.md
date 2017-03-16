# Idris for Visual Studio Code

[![Build Status](https://travis-ci.org/zjhmale/vscode-idris.svg?branch=master)](https://travis-ci.org/zjhmale/vscode-idris)
[![Build Status](https://ci.appveyor.com/api/projects/status/github/zjhmale/vscode-idris?branch=master&svg=true)](https://ci.appveyor.com/project/zjhmale/vscode-idris)
![status](https://img.shields.io/badge/status-0.3.1-green.svg)

## Implemented features

[screenshots](https://github.com/zjhmale/vscode-idris/blob/master/features.md)

| command | shortcut |
|---|---|
| Typechecking | shift + cmd/ctrl + t |
| Showing the types of a variable | shift + cmd/ctrl + o |
| Showing the doc for a variable | shift + cmd/ctrl + d |
| Showing the doc for a definition | shift + cmd/ctrl + f |
| Showing holes | shift + cmd/ctrl + h |
| Clause-adding | shift + cmd/ctrl + a |
| Case-splitting | shift + cmd/ctrl + c |
| Proof-search | shift + cmd/ctrl + s |
| Make-with | shift + cmd/ctrl + w |
| Make-case | shift + cmd/ctrl + m |
| Make-lemma | shift + cmd/ctrl + l |
| Apropos | shift + cmd/ctrl + k |
| Eval-line | shift + cmd/ctrl + e |

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
