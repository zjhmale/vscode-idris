let bennu     = require('bennu')
let parse     = bennu.parse
let text      = bennu.text
let lang      = bennu.lang
let nu_stream = require('nu-stream')
let stream    = nu_stream.stream

let streamToString = function(s) {
  return stream.toArray(s).join('')
}

let trueP = parse.next(text.string(':True'), parse.always(true))

let falseP = parse.next(text.string(':False'), parse.always(false))

let boolP = parse.either(trueP, falseP)

let integerP = parse.many1(text.digit).map(streamToString).map(function(s) {
  return parseInt(s, 10)
})

let quoteP = text.character('"')

let escapedP = parse.choice(parse.next(text.character('\\'), parse.always('\\')), parse.next(text.character('"'), parse.always('"')))

let stringLetterP = parse.token(function(c) {
  return c !== '"' && c !== '\\'
})

let stringEscapeP = parse.attempt(parse.next(text.character('\\'), escapedP))

let stringBackslashP = text.character('\\')

let stringCharP = parse.choice(stringLetterP, stringEscapeP, stringBackslashP)

let stringP = lang.between(quoteP, quoteP, parse.many(stringCharP)).map(streamToString)

let symbolStartP = text.character(':')

let symbolChar = text.noneOf(' )')

let symbolP = parse.next(symbolStartP, parse.many(symbolChar)).map(streamToString).map(function(symbol) {
  return ":" + symbol
})

let openP = text.character('(')

let closeP = text.character(')')

let sexpP = parse.rec(function(self) {
  var choices
  choices = parse.choice(boolP, integerP, stringP, symbolP, self)
  return lang.between(openP, closeP, lang.sepBy(text.space, choices)).map(stream.toArray)
})

module.exports = {
  trueP,
  falseP,
  integerP,
  stringCharP,
  stringP,
  symbolP,
  parse: function(input) {
    return parse.run(sexpP, input)
  }
}
