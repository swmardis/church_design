<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
if (!isset($_GET['cb'])) {
  $qs = $_GET; $qs['cb'] = time();
  wp_safe_redirect(home_url('/admin/login?' . http_build_query($qs))); exit;
}
$redirect = isset($_GET['redirect']) ? esc_url_raw($_GET['redirect']) : home_url('/admin/dashboard');
if (is_user_logged_in()) { wp_safe_redirect($redirect); exit; }
$error=''; $loginVal='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
  $redirect = isset($_POST['redirect']) ? esc_url_raw($_POST['redirect']) : home_url('/admin/dashboard');
  $loginVal = sanitize_text_field($_POST['login'] ?? '');
  $password = (string)($_POST['password'] ?? '');
  $user = wp_signon(['user_login'=>$loginVal,'user_password'=>$password,'remember'=>true], is_ssl());
  if (is_wp_error($user)) {
    $error = 'Incorrect email/username or password.';
  } else {
    $pending = get_user_meta($user->ID, 'tracker_pending', true);
    if ($pending) { wp_logout(); wp_safe_redirect(home_url('/admin/login?cb=' . time() . '&pending=1')); exit; }
    wp_safe_redirect($redirect); exit;
  }
}
?>
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in</title></head>
<body style="font-family:Arial;background:#111;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh;">
<form method="POST" style="background:#fff;color:#111;padding:20px;max-width:380px;width:100%;">
<h1>Sign in</h1>
<?php if ($error): ?><div><?php echo esc_html($error); ?></div><?php endif; ?>
<?php if (isset($_GET['pending'])): ?><div>Your access request has been received and is awaiting approval.</div><?php endif; ?>
<input type="hidden" name="redirect" value="<?php echo esc_attr($redirect); ?>">
<label>Email or Username</label><input name="login" required value="<?php echo esc_attr($loginVal); ?>" style="width:100%">
<label>Password</label><input type="password" name="password" required style="width:100%">
<button type="submit">Sign in</button>
<p><a href="<?php echo esc_url(home_url('/admin/register?cb=' . time() . '&redirect=' . urlencode($redirect))); ?>">Request Access</a></p>
</form></body></html>
