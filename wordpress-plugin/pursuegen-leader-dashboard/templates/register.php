<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0"); header("Pragma: no-cache"); header("Expires: 0");
if (!isset($_GET['cb'])) { $qs=$_GET; $qs['cb']=time(); wp_safe_redirect(home_url('/admin/register?' . http_build_query($qs))); exit; }
$redirect = isset($_GET['redirect']) ? esc_url_raw($_GET['redirect']) : home_url('/admin/dashboard');
if (is_user_logged_in()) { wp_safe_redirect($redirect); exit; }
$error='';
$vals=['full_name'=>'','email'=>'','group'=>''];
$groups=['middleschoolboy'=>'Middle School Boys','middleschoolgirl'=>'Middle School Girls','highschoolboy'=>'High School Boys','highschoolgirl'=>'High School Girls'];
if ($_SERVER['REQUEST_METHOD']==='POST') {
 if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'tracker_register')) $error='Security check failed. Please try again.';
 else {
  $vals['full_name']=sanitize_text_field($_POST['full_name'] ?? ''); $vals['email']=sanitize_email($_POST['email'] ?? ''); $vals['group']=sanitize_key($_POST['group'] ?? ''); $pass=(string)($_POST['password'] ?? '');
  if (!$vals['full_name'] || !$vals['email'] || !$vals['group'] || !$pass) $error='Please fill out all required fields.';
  elseif (!is_email($vals['email'])) $error='Please enter a valid email address.';
  elseif (!isset($groups[$vals['group']])) $error='Please select a valid grade group.';
  elseif (strlen($pass) < 8) $error='Password must be at least 8 characters.';
  elseif (email_exists($vals['email'])) $error='That email is already in use.';
  else {
    $user_id=wp_insert_user(['user_login'=>$vals['email'],'user_pass'=>$pass,'user_email'=>$vals['email'],'display_name'=>$vals['full_name'],'role'=>'subscriber']);
    if (is_wp_error($user_id)) $error=$user_id->get_error_message();
    else {
      update_user_meta($user_id,'tracker_pending',1); update_user_meta($user_id,'requested_role',$vals['group']);
      $token=wp_generate_password(32,false,false); update_user_meta($user_id,'tracker_approve_token',$token); update_user_meta($user_id,'tracker_requested_at',time());
      $approve_url=add_query_arg(['action'=>'approve','uid'=>$user_id,'token'=>$token,'cb'=>time()], admin_url('admin-post.php?action=pgld_access_action'));
      $deny_url=add_query_arg(['action'=>'deny','uid'=>$user_id,'token'=>$token,'cb'=>time()], admin_url('admin-post.php?action=pgld_access_action'));
      $subject='New Tracker Access Request';
      $message='Name: '.esc_html($vals['full_name'])."\nEmail: ".esc_html($vals['email'])."\nRequested Group: ".esc_html($groups[$vals['group']])."\n\nApprove: ".$approve_url."\nDeny: ".$deny_url;
      @wp_mail(get_option('admin_email'), $subject, $message);
      wp_safe_redirect(home_url('/admin/login?cb=' . time() . '&loggedout=0&redirect=' . urlencode($redirect))); exit;
    }
  }
 }
}
?><!doctype html><html><body><form method="POST"><h1>Request Access</h1><?php if($error):?><div><?php echo esc_html($error);?></div><?php endif;?><?php wp_nonce_field('tracker_register');?><input name="full_name" placeholder="Full name" required><input name="email" placeholder="Email" required><select name="group" required><option value="">Select group</option><?php foreach($groups as $k=>$v):?><option value="<?php echo esc_attr($k);?>"><?php echo esc_html($v);?></option><?php endforeach;?></select><input name="password" type="password" required><button type="submit">Submit</button></form></body></html>
