<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");
wp_logout();
if (function_exists('wp_destroy_current_session')) wp_destroy_current_session();
if (function_exists('wp_clear_auth_cookie')) wp_clear_auth_cookie();
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
wp_safe_redirect(home_url('/admin/login?loggedout=1&cb=' . time()));
exit;
