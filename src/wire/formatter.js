let isString = function(s) {
  return typeof s === 'string' || s instanceof String
}

let isSymbol = function(s) {
  return isString(s) && s.length > 0 && s[0] === ':' && s.indexOf(' ') === -1
}

let isBoolean = function(s) {
  return typeof s === 'boolean' || s instanceof Boolean
}

let serialize = function(obj) {
  var msg
  msg = formatSexp(obj) + '\n'
  return hexLength(msg) + msg
}

let hexLength = function(str) {
  var hex
  hex = str.length.toString(16)
  return Array(7 - hex.length).join('0') + hex
}

let formatSexp = function(sexp) {
  if (sexp instanceof Array) {
    return '(' + sexp.map(formatSexp).join(' ') + ')'
  } else if (isSymbol(sexp)) {
    return sexp
  } else if (isString(sexp)) {
    return '"' + sexp.trim() + '"'
  } else if (isBoolean(sexp)) {
    if (sexp) {
      return ':True'
    } else {
      return ':False'
    }
  } else {
    return sexp
  }
}

module.exports = {
  serialize: serialize,
  hexLength: hexLength,
  formatSexp: formatSexp
}