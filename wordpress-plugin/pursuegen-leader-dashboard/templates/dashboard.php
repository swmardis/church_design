<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
if (!isset($_GET['cb'])) {
  $qs = $_GET;
  $qs['cb'] = time();

  // Preserve the current path (/admin/dashboard, /leader/events, etc.)
  $path = strtok($_SERVER['REQUEST_URI'], '?'); // path only, no query
  wp_safe_redirect(home_url($path) . '?' . http_build_query($qs));
  exit;
}
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
<script>
(function(){
  try {
    var cfg = window.PGLD || {};
    var nonce = cfg.nonce;
    if (!nonce || !window.fetch) return;

    var _fetch = window.fetch.bind(window);

    window.fetch = function(input, init){
      init = init || {};

      if (!init.credentials) {
        init.credentials = 'same-origin';
      }

      var h;
      try { h = new Headers(init.headers || {}); }
      catch(e) { h = init.headers || {}; }

      if (h && h.set && !h.has('X-WP-Nonce')) {
        h.set('X-WP-Nonce', nonce);
      }
      if (h && !h.set && !h['X-WP-Nonce']) {
        h['X-WP-Nonce'] = nonce;
      }

      init.headers = h;
      return _fetch(input, init);
    };
  } catch(e){}
})();
</script>

<?php if ($js): ?><script type="module" src="<?php echo esc_url($js) . '?ver=' . filemtime(PGLD_PATH . 'assets/' . ltrim($entry['file'], '/')); ?>"></script><?php endif; ?>

  <script>
(function () {
  // Force a real server-side logout regardless of what the SPA tries to do.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a,button') : null;
    if (!el) return;

    var text = (el.textContent || '').trim().toLowerCase();
    var href = (el.getAttribute && el.getAttribute('href')) ? el.getAttribute('href') : '';

    // Match common logout variants
    var isLogout =
      text === 'sign out' ||
      text === 'logout' ||
      text === 'log out' ||
      href.indexOf('/wp-json/pursue/v1/logout') !== -1 ||
      href.indexOf('/admin/logout') !== -1;

    if (!isLogout) return;

    e.preventDefault();
    e.stopPropagation();

    // Hard navigate to the server-side logout route that you already confirmed works
    window.location.href = '/admin/logout?cb=' + Date.now();
  }, true);
})();
</script>

<script>
(function () {
  // Force full-page navigation for shortcut links that should NOT be handled by the SPA router.
  // Fixes "Did you forget to add the page to the router?" when href points to /leader/* or *.php
  document.addEventListener('click', function (e) {
    // only left click, no modifier keys
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;

    var href = a.getAttribute('href') || '';
    if (!href) return;

    // ignore anchors and javascript pseudo-links
    if (href === '#' || href.indexOf('javascript:') === 0) return;

    // if it’s a full URL, or a leader php page, hard navigate instead of SPA routing
    var isFullUrl = /^https?:\/\//i.test(href);
    var isLeader = href.indexOf('/leader/') !== -1;
    var isPhp = /\.php(\?|#|$)/i.test(href);

    if (isFullUrl || isLeader || isPhp) {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = href;
    }
  }, true);
})();
</script>


</body></html>
