<?php
echo '<script>alert("We have recieved your mail. Thank you!")</script>';
  $name = $_POST['name'];
  $visitor_email = $_POST['email'];
  $visitor_subject = $_POST['subject'];
  $message =$_POST['message'];

  $email_from = 'ADMIN@SAMARTHPAL';

  $email_subject = 'New Form Submission';

  $email_body = "user Name: $name.\n".
  					"user Email: $visitor_email.\n".
  						"user Subject: $visitor_subject.\n".
  							"user Message: $message.\n";

	$to =  "palsamarth02@gmail.com";

	$headers = "From: $email_from \r\n";

	$headers .="Reply-To: $visitor_email \r\n";

	mail($to,$email_subject,$email_body,$headers);

	header("Location: index.html");						
?>
<script type="text/javascript">
    window.location.href="index.html";
</script>