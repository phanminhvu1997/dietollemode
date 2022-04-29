const generatorID = (prefixx) => {
  return `${prefixx}${Math.random().toString(36).substr(2, 9).slice(0, 5)}`
}
const handelize = (function() {
  var from = 'ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç\'{}´-+¿?.,;:[]*¨¡!=()&%$#/"_',
    //to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc                         ",
    to = ' ',
    mapping = {}
  for (var i = 0, j = from.length; i < j; i++ )
  //mapping[ from.charAt( i ) ] = to.charAt( i );
    mapping[ from.charAt( i ) ] = to
  return function( str ) {
    var ret = []
    for ( var i = 0, j = str.length; i < j; i++ ) {
      var c = str.charAt( i )
      // eslint-disable-next-line no-prototype-builtins
      if ( mapping.hasOwnProperty( str.charAt( i ) ) )
        ret.push( mapping[ c ] )
      else
        ret.push( c )
    }
    //return ret.join( '' );
    return ret.join( '' ).trim().replace( /[^-A-Za-z0-9]+/g, '-' ).toLowerCase()
  }
})()

export {
  generatorID,
  handelize,
}
