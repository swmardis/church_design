<?php
if (!defined('ABSPATH')) exit;

nocache_headers();
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if (function_exists('wp_destroy_current_session')) {
    wp_destroy_current_session();
}
wp_logout();
wp_clear_auth_cookie();

wp_safe_redirect(home_url('/admin/login/?loggedout=1&cb=' . time()));
exit;
