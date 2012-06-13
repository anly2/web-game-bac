String.prototype.repeat = function( num )
{
    return new Array( num + 1 ).join( this );
}

Array.prototype.rand = function(){
   //Doesn't work if there are gaps in the array
   //return this[ Math.floor(Math.random()* (this.length + 1)) ];
   return this[this.random(1)];
}
Array.prototype.random = function(num_req) {
    var input = this;
    // Return key/keys for random entry/entries in the array
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/array_rand    // +   original by: Waldo Malqui Silva
    // *     example 1: array_rand( ['Kevin'], 1 );
    // *     returns 1: 0
    var indexes = [];
    var ticks = num_req || 1;    var checkDuplicate = function (input, value) {
        var exist = false,
            index = 0,
            il = input.length;
        while (index < il) {            if (input[index] === value) {
                exist = true;
                break;
            }
            index++;        }
        return exist;
    };

    if (Object.prototype.toString.call(input) === '[object Array]' && ticks <= input.length) {        while (true) {
            var rand = Math.floor((Math.random() * input.length));
            if (indexes.length === ticks) {
                break;
            }            if (!checkDuplicate(indexes, rand)) {
                indexes.push(rand);
            }
        }
    } else {        indexes = null;
    }

    return ((ticks == 1) ? indexes.join() : indexes);
}