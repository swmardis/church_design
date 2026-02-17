<?php
// /leader/tracker/login.php

// --- No cache ---
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

// --- Force cache-busted URL (Cloudflare may cache HTML before PHP runs) ---
if (!isset($_GET['cb'])) {
  $qs = $_GET;
  $qs['cb'] = time();
  $url = strtok($_SERVER["REQUEST_URI"], '?') . '?' . http_build_query($qs);
  header("Location: " . $url, true, 302);
  exit;
}

// Robustly locate wp-load.php
$dir = __DIR__;
$wpLoad = null;
while ($dir !== '/' && $dir !== '.' && $dir !== '') {
  if (file_exists($dir . '/wp-load.php')) {
    $wpLoad = $dir . '/wp-load.php';
    break;
  }
  $parent = dirname($dir);
  if ($parent === $dir) break;
  $dir = $parent;
}
if (!$wpLoad) {
  http_response_code(500);
  echo "ERROR: wp-load.php not found.";
  exit;
}
require_once($wpLoad);

// Where to go after login
$redirect = isset($_GET['redirect']) ? esc_url_raw($_GET['redirect']) : '/leader/dashboard.php';

// If already logged in, bounce
if (is_user_logged_in()) {
  wp_safe_redirect($redirect);
  exit;
}

$error = '';
$loginVal = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $redirect = isset($_POST['redirect']) ? esc_url_raw($_POST['redirect']) : '/leader/dashboard.php';
    $loginVal = isset($_POST['login']) ? sanitize_text_field($_POST['login']) : '';
  $password = isset($_POST['password']) ? (string)$_POST['password'] : '';

  $creds = [
    'user_login'    => $loginVal,   // username OR email
    'user_password' => $password,
    'remember'      => true,
  ];

  $user = wp_signon($creds, is_ssl());

  if (is_wp_error($user)) {
    $error = 'Incorrect email/username or password.';
    } else {
        // --- Approval gate: block pending users even if password is correct ---
        $pending = get_user_meta($user->ID, 'tracker_pending', true);
        if ($pending) {
          wp_logout();
          wp_safe_redirect('/leader/tracker/login.php?cb=' . time() . '&pending=1');
          exit;
        }
      
        wp_safe_redirect($redirect);
        exit;
      }
      }
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign in</title>
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
      max-width:380px;
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
    input[type="password"]{
      width:100%;
      padding:14px 12px;
      border:1px solid #cfcfcf;
      border-radius:6px;
      font-size:15px;
      margin-bottom:16px;
      outline:none;
      background:#fff;
    }
    input:focus{
      border-color:#999;
    }
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
    .links a{
      color:#111;
      text-decoration:none;
    }
    .links a:hover{text-decoration:underline}
    .links span{margin:0 6px; opacity:.5}
    .small{
      margin-top:10px;
      font-size:12px;
      color:#666;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <img src="https://pursuegen.com/logo/logobk.png" alt="Logo">
    </div>

    <h1>Sign in</h1>

    <?php if (!empty($error)): ?>
      <div class="error"><?php echo esc_html($error); ?></div>
    <?php endif; ?>

    <?php if (isset($_GET['pending'])): ?>
  <div class="error" style="background:#eef6ff;border-color:#c9e2ff;color:#114b8b">
    Your access request has been received and is awaiting approval.
  </div>
<?php endif; ?>


    <form method="POST" autocomplete="on">
      <input type="hidden" name="redirect" value="<?php echo esc_attr($redirect); ?>" />

      <label for="login">Email or Username</label>
      <input
        id="login"
        name="login"
        type="text"
        inputmode="email"
        autocomplete="username"
        value="<?php echo esc_attr($loginVal); ?>"
        required
      />

      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required />

      <button class="btn" type="submit">Sign in</button>

      <div class="links">
        <a href="/leader/tracker/register.php?cb=<?php echo time(); ?>&redirect=<?php echo urlencode($redirect); ?>">Request Access</a>
        <span>|</span>
        <a href="<?php echo esc_url(wp_lostpassword_url()); ?>">Forgot password?</a>
      </div>

    </form>
  </div>

  <script>
    document.getElementById('login')?.focus();
  </script>
</body>
</html>
