<?php
// /admin/register/

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

if (!isset($_GET['cb'])) {
  $qs = $_GET;
  $qs['cb'] = time();
  wp_safe_redirect(home_url('/admin/register/?' . http_build_query($qs)));
  exit;
}

$redirect = isset($_GET['redirect']) ? esc_url_raw($_GET['redirect']) : home_url('/admin/dashboard/');

if (is_user_logged_in()) {
  wp_safe_redirect($redirect);
  exit;
}

$error = '';
$vals = ['full_name'=>'','email'=>'','group'=>''];

// Grade group → WP role mapping
$groups = [
  'middleschoolboy'  => 'Middle School Boys',
  'middleschoolgirl' => 'Middle School Girls',
  'highschoolboy'    => 'High School Boys',
  'highschoolgirl'   => 'High School Girls',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'tracker_register')) {
    $error = 'Security check failed. Please try again.';
  } else {
    $vals['full_name'] = sanitize_text_field($_POST['full_name'] ?? '');
    $vals['email']     = sanitize_email($_POST['email'] ?? '');
    $vals['group']     = sanitize_key($_POST['group'] ?? '');
    $pass              = (string)($_POST['password'] ?? '');

    if (!$vals['full_name'] || !$vals['email'] || !$vals['group'] || !$pass) $error='Please fill out all required fields.';
    elseif (!is_email($vals['email'])) $error='Please enter a valid email address.';
    elseif (!isset($groups[$vals['group']])) $error='Please select a valid grade group.';
    elseif (strlen($pass) < 8) $error='Password must be at least 8 characters.';
    elseif (email_exists($vals['email'])) $error='That email is already in use.';
    else {
      $user_id = wp_insert_user([
        'user_login'   => $vals['email'],
        'user_pass'    => $pass,
        'user_email'   => $vals['email'],
        'display_name' => $vals['full_name'],
        'role'         => 'subscriber'
      ]);

      if (is_wp_error($user_id)) {
        $error = $user_id->get_error_message();
      } else {
        update_user_meta($user_id,'tracker_pending',1);
        update_user_meta($user_id,'requested_role',$vals['group']);

        $token = wp_generate_password(32,false,false);
        update_user_meta($user_id,'tracker_approve_token',$token);
        update_user_meta($user_id,'tracker_requested_at',time());

        $approve_url = add_query_arg(
          ['action'=>'approve','uid'=>$user_id,'token'=>$token,'cb'=>time()],
          admin_url('admin-post.php?action=pgld_access_action')
        );

        $deny_url = add_query_arg(
          ['action'=>'deny','uid'=>$user_id,'token'=>$token,'cb'=>time()],
          admin_url('admin-post.php?action=pgld_access_action')
        );

        $subject = 'New Tracker Access Request';
        $message =
          'Name: ' . $vals['full_name'] . "\n" .
          'Email: ' . $vals['email'] . "\n" .
          'Requested Group: ' . $groups[$vals['group']] . "\n\n" .
          'Approve: ' . $approve_url . "\n" .
          'Deny: ' . $deny_url;

        @wp_mail(get_option('admin_email'), $subject, $message);

        // Send them back to login with "pending" message
        wp_safe_redirect(home_url('/admin/login/?cb=' . time() . '&pending=1&redirect=' . urlencode($redirect)));
        exit;
      }
    }
  }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Request Access</title>
  <style>
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0;
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:28px 16px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background:#111;
    }
    .card{
      width:100%;
      max-width:420px;
      background:#fff;
      border-radius:18px;
      padding:34px 28px 26px;
      box-shadow:0 20px 60px rgba(0,0,0,.45);
      text-align:center;
    }
    .logo{margin-bottom:14px}
    .logo img{
      width:200px;
      height:auto;
      display:block;
      margin:0 auto;
    }
    h1{
      margin:10px 0 18px;
      font-size:22px;
      font-weight:500;
      color:#222;
    }
    .error{
      background:#ffecec;
      border:1px solid #ffbcbc;
      color:#a40000;
      padding:10px 12px;
      border-radius:10px;
      font-size:13px;
      text-align:left;
      margin-bottom:12px;
    }
    label{
      display:block;
      text-align:left;
      font-size:12px;
      font-weight:700;
      color:#333;
      margin:0 0 6px;
    }
    input[type="text"],
    input[type="email"],
    input[type="password"],
    select{
      width:100%;
      padding:14px 12px;
      border:1px solid #cfcfcf;
      border-radius:6px;
      font-size:15px;
      margin-bottom:16px;
      outline:none;
      background:#fff;
    }
    input:focus, select:focus{ border-color:#999; }
    .btn{
      width:100%;
      padding:14px 12px;
      border:none;
      border-radius:0;
      background:#000;
      color:#fff;
      font-weight:800;
      letter-spacing:.6px;
      text-transform:uppercase;
      cursor:pointer;
      margin-top:2px;
    }
    .btn:hover{background:#222}
    .links{
      margin-top:16px;
      font-size:13px;
      color:#222;
    }
    .links a{ color:#111; text-decoration:none; }
    .links a:hover{text-decoration:underline}
    .small{ margin-top:10px; font-size:12px; color:#666; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <img src="https://pursuegen.com/logo/logobk.png" alt="Logo">
    </div>

    <h1>Request Access</h1>

    <?php if (!empty($error)): ?>
      <div class="error"><?php echo esc_html($error); ?></div>
    <?php endif; ?>

    <form method="POST" autocomplete="on">
      <?php wp_nonce_field('tracker_register'); ?>

      <label for="full_name">Full Name</label>
      <input id="full_name" name="full_name" type="text" value="<?php echo esc_attr($vals['full_name']); ?>" required />

      <label for="email">Email Address</label>
      <input id="email" name="email" type="email" value="<?php echo esc_attr($vals['email']); ?>" required />

      <label for="group">Select Grade Group</label>
      <select id="group" name="group" required>
        <option value="">Select Grade Group</option>
        <?php foreach($groups as $k=>$v): ?>
          <option value="<?php echo esc_attr($k); ?>" <?php selected($vals['group'], $k); ?>><?php echo esc_html($v); ?></option>
        <?php endforeach; ?>
      </select>

      <label for="password">Create Password (min 8 characters)</label>
      <input id="password" name="password" type="password" required />

      <button class="btn" type="submit">Submit Request</button>

      <div class="links">
        <a href="<?php echo esc_url(home_url('/admin/login/?cb=' . time() . '&redirect=' . urlencode($redirect))); ?>">Back to Login</a>
      </div>
      <div class="small">Requests may require approval.</div>
    </form>
  </div>
</body>
</html>
