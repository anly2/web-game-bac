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


function Attempt(num, res){
   this.number = num;
   this.num = num.toString();

   this.res = res.toString();
   this.result = {bulls: res.split(sBulls).length-1, cows: res.split(sCows).length-1};

   this.isPossible = function(num){
      var common = num.toString().replace(eval("/[^"+this.num+"]/g"), "");
      if(common.length > this.res.length)
         return false;

      var samePos = 0;
      var i;
      for(i=0; i<num.length; i++)
         if(num.charAt(i) == this.num.charAt(i))
            samePos++;
      if(samePos > this.result.bulls)
         return false;

      return true;
   }

   this.test = function(attmpt){
      if(typeof attmp != 'string' && !attmpt.toString)
         return;
      attmpt = attmpt.toString();

      var bulls = 0;
      var cows = 0;

      var i;
      for(i=0; i<attmpt.length; i++){
         if(this.num.charAt(i) == attmpt.charAt(i))
            bulls++;
         else
         if(this.num.indexOf( attmpt.charAt(i) ) != -1)
            cows++;
      }

      var res = '';
      res += sBulls.repeat(bulls);
      res += sCows.repeat(cows);

      return res;
   }

   return this;
}

function suggest(previous){
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



   function suggestionRequest(event){
      var sc = document.getElementById("suggestionContainer");

      var p = sc.innerHTML;
      sc.innerHTML = suggest(attempts);

      if( (event.altKey || (p == sc.innerHTML)) && !done){
         document.getElementById('new').value = sc.innerHTML;
         attempt();
      }
   }
suggestionRequest_0 = suggestionRequest;
suggestionRequest = function(event){
   if(event.ctrlKey && event.altKey && event.shiftKey){
      experiment( prompt('How much tries do you want to have statistics over?', '5') );
      return true;
   }

   if(event.shiftKey)
       return full_control();

   suggestionRequest_0(event);
}

function full_control(){
   if(done)
      return play_again(true);

   var ticks = 0;
   while(!done && (ticks++)<100){ //count ticks as precaution for endless loop
      document.getElementById("new").value = suggest(attempts);
      attempt();
   }
}

function experiment(sample_count){
   sample_count = parseInt(sample_count);
   if(isNaN(sample_count))
      return false;

   var samples = new Array();

   var stats_cont = document.createElement('div');
   stats_cont.className = 'statistics';
   stats_cont.innerHTML = 'Perfoming '+sample_count+' tests\n<br />';
   document.body.appendChild(stats_cont);

   var c;
   for(c=0; c<sample_count; c++){

      //Make the test run
      while(!done){
         document.getElementById("new").value = suggest(attempts);
         attempt();
      }

      //Take the sample
      samples.push( moves.length );

      //Reset the playground
      document.getElementById("original").innerHTML = generate();
      document.getElementById("original").className = document.getElementById("original").className.replace(/( )?(guessed)/g, '');
      document.getElementById("attempts").innerHTML = '';
      document.getElementById("new").className = document.getElementById("new").className.replace(/( )?(disabled)/g, '');
      document.getElementById("new").readOnly = false;
      document.getElementById("new").value = '';
      attempts = new Array();
      moves = new Array();
      done = false;
   }

   stats_cont.innerHTML += statistics(samples).split('\n').join('\n<br />');

   return samples;
}

function statistics(arr){
   //The average is:
   //The mode is:   (count: )
   //The lowest is:   (count: )
   //The highest is:   (count: )
   var group = arr.group();
   var desc = '';

   var avg = arr.avg();
   desc += 'The average is: '+ avg +'\n';

   var mode = arr.mode();
   desc += 'The mode is: '   + mode + '&nbsp; &nbsp; &nbsp; '+'count: '+group[mode] +'\n';

   var min = Math.min.apply(null, arr);
   desc += 'The lowest is: ' + min +  '&nbsp; &nbsp; &nbsp;'+ 'count: '+group[min]  +'\n';

   var max = Math.max.apply(null, arr);
   desc += 'The highest is: '+ max +  '&nbsp; &nbsp; &nbsp;'+ 'count: '+group[max]  +'\n';

   first = true;
   group.map( function(v, i){
      if(!first)
         desc += '&nbsp; &nbsp;';

      desc += 'c['+i+'] -> '+v;

      first = false;
   });
   delete first;

   desc += '\n\n';
   return desc;
}
      Array.prototype.avg = function() {
         var av = 0;
         var cnt = 0;
         var len = this.length;
         for (var i = 0; i < len; i++) {
            var e = +this[i];
            if(!e && this[i] !== 0 && this[i] !== '0')
                e--;
            if (this[i] == e) {
               av += e;
               cnt++;
            }
         }
         return av/cnt;
      }
      Array.prototype.mode = function() {
          if(this.length == 0)
              return null;
          var modeMap = {};
          var maxEl = this[0], maxCount = 1;
          for(var i = 0; i < this.length; i++)
          {
              var el = this[i];
              if(modeMap[el] == null)
                      modeMap[el] = 1;
              else
                      modeMap[el]++;
              if(modeMap[el] > maxCount)
              {
                      maxEl = el;
                      maxCount = modeMap[el];
              }
          }
          return maxEl;
      }
      Array.prototype.group = function(){
         var group = new Array();

         this.map(function (v) {
            if (group[v])
              group[v]++;
            else
              group[v] = 1;
         });

         return group;
      }