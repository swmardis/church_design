<?php
$manifest_path = PGLD_PATH . 'assets/.vite/manifest.json';
$manifest = file_exists($manifest_path) ? json_decode(file_get_contents($manifest_path), true) : [];
$entry = $manifest['index.html'] ?? null;
$js = $entry ? PGLD_URL . 'assets/' . $entry['file'] : '';
$css = ($entry && !empty($entry['css'][0])) ? PGLD_URL . 'assets/' . $entry['css'][0] : '';
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<?php if ($css): ?>
<link rel="stylesheet" href="<?php echo esc_url($css) . '?ver=' . filemtime(PGLD_PATH . 'assets/' . ltrim($entry['css'][0], '/')); ?>">
<?php endif; ?>

<!-- MOBILE HERO BUTTON FIX -->
<style>
@media (max-width: 640px) {
  .pgld-featured-wrap {
    margin-top: -3rem !important;
  }
}
@media (max-width: 420px) {
  .pgld-featured-wrap {
    margin-top: -2rem !important;
  }
}
</style>

</head>
<body <?php body_class(); ?>>
<div id="root"></div>

<script>
window.PGLD={
  restUrl:"<?php echo esc_js(home_url('/wp-json/pursue/v1')); ?>",
  wpRestRoot:"<?php echo esc_js(home_url('/wp-json')); ?>",
  nonce:"<?php echo esc_js(wp_create_nonce('wp_rest')); ?>",
  baseUrl:"<?php echo esc_js(home_url('/')); ?>",
  pluginUrl:"<?php echo esc_js(PGLD_URL); ?>",
  isAdminRoute:false
};
</script>

<?php if ($js): ?>
<script type="module" src="<?php echo esc_url($js) . '?ver=' . filemtime(PGLD_PATH . 'assets/' . ltrim($entry['file'], '/')); ?>"></script>
<?php endif; ?>

</body>
</html>
