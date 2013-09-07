symbolBulls = "|";
symbolCows = "X";
flash_delay = 2000; //ms


function addEvent (elem, event, func)
{
    if (elem.addEventListener) {
        elem.addEventListener(event, func, false);
    }
    else
    if (elem.attachEvent) {
        elem.attachEvent('on' + event, func);
    }
    else
    {
      elem["on"+event] = func;
    }
}

function initialize ()
{
   //get player nodes
   var players = new Array();
   var p = 1;
   while (document.getElementById("player:"+p))
      players.push (document.getElementById("player:"+(p++)));

   var i;
   for (i=0; i<players.length; i++)
      prepare (players[i]);

   addEvent (document.getElementById("add-player"), 'click', add_player);
}
function prepare (node)
{
   var e = parse_node (node);

   e["original"].value = generate();
   e["guess"].disabled = false;
   e["guess"].readOnly = false;
   e["guess"].value = "";

   addEvent (e["original"],          'blur',    validate_original);
   addEvent (e["original"],          'keydown', function(event){if (event.keyCode == 13) this.blur();} );
   addEvent (e["guess"],             'keydown', handle_keydown);

   addEvent (e["enter"],             'click',   enter);
   addEvent (e["enter"],             'click',   wake_ai);
   e["enter"].setAttribute("title", "Enter number");

   addEvent (e["help"],              'click',   get_help);
   e["help"].setAttribute("title", "Get a suggestion from the ai");

   addEvent (e["set_custom_number"], 'click',   access_original);
   e["set_custom_number"].setAttribute("title", "Set a custom number");

   addEvent (e["set_as_bot"],        'click',   toggle_ai);
   e["set_as_bot"].setAttribute("title", "Set player as a bot");


   e["guess"].focus();
   return true;
}

