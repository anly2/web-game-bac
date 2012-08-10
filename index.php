<?php

if (isset($_REQUEST['javascript'])) {
   if (isset($_REQUEST['support']) || isset($_REQUEST['control'])) {
      echo <<<EOT
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
   };
   Array.prototype.shuffle = function() {
      var len = this.length;
      var i = len;
      while (i--) {
         var p = parseInt(Math.random()*len);
         var t = this[i];
         this[i] = this[p];
         this[p] = t;
      }
   };

   function addEvent(obj, evt, fn){
      if(obj.addEventListener)
         obj.addEventListener(evt, fn, false);
      else
      if(obj.attachEvent)
         obj.attachEvent("on"+evt, fn);
      else
         obj["on"+evt] = fn;
   }
EOT;
   }

   if (isset($_REQUEST['control'])) {
      echo <<<EOT
   function play_again(force){
      if(force || confirm("Play again?")){
         window.location.href = "?new";
         return true;
      }

      return false;
   }

   function flash(I){
      var flashed = document.getElementById("attempt:"+I);
      flashed.className += ' flashed';
      setTimeout( function(){ flashed.className = flashed.className.replace("flashed", ""); }, 4000 );
   }


   symbolBulls = '|';
   symbolCows  = 'X';

   done = false;
   turns = 0;
   moves = new Array();

   player1 = new Object();
   player1.input     = "new";
   player1.original  = "original";
   player1.container = "attempts";

   function attempt(){
      if(done)
          return play_again();

      var inp = document.getElementById("new");


      var v = inp.value.toString().replace(/[^0-9]/g , "");

      var tr;
      for(tr=0; tr<4; tr++){
         var a = v.replace(eval('/'+v.charAt(tr)+'/g'), 'T').split("");
         a.splice(tr, 1, v.charAt(tr));
         v = a.join("").replace(/T/g, "");
         delete a;
      }

      while(v.charAt(0) == "0")
         v = v.substr(1);

      if(moves.indexOf(v) != -1){
         flash( moves.indexOf(v) );
         inp.value = v;
         inp.focus();
         return false;
      }

      if(v.length!=4){
         inp.value = v;
         inp.focus();
         return false;
      }


      var o  = document.getElementById("original").innerHTML.split("");
      var v_ = v.split("");

      var bulls = 0;
      var cows  = 0;

      var i;
      for(i=0; i<v.length; i++){
         if(v_[i] == o[i])
            bulls++;
         else
         if(o.indexOf(v_[i]) != -1)
            cows++;
      }
      var I = moves.push( v )-1;

      var attmp = document.createElement('div');
      attmp.id = "attempt:"+I;
      attmp.className = 'attempt';
      attmp.innerHTML = v;
      attmp.innerHTML += '<div class="result">'+ (symbolBulls.repeat(bulls)) + (symbolCows.repeat(cows)) +'</div>';
      inp.value = '';

      if(bulls==o.length){
         attmp.className += ' successful';
         done = true;
         inp.value = moves.length+(" turn"+(moves.length!=1? "s" : ""));
         inp.className = 'disabled';
         inp.readOnly = true;
         document.getElementById("original").className = 'guessed';
      }

      var cont = document.getElementById("attempts");
      cont.appendChild(attmp);
      cont.appendChild(document.createElement('br'));

      return [v, ( (symbolBulls.repeat(bulls)) + (symbolCows.repeat(cows)) )];
   }
EOT;
   }

   if (isset($_REQUEST['initiation'])) {
      echo <<<EOT
   function generate(){
      var nums = new Array();
      nums[0] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      nums[1] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      nums[2] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      nums[3] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

      var num = new Array();

      var i;
      for(i=0; i<nums.length; i++){
         num[i] = nums[i].rand();

         var j;
         for(j=0; j<nums.length; j++){
            if(i!=j)
               nums[j].splice(nums[j].indexOf(num[i]), 1);
         }
      }

      return num.join("");
   }

   function initiate(){
      document.getElementById("original").innerHTML = generate();

      var n = document.getElementById("new");
      n.readOnly = false;
      n.value = '';
      n.focus();

      //Attach events
      var g = document.getElementById("new");

      pai = 0;
      addEvent(g, 'keydown', function(event){
         if(event.keyCode==13){
            attempt();
            pai = 0; //"Previous Attempt" index
         }
         if(event.keyCode==38)
            this.value= pai>=moves.length? moves[0]: moves[moves.length-(++pai)];
         if(event.keyCode==40)
            this.value= (--pai)<=0? ''.toString(pai=0) : moves[moves.length-pai];
      });

      addEvent(g, 'click', function(event){
         if(this.readOnly)
            play_again();
      });
   }
EOT;
   }

   if (isset($_REQUEST['ai']) || isset($_REQUEST['extra'])) {
      echo <<<EOT
sBulls = '|';
sCows  = 'X';

entropy = true;

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
      for(i=0; i<4; i++)
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
      res += '|'.repeat(bulls);
      res += 'X'.repeat(cows);

      return res;
   }

   return this;
}

