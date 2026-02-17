<?php
// /leader/tracker/register.php

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

// --- Robustly locate wp-load.php ---
$dir = __DIR__;
$wpLoad = null;
while ($dir !== '/' && $dir !== '.' && $dir !== '') {
  if (file_exists($dir . '/wp-load.php')) { $wpLoad = $dir . '/wp-load.php'; break; }
  $parent = dirname($dir);
  if ($parent === $dir) break;
  $dir = $parent;
}
if (!$wpLoad) { http_response_code(500); echo "ERROR: wp-load.php not found."; exit; }
require_once($wpLoad);

// Where to go after login
$redirect = isset($_GET['redirect']) ? esc_url_raw($_GET['redirect']) : '/leader/dashboard.php';

// If already logged in, bounce forward
if (is_user_logged_in()) {
  wp_safe_redirect($redirect);
  exit;
}

$error = '';
$success = false;

$vals = [
  'full_name' => '',
  'email' => '',
  'group' => '',
];

// Grade group → WP role mapping
$groups = [
  'middleschoolboy'  => 'Middle School Boys',
  'middleschoolgirl' => 'Middle School Girls',
  'highschoolboy'    => 'High School Boys',
  'highschoolgirl'   => 'High School Girls',
];

function tracker_split_name($full) {
  $full = trim(preg_replace('/\s+/', ' ', $full));
  if ($full === '') return ['', ''];
  $parts = explode(' ', $full);
  if (count($parts) === 1) return [$parts[0], ''];
  $first = array_shift($parts);
  $last  = implode(' ', $parts);
  return [$first, $last];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'tracker_register')) {
    $error = 'Security check failed. Please try again.';
  } else {
    $vals['full_name'] = sanitize_text_field($_POST['full_name'] ?? '');
    $vals['email']     = sanitize_email($_POST['email'] ?? '');
    $vals['group']     = sanitize_key($_POST['group'] ?? '');
    $pass              = (string)($_POST['password'] ?? '');
    $redirect          = esc_url_raw($_POST['redirect'] ?? '/leader/dashboard.php');

    if (!$vals['full_name'] || !$vals['email'] || !$vals['group'] || !$pass) {
      $error = 'Please fill out all required fields.';
    } elseif (!is_email($vals['email'])) {
      $error = 'Please enter a valid email address.';
    } elseif (!isset($groups[$vals['group']])) {
      $error = 'Please select a valid grade group.';
    } elseif (strlen($pass) < 8) {
      $error = 'Password must be at least 8 characters.';
    } elseif (email_exists($vals['email'])) {
      $error = 'That email is already in use.';
    } else {
      // Use email as username (simple + consistent; WP can sign in via email)
      $user_login = $vals['email'];

      [$first, $last] = tracker_split_name($vals['full_name']);

      $user_id = wp_insert_user([
        'user_login'   => $user_login,
        'user_pass'    => $pass,
        'user_email'   => $vals['email'],
        'first_name'   => $first,
        'last_name'    => $last,
        'display_name' => $vals['full_name'],
        'role'         => 'subscriber', // keep safe; approve later by assigning requested role
      ]);

      if (is_wp_error($user_id)) {
        $error = $user_id->get_error_message();
      } else {
        // Mark as pending + store requested role
        update_user_meta($user_id, 'tracker_pending', 1);
        update_user_meta($user_id, 'requested_role', $vals['group']);

        // Email admin (optional)
// --- Notify specific admins with approve/deny links ---
$admins = [
    'steven.mardis@outlook.com',
  ];
  
  $token = wp_generate_password(32, false, false);
  update_user_meta($user_id, 'tracker_approve_token', $token);
  update_user_meta($user_id, 'tracker_requested_at', time());
  
  $approve_url = add_query_arg([
    'uid' => $user_id,
    'token' => $token,
    'action' => 'approve',
    'cb' => time(),
  ], home_url('/leader/tracker/access-action.php'));
  
  $deny_url = add_query_arg([
    'uid' => $user_id,
    'token' => $token,
    'action' => 'deny',
    'cb' => time(),
  ], home_url('/leader/tracker/access-action.php'));
  
  $subject = 'New Tracker Access Request';

  $message = '
  <html>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
      <div style="max-width:520px;margin:30px auto;background:#ffffff;border-radius:8px;padding:24px;box-shadow:0 6px 18px rgba(0,0,0,.15)">
        
        <h2 style="margin:0 0 16px;color:#111;">New Tracker Access Request</h2>
  
        <p style="margin:0 0 8px;color:#333;"><strong>Name:</strong> ' . esc_html($vals['full_name']) . '</p>
        <p style="margin:0 0 8px;color:#333;"><strong>Email:</strong> ' . esc_html($vals['email']) . '</p>
        <p style="margin:0 0 16px;color:#333;"><strong>Requested Group:</strong> ' . esc_html($groups[$vals['group']]) . '</p>
  
        <div style="margin-top:24px;">
          <a href="' . esc_url($approve_url) . '"
             style="display:inline-block;padding:12px 18px;background:#16a34a;color:#ffffff;
                    text-decoration:none;font-weight:700;border-radius:6px;margin-right:10px;">
            Approve
          </a>
  
          <a href="' . esc_url($deny_url) . '"
             style="display:inline-block;padding:12px 18px;background:#dc2626;color:#ffffff;
                    text-decoration:none;font-weight:700;border-radius:6px;">
            Deny
          </a>
        </div>
  
        <p style="margin-top:24px;font-size:12px;color:#777;">
          You must be logged in as an administrator to approve or deny this request.
        </p>
  
      </div>
    </body>
  </html>
  ';
  
  $headers = [
    'Content-Type: text/html; charset=UTF-8'
  ];
  
  foreach ($admins as $to) {
    @wp_mail($to, $subject, $message, $headers);
  }
    
        // Send to login (cache-busted)
        wp_safe_redirect('/leader/tracker/login.php?cb=' . time() . '&loggedout=0&redirect=' . urlencode($redirect));
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
      max-width:380px;
      background:#fff;
      border-radius:18px;
      padding:34px 28px 26px;
      box-shadow:0 20px 60px rgba(0,0,0,.45);
      text-align:center;
    }
    .logo{
      margin-bottom:14px;
    }
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
    input, select{
      width:100%;
      padding:14px 12px;
      border:1px solid #cfcfcf;
      border-radius:6px;
      font-size:15px;
      margin-bottom:16px;
      outline:none;
      background:#fff;
    }
    input:focus, select:focus{
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
    }
    .btn:hover{background:#222}
    .links{
      margin-top:16px;
      font-size:13px;
    }
    .links a{
      color:#111;
      text-decoration:none;
    }
    .links a:hover{text-decoration:underline}
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

    <h1>Request Access</h1>

    <?php if (!empty($error)): ?>
      <div class="error"><?php echo esc_html($error); ?></div>
    <?php endif; ?>

    <form method="POST" autocomplete="on">
      <?php wp_nonce_field('tracker_register'); ?>
      <input type="hidden" name="redirect" value="<?php echo esc_attr($redirect); ?>" />

      <input
        type="text"
        name="full_name"
        placeholder="Full Name"
        value="<?php echo esc_attr($vals['full_name']); ?>"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value="<?php echo esc_attr($vals['email']); ?>"
        required
      />

      <select name="group" required>
        <option value="" disabled <?php echo $vals['group']==='' ? 'selected' : ''; ?>>Select Grade Group</option>
        <?php foreach ($groups as $role => $label): ?>
          <option value="<?php echo esc_attr($role); ?>" <?php echo ($vals['group']===$role) ? 'selected' : ''; ?>>
            <?php echo esc_html($label); ?>
          </option>
        <?php endforeach; ?>
      </select>

      <input
        type="password"
        name="password"
        placeholder="Create Password (min 8 characters)"
        minlength="8"
        required
      />

      <button class="btn" type="submit">Submit Request</button>

      <div class="links">
        <a href="/leader/tracker/login.php?cb=<?php echo time(); ?>&redirect=<?php echo urlencode($redirect); ?>">Back to Login</a>
      </div>

      <div class="small">Requests may require approval.</div>
    </form>
  </div>
</body>
</html>
