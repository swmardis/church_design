<?php
/**
 * Plugin Name: PursueGen Leader Dashboard
 * Description: WordPress-native frontend + leader dashboard + auth gates for pursuegen.com.
 * Version: 1.0.0
 * Author: PursueGen
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PGLD_PATH', plugin_dir_path(__FILE__));
define('PGLD_URL', plugin_dir_url(__FILE__));

require_once PGLD_PATH . 'includes/class-pgld-plugin.php';

PGLD_Plugin::instance();