function suggest(previous){
   //Previous must be an array of Attempt objects containing the number tryed and the result
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
            var digit = previous[t].num.charAt(p);

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
            if(attmp.test( (cur+chosen) ) != attmp.res){
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

attempts = new Array();
attempt_0 = attempt;
attempt = function(){
   var r = attempt_0();
   if(r !== false)
      attempts.push( new Attempt( r[0], r[1] ) );
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

EOT;
   }

   if (isset($_REQUEST['extra'])) {
      echo <<<EOT
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
   stats_cont.innerHTML = 'Perfoming '+sample_count+' tests\\n<br />';
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

   stats_cont.innerHTML += statistics(samples).split('\\n').join('\\n<br />');

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
   desc += 'The average is: '+ avg +'\\n';

   var mode = arr.mode();
   desc += 'The mode is: '   + mode + '&nbsp; &nbsp; &nbsp; '+'count: '+group[mode] +'\\n';

   var min = Math.min.apply(null, arr);
   desc += 'The lowest is: ' + min +  '&nbsp; &nbsp; &nbsp;'+ 'count: '+group[min]  +'\\n';

   var max = Math.max.apply(null, arr);
   desc += 'The highest is: '+ max +  '&nbsp; &nbsp; &nbsp;'+ 'count: '+group[max]  +'\\n';

   first = true;
   group.map( function(v, i){
      if(!first)
         desc += '&nbsp; &nbsp;';

      desc += 'c['+i+'] -> '+v;

      first = false;
   });
   delete first;

   desc += '\\n\\n';
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
EOT;
   }

   exit;
}

if (isset($_REQUEST['css'])) {
   if (isset($_REQUEST['master'])) {
      echo <<<EOT
EOT;
   }

   if (isset($_REQUEST['game'])) {
      echo <<<EOT
         .contents{
            text-align: center;
         }

         #original,
         .attempt,
         #new{
            display: inline-block;
            width: 56px;
            height: 20px;
            font-family: Courier New;
            letter-spacing: 2px;
            text-align: center;
            font-size: 16px;
         }
         #original{
            background-color: #A2A2A2;
            color: #A2A2A2;
            font-size: 0px;
         }
         #original.guessed{
            color: black;
            font-size: 16px;
         }
         .attempt{
            overflow: visible;
            white-space: nowrap;
            padding-left: 8px;
         }
         .result{
            display: inline-block;
            margin-left: 20px;
            min-width: 10px;
         }
         .attempt.successful{
            color: #38A10B;
         }
         #new.disabled{
            font-family: Helvetica;
            width: 12em;
            font-style: italic;
         }

         .flashed{
            color: #3C6AFF;
            font-weight: bold;
         }

         #suggestionContainer{
            position: absolute;
            left: 5px;
            top: 5px;

            display: inline-block;
            width: 56px;
            height: 20px;
            font-family: Courier New;
            letter-spacing: 2px;
            text-align: center;
            font-size: 16px;

            background-color: #AAD8FF;
         }
         #suggestionContainer span{
            display: inline-block;
            background-color: inherit;
            height: inherit;
            padding: 0px 5px;
         }
EOT;
   }

   exit;
}


// In game
$ai = true; //Show the extra buttons which utilize the ai?

echo '<html>'."\n";
echo '<head>'."\n";
echo '   <title>Bulls and Cows</title>'."\n";
echo "\n";
echo '   <script type="text/javascript" src="?javascript&initiation&control"></script>'."\n";
echo '   <link rel="stylesheet" href="?css&master&game" />'."\n";
echo "\n";

if($ai){
   echo '   <script type="text/javascript" src="?javascript&ai&extra"></script>'."\n";
   echo "\n";
}

echo '</head>'."\n";

echo '<body>'."\n";
echo "\n";
echo '   <div class="contents">'."\n";

if($ai){
echo '      <div id="suggestionContainer" onclick="suggestionRequest(event);">'."\n";
echo '         <span>Suggest</span>'."\n";
echo '      </div>'."\n";
}

echo '      <div id="original"></div>'."\n";
echo '      <div id="attempts"></div>'."\n";
echo '      <input id="new" type="text" name="guess" />'."\n";
echo "\n";
echo '      <script type="text/javascript">initiate();</script>'."\n";
echo '   </div>'."\n";

echo '</body>'."\n";
echo '</html>'."\n";

?>