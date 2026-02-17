<?php
// /leader/tracker/logout.php

// --- No cache ---
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");

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

// --- HARD logout ---
wp_logout();

if (function_exists('wp_destroy_current_session')) {
  wp_destroy_current_session();
}

if (function_exists('wp_clear_auth_cookie')) {
  wp_clear_auth_cookie();
}

// extra: nuke common WP cookies just in case
$cookiePath = defined('COOKIEPATH') ? COOKIEPATH : '/';
$cookieDomain = defined('COOKIE_DOMAIN') ? COOKIE_DOMAIN : '';
foreach (['wordpress_', 'wordpress_logged_in_', 'wp-settings-', 'wp-settings-time-'] as $prefix) {
  foreach ($_COOKIE as $k => $v) {
    if (strpos($k, $prefix) === 0) {
      setcookie($k, '', time() - 3600, $cookiePath, $cookieDomain);
      setcookie($k, '', time() - 3600, '/', $cookieDomain);
    }
  }
}

// redirect to login with cache-busting
wp_safe_redirect('/leader/tracker/login.php?loggedout=1&cb=' . time());
exit;