function generate ()
{
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
function handle_keydown (event)
{
   if (event.keyCode == 13){
      enter (this);
      wake_ai (this);
      delete this.li; //"Log" index
   }

   if (event.keyCode == 38)
      cycle_log (this, 1);
   if(event.keyCode==40)
      cycle_log (this, -1);
}


function parse_node (node)
{
   if (node.parsed)
      return node.parsed;

   if (node.className.indexOf("player") != -1)
      return parse_player (node);

   if (node.className.indexOf("attempts") != -1)
      return parse_attempts (node);

   var obj = node;
   while (obj.parentNode)
   {
      obj = obj.parentNode;

      if (obj.className.indexOf("player") != -1)
         return parse_node(obj);
   }

   return false;
}
function parse_player (node)
{
   if (node.className.indexOf("player") == -1)
       return parse_node (node);

   if (node.parsed)
      return node.parsed;


   var obj = new Object();

   var i;
   for (i=0; i<node.childNodes.length; i++)
   {
      var e = node.childNodes[i];
      if (!e.className) continue;

      if (e.className.indexOf("original") != -1)
      {
         obj["original"] = e;
         continue;
      }

      if (e.className.indexOf("attempts") != -1)
      {
         obj["attempts"] = e;
         continue;
      }

      if (e.className.indexOf("guess") != -1)
      {
         obj["guess"] = e;
         continue;
      }

      if (e.className.indexOf("enter") != -1)
      {
         obj["enter"] = e;
         continue;
      }

      if (e.className.indexOf("help") != -1)
      {
         obj["help"] = e;
         continue;
      }

      if (e.className.indexOf("set-custom-number") != -1)
      {
         obj["set_custom_number"] = e;
         continue;
      }

      if (e.className.indexOf("set-as-bot") != -1)
      {
         obj["set_as_bot"] = e;
         continue;
      }
   }

   node.parsed = obj;
   return obj;
}
function parse_attempts (node)
{
   if (node.className.indexOf("attempts") == -1)
       return parse_node (node);

   if (node.parsed)
      return node.parsed;


   var attempts = new Array();

   var i;
   for (i=0; i<node.childNodes.length; i++)
   {
      var a = node.childNodes[i];
      if (!a.className) continue;

      if (a.className.indexOf("attempt") == -1)
         continue;

      var attmpt = new Object();

      var j;
      for (j=0; j<a.childNodes.length; j++)
      {
         var e = a.childNodes[j];

         if (e.className.indexOf("number") != -1)
         {
            attmpt.number = e.innerHTML;
            continue;
         }

         if (e.className.indexOf("result") != -1)
         {
            attmpt.result = new Object;
            attmpt.result.bulls = e.innerHTML.split(symbolBulls).length-1;
            attmpt.result.cows  = e.innerHTML.split(symbolCows).length-1;
            continue;
         }
      }

      attempts.push (attmpt);
   }

   node.parsed = attempts;
   return attempts;
}

commenced = false;
function enter (a, b)
{
   // Sort the variables
   if (typeof a == "number" || typeof a == "string")
   {
      var num = parseInt(a);
      var player_node = (!b)? this.parentNode : b;
   }else
   if (typeof b == "number" || typeof b == "string")
   {
      var num = b;
      var player_node = (!a)? this.parentNode : a;
   }else
   {
      //var player_node = (!a && !b)? this.parentNode : (!a? b : a);
      if ( (!a || !a.className) && (!b || !b.className))
         var player_node = this.parentNode;
      else
      {
         if (!a)
            var player_node = b;
         else
            var player_node = a;
      }
   }


   // Set the variables
   var obj = parse_node (player_node);
   if (!obj) return false;
   var player_node = obj["original"].parentNode;

   if (!num) var num = obj["guess"].value;


   // Validate the entered number
   var v = validate (num);

   if(v.length!=4){
      obj["guess"].value = v;
      obj["guess"].focus();

      obj["guess"].className += " invalid";
      setTimeout( function(){ obj["guess"].className = obj["guess"].className.replace(/ ?invalid/g, ""); }, flash_delay );

      return false;
   }

   // Check if the number hasn't been already entered
   var attempts = parse_node (obj["attempts"]);
   var i;
   for (i=0; i<attempts.length; i++)
   {
      if (attempts[i].number == v)
      {
         //Flash
         var nd = obj["attempts"].children[i];
         nd.className += ' flashed';
         setTimeout( function(){ nd.className = nd.className.replace(/ ?flashed/g, ""); }, flash_delay );

         //Return control
         obj["guess"].value = v;
         obj["guess"].focus();
         return false;
      }
   }


   // Get the result
   var o_ = obj["original"].value.split("");
   var v_ = v.split("");

   var bulls = 0;
   var cows  = 0;

   var i;
   for (i=0; i<4; i++){
      if (v_[i] == o_[i])
         bulls++;
      else
      if (o_.indexOf(v_[i]) != -1)
         cows++;
   }

   // Add attempt
   add_attempt (player_node, {number: v, result: {bulls: bulls, cows: cows}})

   // Check for victory
   if (bulls == 4)
   {
      player_node.done = true;
      player_node.className += " done";

      var turns = parse_node(obj["attempts"]).length;
      player_node.doneIn = turns;

      obj["guess"].value = turns+(" turn"+(turns!=1? "s" : ""));
      obj["guess"].className += " disabled";
      obj["guess"].disabled = true;
      obj["guess"].readOnly = true;

      obj["original"].className += " guessed";


      // Check if all players are done
      var turn_arr = new Array();
      var all_done = true;

      var p = 0;
      while (document.getElementById("player:"+(++p)))
      {
         if (document.getElementById("player:"+p).done)
            turn_arr[p-1] = document.getElementById("player:"+p).doneIn;
         else
         {
            turn_arr[p-1] = -1;
            all_done = false;
         }
      }

      if (all_done)
      {
         var an = document.getElementById("announcement");

         // Get the player(s) with least turns
         var cm = null;
         var ps = new Array();

         var i;
         for (i=0; i<turn_arr.length; i++)
         {
            if (cm === null || turn_arr[i] < cm)
            {
               ps = new Array();
               cm = turn_arr[i]; //leads in the next if clause
            }

            if (turn_arr[i] == cm)
               ps.push(i);

            continue;
         }

         // Declare the player(s) winner(s)
         if (ps.length == 1)
            an.innerHTML = "Player "+ (ps[0]+1) +" wins!";
         else
         {
            var str = "";

            var i;
            for (i=0; i<ps.length; i++)
            {
               str += "Player "+ (ps[i]+1);

               if (i!= ps.length-1)
                  str += (i != ps.length-2)? " , " : " and ";
            }

            an.innerHTML = str + " ended in a tie!";
         }

         // Add a "play-again" link
         an.innerHTML += "\n<br />\n";
         an.innerHTML += '<a href="#" onclick="play_again(true);">Play again?</a>';
      }
   }

   // Indicate that the game has begun
   if (!commenced)
   {
      commenced = true;
      document.getElementById("add-player").parentNode.className += " commenced";
   }
}
function validate (v)
{
   // Remove repeating digits
   var i;
   for (i=0; i<4; i++)
   {
      var a = v.replace( eval('/'+v.charAt(i)+'/g'), 'T').split("");
      a.splice(i, 1, v.charAt(i));
      v = a.join("").replace(/T/g, "");
      delete a;
   }

   // Remove leading zeros
   while(v.charAt(0) == "0")
      v = v.substr(1);

   return v;
}
function add_attempt (node, attmpt)
{
   // attempt html
   // <div class="attempt"> <span class="number">1234</span> <span class="result">||XX</span> </div>

      var obj = parse_node (node);
      var bulls = attmpt.result.bulls;
      var cows  = attmpt.result.cows;

      var attmp = document.createElement("div");
      attmp.className = "attempt" + (bulls==4? " successful" : "");
      attmp.innerHTML  = "";
      attmp.innerHTML += '<span class="number">' + attmpt.number + '</span>';
      attmp.innerHTML += '<span class="result">' + (symbolBulls.repeat(bulls)) + (symbolCows.repeat(cows)) + '</span>';

      obj["guess"].value = "";
      obj["attempts"].appendChild(attmp);

      obj["attempts"].parsed.push(attmpt);
      return true; //obj["attempts"].parsed;
}

function cycle_log (node, dir)
{
   var obj = parse_node (node);
   if (typeof node.li != "undefined")
      var li = node.li;
   else
      var li  =  -1; //li /Log Index/
   var len = obj["attempts"].parsed.length;

   var offset = li - parseInt(-dir);
   offset = Math.max (offset, -1); //-1 is the clear (empty) value
   offset = Math.min (offset, len-1);

   node.li = offset;

   if (offset == -1)
      var entry = "";
   else
      var entry = obj["attempts"].parsed[ len - 1 - offset ].number;

   obj["guess"].value = entry;
   return entry;
}

function access_original (node)
{
   if (!node || !node.className)
      var node = this.parentNode;

   var obj = parse_node (node);
   if (!obj) return false;

   obj["original"].className += " editable";
   obj["original"].value = "";
   obj["original"].focus();

   return true;
}
function validate_original (node)
{
   if (!node || !node.className)
      var node = this;

   var v = validate (node.value);

   if (v.length != 4)
      v = generate();

   node.value = v;
   node.className = node.className.replace(/ ?editable/g, "");
   return true;
}

playerCount = 1;
function add_player ()
{
   var pl = document.getElementById("player:"+playerCount);
   var np = pl.cloneNode(true);

   np.id = "player:" + (++playerCount);
   pl.parentNode.appendChild(np);

   prepare(np);

   return true;
}
function play_again ()
{
   document.getElementById("announcement").innerHTML = "";

   var anch = document.getElementById("add-player").parentNode;
   anch.className = anch.className.replace(/ ?commenced/g, "");
   commenced = false;


   var p = 1;
   var node;
   while (node = document.getElementById("player:"+(p++)))
   {
      var e = parse_node(node);
      node.className = node.className.replace(/ ?done/g, "");
      delete node.done;

      e["original"].value = generate();
      e["original"].className = e["original"].className.replace(/ ?guessed/g, "");
      e["guess"].className = e["guess"].className.replace(/ ?disabled/g, "");
      e["guess"].disabled = false;
      e["guess"].readOnly = false;
      e["guess"].value = "";

      if (node.ai)
      {
         node.parsed["guess"].value = "AI";
         node.parsed["guess"].disabled = true;
      }

      e["attempts"].innerHTML = "";
      delete e["attempts"].parsed;
   }
}

   String.prototype.repeat = function (num)
   {
       return new Array( num + 1 ).join( this );
   };
   Array.prototype.rand = function ()
   {
      //Doesn't work if there are gaps in the array
      //return this[ Math.floor(Math.random()* (this.length + 1)) ];
      return this[this.random(1)];
   };
   Array.prototype.random = function (num_req)
   {
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
   Array.prototype.shuffle = function()
   {
      var len = this.length;
      var i = len;
      while (i--) {
         var p = parseInt(Math.random()*len);
         var t = this[i];
         this[i] = this[p];
         this[p] = t;
      }
   };


///
function toggle_ai (event) //is called from an event handler
{
   if (!node || !node.className)
      var node = this.parentNode;

   if (!node.ai)
   {
      node.ai = true;
      node.parsed["set_as_bot"].className += " active";
      node.parsed["guess"].value = "AI";
      node.parsed["guess"].setAttribute("title", "AI player");
      node.parsed["guess"].disabled = true;
      node.parsed["help"].style.display = "none";
      node.parsed["enter"].style.display = "none";
   }
   else
   {
      node.ai = false;
      node.parsed["set_as_bot"].className = node.parsed["set_as_bot"].className.replace(/ ?active/g, "");
      node.parsed["guess"].value = "";
      node.parsed["guess"].setAttribute("title", "");
      node.parsed["guess"].disabled = false;
      node.parsed["help"].style.display = "";
      node.parsed["enter"].style.display = "";
   }

   return true;
}
///
function wake_ai (event) //is called from an event handler
{
   if (!event || !event.className)
      var node = this.parentNode;
   else
      var node = event;

   var next = next_player (node);

   if (next.done)
      return wake_ai(next);

   if (!next.ai)
      return true;

   var no = parse_node (next);
   var na = parse_node(no["attempts"]);
   var ns = suggest (na);

   no["guess"].value = ns;
   enter (next);

   if (!next.done)
      no["guess"].value = "AI";

   wake_ai(next);
}
function next_player (node)
{
   if (node.className.indexOf("player") == -1)
      var node = parse_node(node)["original"].parentNode;

   // Get the next player's node
   var ind = parseInt( node.id.substr( "player:".length ) );
   var next = document.getElementById("player:"+(ind+1));

   if (!next)
   {
      if (ind == 1)
         return true;

      var next = document.getElementById("player:1");
   }

   return next;
}
///
function get_help (event) //is called from an event handler
{
   var o = parse_node (this);
   if (!o) return false;

   var a = parse_node(o["attempts"]);

   var s = suggest(a);
   o["guess"].value = s;

   if (event.altKey)
   {
      enter (this);
      wake_ai (o["original"].parentNode);
   }
}