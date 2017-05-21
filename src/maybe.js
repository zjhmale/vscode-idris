//http://jrsinclair.com/articles/2016/marvellously-mysterious-javascript-maybe-monad/

const Maybe = module.exports = function (val) {
  this.__value = val
}

Maybe.of = function (val) {
  return new Maybe(val)
}

Maybe.prototype.isNothing = function () {
  return (this.__value === null || this.__value === undefined)
}

Maybe.prototype.map = function (f) {
  if (this.isNothing()) {
    return Maybe.of(null)
  }
  return Maybe.of(f(this.__value))
}

Maybe.prototype.foreach = function (f) {
  if (!this.isNothing()) {
    f(this.__value)
  }
}

Maybe.prototype.orElse = function (d) {
  if (this.isNothing()) {
    return Maybe.of(d)
  }

  return this
}

Maybe.prototype.getOrElse = function (d) {
  if (this.isNothing()) {
    return d
  }

  return this.__value
}
