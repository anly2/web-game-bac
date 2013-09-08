<?php
if (isset($_REQUEST['room'])) {
   $r = (int) $_REQUEST['room'];
   $n = $_REQUEST['number'];
   
   if (file_exists("rooms/$r")) {
      $o = file_get_contents("rooms/$r");
   }
   
   file_put_contents("rooms/$r", $n);
   
   eval("?>".file_get_contents("index.html"));
}
?>