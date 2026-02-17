<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
if (!isset($_GET['cb'])) { $qs=$_GET; $qs['cb']=time(); wp_safe_redirect(home_url('/admin/dashboard?' . http_build_query($qs))); exit; }
if (!is_user_logged_in()) {
  $redirect = urlencode((is_ssl()?'https://':'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
  wp_safe_redirect(home_url('/admin/login?cb=' . time() . '&redirect=' . $redirect)); exit;
}
$user_id=get_current_user_id();
if ($user_id && get_user_meta($user_id,'tracker_pending',true)) { wp_logout(); wp_safe_redirect(home_url('/admin/login?cb=' . time() . '&pending=1')); exit; }
if (!current_user_can('pgld_adminleader')) { wp_safe_redirect(home_url('/admin/login?cb=' . time())); exit; }
$manifest_path = PGLD_PATH . 'assets/.vite/manifest.json';
$manifest = file_exists($manifest_path) ? json_decode(file_get_contents($manifest_path), true) : [];
$entry = $manifest['index.html'] ?? null;
$js = $entry ? PGLD_URL . 'assets/' . $entry['file'] : '';
$css = ($entry && !empty($entry['css'][0])) ? PGLD_URL . 'assets/' . $entry['css'][0] : '';
?>
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<script>(function(){const url=new URL(location.href);if(!url.searchParams.has('vb')){url.searchParams.set('v',Date.now().toString());url.searchParams.set('vb','1');location.replace(url.pathname+url.search+url.hash);}else{requestAnimationFrame(function(){const u=new URL(location.href);u.searchParams.delete('vb');history.replaceState(null,'',u.pathname+u.search+u.hash);});}})();</script>
<?php if ($css): ?><link rel="stylesheet" href="<?php echo esc_url($css) . '?ver=' . filemtime(PGLD_PATH . 'assets/' . ltrim($entry['css'][0], '/')); ?>"><?php endif; ?>
</head><body><div id="root"></div>
<script>window.PGLD={restUrl:"<?php echo esc_js(home_url('/wp-json/pursue/v1')); ?>",wpRestRoot:"<?php echo esc_js(home_url('/wp-json')); ?>",nonce:"<?php echo esc_js(wp_create_nonce('wp_rest')); ?>",baseUrl:"<?php echo esc_js(home_url('/')); ?>",pluginUrl:"<?php echo esc_js(PGLD_URL); ?>",isAdminRoute:true};</script>
<?php if ($js): ?><script type="module" src="<?php echo esc_url($js) . '?ver=' . filemtime(PGLD_PATH . 'assets/' . ltrim($entry['file'], '/')); ?>"></script><?php endif; ?>
</body></html>
