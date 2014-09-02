<?php
session_start();

function redirect ($url="") {
   echo '<script type="text/javascript">window.location.href="'.$url.'";</script>';
}

if (isset($_REQUEST["login"])) {
   $u = $_REQUEST["username"];
   $p = $_REQUEST["password"];
   
//   $f = "users/$u";
//   $h = md5($u.$p);
   
//   if (!file_exists($f) {
//      file_put_contents($f, $h);
//      $_SESSION['user'] = $u;
//   }
//   else {
//      if (file_get_contents("users/$u"
//   }

   $_SESSION['user'] = $u;
   
   redirect("?");
}

if (!isset($_SESSION['user'])) {
    $dir = 'users/';
    $c = 0;
    
    if ($handle = opendir($dir)) {
        while (($file = readdir($handle)) !== false)
            if (!in_array($file, array('.', '..')) && !is_dir($dir.$file)) 
                $c++;
    }
    
   $c++;
    
   echo <<<HTML
   <html>
   <head>
      <title>Welcome to Bulls and Cows</title>
   </head>
   <body>
   
   <form action="?login" method="POST">
      <table width="100%" height="100%"><tr><td valign="middle" style="text-align: center; vertical-align: middle;">
      
      <table style="margin: 0 auto;">
         <tr>
            <td> <label for="field-username">Name:</label> </td>
            <td> <input type="text" id="field-username" name="username" value="Guest $c" /> </td>
         </tr>
         <tr>
            <td> <label for="field-password">Password:</label> </td>
            <td> <input type="password" id="field-password" name="password" placeholder="Optional" /> </td>
         </tr>
         <tr>
            <td colspan=2 align="center"> <input type="submit" value="Sign in" /> </td>
         </tr>
      </table>
      
      </td></tr></table>
   </form>
   
   </body>
   </html>
HTML;
   exit;
}

if (isset($_REQUEST['listen'])) {
   $w = inotify_init();
   
   $wn = inotify_add_watch($w, "users/", IN_CREATE);
   $wc = inotify_add_watch($w, "users/", IN_MODIFY|IN_MASK_ADD);
   
   while (true) {
      $r = inotify_read($w);
      
      if ($r["wd"] == $wn) {
         echo "new:".$r["name"];
      }
      
      if ($r["wd"] == $wn) {
         echo "change:".$r["name"];
      }
   }
}


file_put_contents("users/".$_SESSION["user"], "0");

$content = file_get_contents("index.html");

$u = $_SESSION['user'];
$additional = <<<HTML
<script type="text/javascript">
xmlhttp = new Array();
function call(url, callback, sync){
   var async = (typeof callback == "boolean")? !callback : (sync!=null)? !sync : true;

   if(window.XMLHttpRequest)
      var xh = new XMLHttpRequest();
   else
   if(window.ActiveXObject)
      var xh = new ActiveXObject("Microsoft.XMLHTTP");
   else
      return false;


   if(typeof callback != "boolean" && callback!=null)
      xh.onreadystatechange = function(){
         if (this.readyState==4 && this.status==200)
            callback(this.responseText);
         xmlhttp.splice(xmlhttp.indexOf(this), 1);
      }

   xh.open("GET", url, async);
   xh.send(null);

   xmlhttp.push(xh);
   return async? xh : xh.responseText;
}

function onremotechange(msg) {
   console.log(msg);
}

call("?listen", onremotechange);
</script>

<style type="text/css">
[id="player:1"]:before {
   content: '$u';
   display: block;
}
</style>
HTML;


$content = str_replace("</head", $additional."</head", $content);

echo $content;
?>