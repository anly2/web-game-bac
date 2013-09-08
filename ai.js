entropy = true;

sBulls = symbolBulls;
sCows  = symbolCows;

possible = new Array();
possible[0] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
possible[1] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
possible[2] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
possible[3] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];


if(entropy){
   possible[0].shuffle();
   possible[1].shuffle();
   possible[2].shuffle();
   possible[3].shuffle();
}

Object.prototype.isAttempt = function ()
{
   if (typeof this.number == "number" || typeof this.number == "string")
   if (typeof this.result != "undefined")
   //if (typeof this.result.bulls == "number" && typeof this.result.cows == "number")
      return true;

   return false;
}
Object.prototype.res = function ()
{
   return sBulls.repeat(this.result.bulls) + sCows.repeat(this.result.cows);
}

Object.prototype.isPossible = function (num)
{
   if (!this.isAttempt()) return;

   var common = num.toString().replace(eval("/[^"+this.number+"]/g"), "");
   if(common.length > this.res().length)
      return false;

   var samePos = 0;

   var i;
   for(i=0; i<num.length; i++)
      if(num.charAt(i) == this.number.charAt(i))
         samePos++;

   if(samePos > this.result.bulls)
      return false;

   return true;
}
Object.prototype.test = function (num)
{
   num = num.toString();

   var bulls = 0;
   var cows = 0;

   var i;
   for(i=0; i<4; i++){
      if(this.number.charAt(i) == num.charAt(i))
         bulls++;
      else
      if(this.number.indexOf( num.charAt(i) ) != -1)
         cows++;
   }

   var res = '';
   res += sBulls.repeat(bulls);
   res += sCows.repeat(cows);

   return res;
}

function suggest (previous)
{
   //Previous must be an array of (Attempt) objects containing the number tryed and the result
   //example: [ {num: 1234, res: 'XX'}, {num: 2156, res: 'XX'}, ... ]

   var cur = '';
   var discarded = new Array();

   var n;
//      for(n=0; n<4; n++){
   pickupDigit: while( (n = cur.length) < 4 ){
      //Get a digit for the n-th position
      var chosen = false;
      var tries  = new Array();

      //Get a digit from the previous attempts
      var t;
      lookupAttempts: for(t = previous.length-1;  t>=0;  t--){
         var p;
         cycleDigits: for(p=0; p<4; p++){
            //We have a digit, test it
            var digit = previous[t].number.charAt(p);

            if(cur.indexOf(digit) != -1)
               continue;

            if(possible[n].indexOf(parseInt(digit)) == -1)
               continue;

            if(discarded.indexOf( cur+digit ) != -1)
               continue;

            var tt;
            testagainstAttempts: for(tt = previous.length-1;  tt>=0;  tt--){
               if(previous[tt].isPossible( cur+digit ))
                  continue testagainstAttempts;

               discarded.push( cur+digit );
               continue cycleDigits;
            }

            chosen = digit;
            break lookupAttempts;
         }
      }

      if(chosen === false){
         var d;
         for(d=0;  d < possible[n].length;  d++){
            var digit = possible[n][d];

            if(cur.indexOf(digit) != -1)
               continue;

               //Log in case no number is eligible, should pick the first to end the misery
               tries.push(digit);

            if(discarded.indexOf( cur+digit ) != -1)
               continue;

            chosen = digit;
            break;
         }
      }

      //Add to discarded and start all over, as this is obviously a wrong number
      if(chosen === false){
         discarded.push( cur );
         cur = '';
         continue;
      }

      //Test if it can actually be this number
      if( (cur+chosen).length == 4){
         testagainstAttempts: for(t = previous.length-1;  t>=0;  t--){
            var attmp = previous[t];
            if(attmp.test( (cur+chosen) ) != attmp.res()){
               discarded.push( (cur+chosen) );
               cur = '';
               continue pickupDigit;
            }
         }
      }

      cur += chosen;
   }

   return cur;
}