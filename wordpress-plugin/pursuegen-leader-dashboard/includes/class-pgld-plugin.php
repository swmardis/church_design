<?php

if (!defined('ABSPATH')) {
    exit;
}

class PGLD_Plugin {
    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', [$this, 'register_routes']);
        add_action('rest_api_init', [$this, 'register_rest']);
        add_action('template_redirect', [$this, 'template_router']);
        add_filter('template_include', [$this, 'front_template']);
        add_action('admin_post_nopriv_pgld_access_action', [$this, 'access_action']);
        add_action('admin_post_pgld_access_action', [$this, 'access_action']);
        register_activation_hook(PGLD_PATH . 'pursuegen-leader-dashboard.php', [$this, 'activate']);
    }

    public function activate() {
        $this->add_caps();
        $this->register_routes();
        flush_rewrite_rules();
        $this->seed_defaults();
    }

    private function add_caps() {
        // Admin/manage capability
        foreach (['administrator', 'adminleader'] as $role_name) {
            $role = get_role($role_name);
            if ($role) {
                $role->add_cap('pgld_adminleader');
                $role->add_cap('pgld_leader_view');
            }
        }
    
        // View-only capability for group leaders
        foreach (['middleschoolboy','middleschoolgirl','highschoolboy','highschoolgirl'] as $role_name) {
            $role = get_role($role_name);
            if ($role) {
                $role->add_cap('pgld_leader_view');
            }
        }
    }
    
    private function seed_defaults() {
// HOME: seed OR repair missing sections
$home = get_option('pursue_content_home', []);
if (!is_array($home)) $home = [];

$home_changed = false;

$has_section = function($key) use (&$home) {
    foreach ($home as $item) {
        if (($item['sectionKey'] ?? '') === $key) return true;
    }
    return false;
};

$add_section = function($key, $content) use (&$home, &$home_changed) {
    $home[] = [
        'id' => count($home) + 1,
        'pageSlug' => 'home',
        'sectionKey' => $key,
        'content' => $content,
        'updatedAt' => current_time('mysql'),
    ];
    $home_changed = true;
};

// hero
if (!$has_section('hero')) {
    $add_section('hero', [
        'title' => 'Welcome to Our Church',
        'subtitle' => 'A place to call home',
        'primaryButtonText' => 'Join Us',
        'primaryButtonUrl' => '/next-steps',
        'secondaryButtonText' => 'Watch Online',
        'secondaryButtonUrl' => '/events',
        'backgroundImage' => 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80'
    ]);
}

// schedule
if (!$has_section('schedule')) {
    $add_section('schedule', [
        'title' => 'Weekly Schedule',
        'description' => 'Join us every Sunday at 9:00 AM and 11:00 AM.',
        'times' => [
            ['label' => 'Classic Service', 'time' => '9:00 AM'],
            ['label' => 'Modern Service', 'time' => '11:00 AM']
        ]
    ]);
}

// ⭐ featured cards (UI expects sectionKey = "featured" and card.link)
if (!$has_section('featured')) {
    $add_section('featured', [
        'cards' => [
            [
                'title' => "I'm New Here",
                'description' => "First time? We'd love to meet you.",
                'link' => '/next-steps'
            ],
            [
                'title' => "Connect Groups",
                'description' => "Find community and grow together.",
                'link' => '/next-steps'
            ],
            [
                'title' => "Prayer Requests",
                'description' => "How can we pray for you today?",
                'link' => '/contact'
            ],
        ]
    ]);
}

// Repair: if we already have 'featured_cards' stored, copy/normalize it into 'featured'
if ($has_section('featured_cards') && !$has_section('featured')) {
    foreach ($home as $it) {
        if (($it['sectionKey'] ?? '') === 'featured_cards') {
            $content = $it['content'] ?? ['cards' => []];

            // normalize url -> link
            if (isset($content['cards']) && is_array($content['cards'])) {
                $content['cards'] = array_map(function($c) {
                    if (!is_array($c)) return $c;
                    if (!isset($c['link']) && isset($c['url'])) $c['link'] = $c['url'];
                    return $c;
                }, $content['cards']);
            }

            $add_section('featured', $content);
            break;
        }
    }
}


if ($home_changed) {
    update_option('pursue_content_home', array_values($home));
}

// Ensure home featured sections are consistent (one-time repair at activation)
$this->repair_home_featured_if_needed();


        if (!get_option('pursue_content_about')) {
            update_option('pursue_content_about', [
                ['id'=>1,'pageSlug'=>'about','sectionKey'=>'intro','content'=>['title'=>'Who We Are','body'=>'We are a community of believers passionate about sharing the love of Christ.']],
                ['id'=>2,'pageSlug'=>'about','sectionKey'=>'values','content'=>['title'=>'What to Expect','body'=>'Join us for worship, teaching, and fellowship.']],
                ['id'=>3,'pageSlug'=>'about','sectionKey'=>'team','content'=>['leaders'=>[['name'=>'Pastor John Doe','role'=>'Lead Pastor','imageUrl'=>'']]]],
            ]);
        }

        if (!get_option('pursue_content_next-steps')) {
            update_option('pursue_content_next-steps', [
                ['id'=>1,'pageSlug'=>'next-steps','sectionKey'=>'steps','content'=>['list'=>[['title'=>'Attend a Service','description'=>'Join us this Sunday at 9AM or 11AM.','buttonText'=>'Plan Your Visit','buttonUrl'=>'/']]]],
            ]);
        }

        if (!get_option('pursue_content_contact')) {
            update_option('pursue_content_contact', [
                ['id'=>1,'pageSlug'=>'contact','sectionKey'=>'info','content'=>['address'=>'123 Main St, Anytown, USA','email'=>'info@church.com','phone'=>'(555) 123-4567','serviceTimes'=>'Sundays at 9:00 AM & 11:00 AM']],
            ]);
        }

        if (!get_option('pursue_settings')) {
            update_option('pursue_settings', [
                ['key'=>'site_name','value'=>'Grace Community Church'],
                ['key'=>'primary_color','value'=>'#1e293b'],
                ['key'=>'secondary_color','value'=>'#f1f5f9'],
                ['key'=>'contact_email','value'=>'info@church.com'],
            ]);
        }

        if (!get_option('pursue_shortcuts')) {
            update_option('pursue_shortcuts', [
                ['id'=>1,'title'=>'Home Page','description'=>'Edit home sections','icon'=>'LayoutTemplate','href'=>'/leader/home','color'=>'text-blue-500','bgColor'=>'bg-blue-500/10','order'=>1],
                ['id'=>2,'title'=>'Events','description'=>'Manage calendar','icon'=>'Calendar','href'=>'/leader/events','color'=>'text-purple-500','bgColor'=>'bg-purple-500/10','order'=>2],
            ]);
        }
    }

    public function register_routes() {
      // Admin routes
      add_rewrite_rule('^admin/login/?$', 'index.php?pgld_route=admin_login', 'top');
      add_rewrite_rule('^admin/register/?$', 'index.php?pgld_route=admin_register', 'top');
      add_rewrite_rule('^admin/logout/?$', 'index.php?pgld_route=admin_logout', 'top');
      add_rewrite_rule('^admin/dashboard/?$', 'index.php?pgld_route=admin_dashboard', 'top');
  
      // Leader SPA routes (serve the same SPA shell)
      add_rewrite_rule('^leader/?$', 'index.php?pgld_route=leader_dashboard', 'top');
      add_rewrite_rule('^leader/.+/?$', 'index.php?pgld_route=leader_dashboard', 'top');
  }
  
    public function register_rest() {
        register_rest_route('pursue/v1', '/content/(?P<page>[a-zA-Z0-9\-]+)', [
            'methods' => 'GET', 'callback' => [$this, 'content_get_page'], 'permission_callback' => '__return_true',
        ]);
        register_rest_route('pursue/v1', '/content/(?P<page>[a-zA-Z0-9\-]+)/(?P<sectionKey>[a-zA-Z0-9_\-]+)', [
            'methods' => 'POST', 'callback' => [$this, 'content_update_section'], 'permission_callback' => [$this, 'can_edit'],
        ]);

        register_rest_route('pursue/v1', '/events', [
            ['methods' => 'GET', 'callback' => [$this, 'events_list'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'events_create'], 'permission_callback' => [$this, 'can_edit']],
        ]);
        register_rest_route('pursue/v1', '/events/(?P<id>\d+)', [
            ['methods' => 'PUT', 'callback' => [$this, 'events_update'], 'permission_callback' => [$this, 'can_edit']],
            ['methods' => 'DELETE', 'callback' => [$this, 'events_delete'], 'permission_callback' => [$this, 'can_edit']],
        ]);

        register_rest_route('pursue/v1', '/media', [
            ['methods' => 'GET', 'callback' => [$this, 'media_list'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'media_upload'], 'permission_callback' => [$this, 'can_edit']],
        ]);
        register_rest_route('pursue/v1', '/media/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'media_delete'], 'permission_callback' => [$this, 'can_edit'],
        ]);

        register_rest_route('pursue/v1', '/settings', [
            ['methods' => 'GET', 'callback' => [$this, 'settings_get'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'settings_update'], 'permission_callback' => [$this, 'can_edit']],
        ]);

        register_rest_route('pursue/v1', '/shortcuts', [
            ['methods' => 'GET', 'callback' => [$this, 'shortcuts_list'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'shortcuts_add'], 'permission_callback' => [$this, 'can_edit']],
        ]);
        register_rest_route('pursue/v1', '/shortcuts/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'shortcuts_delete'], 'permission_callback' => [$this, 'can_edit'],
        ]);

        // === Resources ===
register_rest_route('pursue/v1', '/resources', [
    ['methods' => 'GET',  'callback' => [$this, 'resources_list'],   'permission_callback' => [$this, 'can_view_leader']],
    ['methods' => 'POST', 'callback' => [$this, 'resources_create'], 'permission_callback' => [$this, 'can_edit']],
]);

register_rest_route('pursue/v1', '/resources/(?P<id>[a-zA-Z0-9\-_]+)', [
    ['methods' => 'PUT',    'callback' => [$this, 'resources_update'], 'permission_callback' => [$this, 'can_edit']],
    ['methods' => 'DELETE', 'callback' => [$this, 'resources_delete'], 'permission_callback' => [$this, 'can_edit']],
]);

register_rest_route('pursue/v1', '/resources/bulk-delete', [
    ['methods' => 'POST', 'callback' => [$this, 'resources_bulk_delete'], 'permission_callback' => [$this, 'can_edit']],
]);

register_rest_route('pursue/v1', '/resources/(?P<id>[a-zA-Z0-9\-_]+)/favorite', [
    ['methods' => 'POST', 'callback' => [$this, 'resources_toggle_favorite'], 'permission_callback' => [$this, 'can_view_leader']],
]);


        // Admin: users management (used by the dashboard Users page)
        register_rest_route('pursue/v1', '/admin/users', [
          ['methods' => 'GET',  'callback' => [$this, 'admin_users_list'],   'permission_callback' => [$this, 'can_edit']],
          ['methods' => 'POST', 'callback' => [$this, 'admin_users_create'], 'permission_callback' => [$this, 'can_edit']],
      ]);

      register_rest_route('pursue/v1', '/admin/users/(?P<id>\d+)', [
        // Allow GET so you can sanity-check auth/permissions in the browser without deleting.
        ['methods' => 'GET',    'callback' => [$this, 'admin_users_get'],    'permission_callback' => [$this, 'can_edit']],
    
        // Deletion methods used by the UI
        ['methods' => 'DELETE', 'callback' => [$this, 'admin_users_delete'], 'permission_callback' => [$this, 'can_edit']],
        ['methods' => 'POST',   'callback' => [$this, 'admin_users_delete'], 'permission_callback' => [$this, 'can_edit']],
    ]);
    
      // Approve/Deny user (role change)
      register_rest_route('pursue/v1', '/admin/users/(?P<id>\d+)/role', [
          ['methods' => 'POST',  'callback' => [$this, 'admin_users_set_role'], 'permission_callback' => [$this, 'can_edit']],
          ['methods' => 'PUT',   'callback' => [$this, 'admin_users_set_role'], 'permission_callback' => [$this, 'can_edit']],
          ['methods' => 'PATCH', 'callback' => [$this, 'admin_users_set_role'], 'permission_callback' => [$this, 'can_edit']],
      ]);



        register_rest_route('pursue/v1', '/auth/user', [
            'methods' => 'GET', 'callback' => [$this, 'auth_user'], 'permission_callback' => '__return_true',
        ]);
        register_rest_route('pursue/v1', '/logout', [
            'methods' => 'GET', 'callback' => [$this, 'logout_api'], 'permission_callback' => '__return_true',
        ]);
    }

    public function can_edit() {
        if (!is_user_logged_in()) return false;
    
        $u = wp_get_current_user();
        $roles = (array) $u->roles;
    
        // allow site admins OR explicit role
        if (in_array('administrator', $roles, true)) return true;
        if (in_array('adminleader', $roles, true)) return true;
    
        // fallback: allow if capability exists
        if (current_user_can('pgld_adminleader')) return true;
    
        return false;
    }

    function repair_home_featured_if_needed() {
        $home = get_option('pursue_content_home', []);
        if (!is_array($home)) $home = [];
    
        $featured_index = null;
        $featured_cards_index = null;
    
        foreach ($home as $i => $item) {
            $k = $item['sectionKey'] ?? '';
            if ($k === 'featured') $featured_index = $i;
            if ($k === 'featured_cards') $featured_cards_index = $i;
        }
    
        // Helpers
        $normalize_cards = function($cards) {
            if (!is_array($cards)) return [];
            $site = rtrim(home_url(), '/');
    
            return array_values(array_map(function($c) use ($site) {
                if (!is_array($c)) return $c;
    
                // url -> link
                if (!isset($c['link']) && isset($c['url'])) {
                    $c['link'] = $c['url'];
                }
    
                // if link is same-origin absolute, store as path (cleaner)
                if (isset($c['link']) && is_string($c['link'])) {
                    $link = $c['link'];
                    if (str_starts_with($link, $site)) {
                        $link = substr($link, strlen($site));
                        if ($link === '') $link = '/';
                        $c['link'] = $link;
                    }
                }
    
                return $c;
            }, $cards));
        };
    
        $is_empty_cards = function($idx) use (&$home) {
            if ($idx === null) return true;
            $cards = $home[$idx]['content']['cards'] ?? null;
            return !is_array($cards) || count($cards) === 0;
        };
    
        // Default cards (React expects `link`)
        $defaults = [
            'cards' => [
                [
                    'title' => "I'm New Here",
                    'description' => "First time? We'd love to meet you.",
                    'link' => '/next-steps'
                ],
                [
                    'title' => "Connect Groups",
                    'description' => "Find community and grow together.",
                    'link' => '/next-steps'
                ],
                [
                    'title' => "Prayer Requests",
                    'description' => "How can we pray for you today?",
                    'link' => '/contact'
                ],
            ]
        ];
    
        $changed = false;
    
        // Ensure 'featured' exists
        if ($featured_index === null) {
            $home[] = [
                'id' => count($home) + 1,
                'pageSlug' => 'home',
                'sectionKey' => 'featured',
                'content' => ['cards' => []],
                'updatedAt' => current_time('mysql'),
            ];
            $featured_index = count($home) - 1;
            $changed = true;
        }
    
        // Normalize featured cards if present
        $existing_featured_cards = $home[$featured_index]['content']['cards'] ?? [];
        $home[$featured_index]['content']['cards'] = $normalize_cards($existing_featured_cards);
    
        // If featured empty, try to copy from featured_cards
        if ($is_empty_cards($featured_index) && $featured_cards_index !== null) {
            $cards_src = $home[$featured_cards_index]['content']['cards'] ?? [];
            $cards_src = $normalize_cards($cards_src);
    
            if (count($cards_src) > 0) {
                $home[$featured_index]['content'] = ['cards' => $cards_src];
                $home[$featured_index]['updatedAt'] = current_time('mysql');
                $changed = true;
            }
        }
    
        // If featured still empty, seed defaults
        if ($is_empty_cards($featured_index)) {
            $home[$featured_index]['content'] = $defaults;
            $home[$featured_index]['updatedAt'] = current_time('mysql');
            $changed = true;
        }
    
        // IMPORTANT: Do NOT overwrite featured_cards if it already has data.
        // Only create it if missing, or fill it if empty.
        if ($featured_cards_index === null) {
            $home[] = [
                'id' => count($home) + 1,
                'pageSlug' => 'home',
                'sectionKey' => 'featured_cards',
                'content' => $home[$featured_index]['content'],
                'updatedAt' => current_time('mysql'),
            ];
            $changed = true;
        } else {
            $cards_fc = $home[$featured_cards_index]['content']['cards'] ?? [];
            if (!is_array($cards_fc) || count($cards_fc) === 0) {
                $home[$featured_cards_index]['content'] = $home[$featured_index]['content'];
                $home[$featured_cards_index]['updatedAt'] = current_time('mysql');
                $changed = true;
            }
        }
    
        if ($changed) {
            update_option('pursue_content_home', array_values($home));
        }
    }
        
    
    public function content_get_page($req) {
        // Prevent browser/CF from caching content JSON (critical for admin editor)
        nocache_headers();
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
    
        $page = sanitize_key($req['page']);
    
        if ($page === 'home') {
            $this->repair_home_featured_if_needed();
        }
    
        $resp = rest_ensure_response(get_option('pursue_content_' . $page, []));
        $resp->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $resp->header('Pragma', 'no-cache');
        $resp->header('Expires', '0');
        return $resp;
    }
            
    public function content_update_section($req) {
        $page = sanitize_key($req['page']);
        $key  = sanitize_key($req['sectionKey']);
        $body = $req->get_json_params();
        if (!is_array($body)) $body = [];
        // Support both payload styles:
// 1) { "content": { ... } }  (legacy)
// 2) { ... }                (current React app)
$incoming = (isset($body['content']) && is_array($body['content'])) ? $body['content'] : $body;

if ($page === 'home' && ($key === 'featured' || $key === 'featured_cards')) {
    if (!isset($incoming['cards']) || !is_array($incoming['cards'])) {
        $incoming['cards'] = [];
    }
}

    
        // Normalize featured key variants for home
        $also_update_key = null;
        if ($page === 'home') {
            if ($key === 'featured_cards') {
                $key = 'featured';
                $also_update_key = 'featured_cards';
            } elseif ($key === 'featured') {
                $also_update_key = 'featured_cards';
            }
        }
    
        $list = get_option('pursue_content_' . $page, []);
        if (!is_array($list)) $list = [];
    
        $found_main = false;
        $found_alias = false;
    
        foreach ($list as &$item) {
            $section = $item['sectionKey'] ?? '';
    
            if ($section === $key) {
                $item['content'] = $incoming;
                $item['updatedAt'] = current_time('mysql');
                $found_main = true;
            }
    
            if ($also_update_key && $section === $also_update_key) {
                $item['content'] = $incoming;
                $item['updatedAt'] = current_time('mysql');
                $found_alias = true;
            }
        }
        unset($item);
    
        // Create missing section(s)
        if (!$found_main) {
            $list[] = [
                'id' => count($list) + 1,
                'pageSlug' => $page,
                'sectionKey' => $key,
                'content' => $incoming,
                'updatedAt' => current_time('mysql'),
            ];
        }
    
        if ($also_update_key && !$found_alias) {
            $list[] = [
                'id' => count($list) + 1,
                'pageSlug' => $page,
                'sectionKey' => $also_update_key,
                'content' => $incoming,
                'updatedAt' => current_time('mysql'),
            ];
        }
    
        update_option('pursue_content_' . $page, array_values($list));

    
        // Return the canonical item (the $key one)
        for ($i = count($list) - 1; $i >= 0; $i--) {
            if (($list[$i]['sectionKey'] ?? '') === $key) {
                return rest_ensure_response($list[$i]);
            }
        }
    
        return rest_ensure_response(end($list));
    }
    
    public function events_list() {
        $posts = get_posts([
          'post_type'      => 'pursue_event',
          'posts_per_page' => -1,
          'orderby'        => 'date',
          'order'          => 'ASC',
          'fields'         => 'ids',
        ]);
      
        $out = array_map(function($id) {
          return $this->event_shape((int)$id);
        }, $posts);
      
        return rest_ensure_response($out);
      }
      public function events_update($req) {
        $id = (int)$req['id'];
        $d  = $req->get_json_params();
    
        if (isset($d['title'])) {
            wp_update_post(['ID'=>$id,'post_title'=>sanitize_text_field($d['title'])]);
        }
        if (isset($d['description'])) {
            wp_update_post(['ID'=>$id,'post_content'=>sanitize_textarea_field($d['description'])]);
        }
    
        // normalize primitives
        foreach (['date','time','location','imageUrl','isPlanningCenter','pcoId'] as $k) {
            if (array_key_exists($k, $d)) {
                $val = $d[$k];
                if ($val === null) $val = '';
                update_post_meta($id, $k, $val);
            }
        }
    
        // normalize tags to array
        if (array_key_exists('tags', $d)) {
            $tags = $d['tags'];
            if (!is_array($tags)) $tags = $tags ? (array)$tags : [];
            update_post_meta($id, 'tags', array_values($tags));
        }
    
        return rest_ensure_response($this->event_shape($id));
    }

    public function events_create($req) {
        $d = $req->get_json_params();
        if (!is_array($d)) $d = [];
    
        $title = sanitize_text_field($d['title'] ?? '');
        if ($title === '') {
            return new WP_Error('missing_title', 'Title is required', ['status' => 400]);
        }
    
        $desc = isset($d['description']) ? wp_kses_post($d['description']) : '';
    
        $id = wp_insert_post([
            'post_type'    => 'pursue_event',
            'post_status'  => 'publish',
            'post_title'   => $title,
            'post_content' => $desc,
        ], true);
    
        if (is_wp_error($id)) {
            return $id;
        }
    
        // normalize primitives
        foreach (['date','time','location','imageUrl','isPlanningCenter','pcoId'] as $k) {
            if (array_key_exists($k, $d)) {
                $val = $d[$k];
                if ($val === null) $val = '';
                update_post_meta($id, $k, $val);
            }
        }
    
        // normalize tags to array
        $tags = $d['tags'] ?? [];
        if (!is_array($tags)) $tags = $tags ? (array)$tags : [];
        update_post_meta($id, 'tags', array_values($tags));
    
        return rest_ensure_response($this->event_shape((int)$id));
    }
    
        public function events_delete($req) { wp_delete_post((int)$req['id'], true); return new WP_REST_Response(null,204); }
        private function event_shape($id){
            // Always return a valid YYYY-MM-DD date for React
            $raw_date = (string) get_post_meta($id,'date',true);
        
            $fallback_ts = strtotime(
                get_post_field('post_date_gmt',$id)
                ?: get_post_field('post_date',$id)
                ?: 'now'
            );
        
            $date_ts = $raw_date ? strtotime($raw_date) : false;
            $safe_date = date('Y-m-d', $date_ts ? $date_ts : $fallback_ts);
        
            $tags = get_post_meta($id,'tags',true);
            if (!is_array($tags)) {
                $tags = array_values(array_filter(
                    array_map('trim', explode(',', (string)$tags))
                ));
            }
        
            return [
                'id' => $id,
                'title' => get_the_title($id),
                'description' => get_post_field('post_content',$id),
                'date' => $safe_date,
                'time' => (string) get_post_meta($id,'time',true),
                'location' => (string) get_post_meta($id,'location',true),
                'imageUrl' => (string) get_post_meta($id,'imageUrl',true),
                'tags' => $tags ?: [],
                'isPlanningCenter' => (bool) get_post_meta($id,'isPlanningCenter',true),
                'pcoId' => (string) get_post_meta($id,'pcoId',true),
                'createdAt' => get_post_field('post_date',$id),
            ];
        }
            
    public function media_list(){ $items=[]; foreach(get_posts(['post_type'=>'attachment','posts_per_page'=>-1]) as $a){ $items[]=['id'=>$a->ID,'url'=>wp_get_attachment_url($a->ID),'filename'=>basename(get_attached_file($a->ID)),'mimeType'=>get_post_mime_type($a->ID),'uploadedAt'=>$a->post_date]; } return rest_ensure_response($items); }
    public function media_upload($req){ if(empty($_FILES['file'])) return new WP_Error('no_file','No file uploaded',['status'=>400]); require_once ABSPATH . 'wp-admin/includes/file.php'; require_once ABSPATH . 'wp-admin/includes/media.php'; require_once ABSPATH . 'wp-admin/includes/image.php'; $id=media_handle_upload('file',0); if(is_wp_error($id)) return $id; return rest_ensure_response(['id'=>$id,'url'=>wp_get_attachment_url($id),'filename'=>basename(get_attached_file($id)),'mimeType'=>get_post_mime_type($id),'uploadedAt'=>get_post_field('post_date',$id)]); }
    public function media_delete($req){
      $id = (int)$req['id'];
      wp_delete_attachment($id, true);
      return rest_ensure_response(['ok'=>true,'deletedId'=>(string)$id]);
    }
    
    public function settings_get(){ return rest_ensure_response(get_option('pursue_settings',[])); }
    public function settings_update($req){ $d=$req->get_json_params(); update_option('pursue_settings',$d); return rest_ensure_response($d); }

    public function shortcuts_list(){ return rest_ensure_response(get_option('pursue_shortcuts',[])); }
    public function shortcuts_add($req){ $d=$req->get_json_params(); $list=get_option('pursue_shortcuts',[]); $d['id']=count($list)+1; $list[]=$d; update_option('pursue_shortcuts',$list); return rest_ensure_response($d); }
    public function shortcuts_delete($req){ $id=(int)$req['id']; $list=array_values(array_filter(get_option('pursue_shortcuts',[]),fn($x)=>(int)$x['id']!==$id)); update_option('pursue_shortcuts',$list); return new WP_REST_Response(null,204); }

// ----------------------------
// Admin: users management
// ----------------------------
private function user_role_label($user_id) {
    // Keep meta-based gating first
    if (get_user_meta($user_id, 'tracker_denied', true)) {
        return 'denied';
    }
    if (get_user_meta($user_id, 'tracker_pending', true)) {
        return 'pending';
    }
  
    $u = get_userdata($user_id);
    $roles = $u ? (array) $u->roles : [];
  
    // Map WP roles -> API role strings the React app will use
    if (in_array('administrator', $roles, true) || in_array('adminleader', $roles, true) || user_can($user_id, 'pgld_adminleader')) {
        return 'admin_leader';
    }
  
    foreach (['middleschoolboy','middleschoolgirl','highschoolboy','highschoolgirl'] as $r) {
        if (in_array($r, $roles, true)) return $r;
    }
  
    return 'denied';
  }
  
private function user_shape($u) {
  $id = (int) $u->ID;
  return [
      'id'        => (string) $id,
      'email'     => $u->user_email,
      'firstName' => $u->first_name,
      'lastName'  => $u->last_name,
      'profileImageUrl' => '',
      'role'      => $this->user_role_label($id),
      'createdAt' => $u->user_registered,
      'updatedAt' => $u->user_registered,
  ];
}

public function admin_users_list() {
  $users = get_users([
      'fields' => ['ID','user_email','user_registered','first_name','last_name'],
      'orderby' => 'registered',
      'order' => 'DESC',
      'number' => 500,
  ]);

  $out = [];
  foreach ($users as $u) {
      // Only show users who are relevant to the leader portal (pending/denied/admin)
      $role = $this->user_role_label($u->ID);
      if ($role === 'admin_leader' || get_user_meta($u->ID, 'tracker_pending', true) || get_user_meta($u->ID, 'tracker_denied', true)) {
          $out[] = $this->user_shape($u);
      }
  }
  return rest_ensure_response($out);
}

public function admin_users_create($req) {
  $d = $req->get_json_params();

  $email = sanitize_email($d['email'] ?? '');
  $first = sanitize_text_field($d['firstName'] ?? '');
  $last  = sanitize_text_field($d['lastName'] ?? '');
  $pass  = (string) ($d['password'] ?? wp_generate_password(12, true));
  $role  = sanitize_key($d['role'] ?? 'admin_leader');

  if (!$email) {
      return new WP_Error('missing_email', 'Email is required', ['status' => 400]);
  }

  $existing = get_user_by('email', $email);
  if ($existing) {
      // If they already exist, just update name + role.
      wp_update_user([
          'ID' => $existing->ID,
          'first_name' => $first,
          'last_name' => $last,
      ]);
      $this->apply_user_role($existing->ID, $role);
      return rest_ensure_response($this->user_shape(get_userdata($existing->ID)));
  }

  $username = sanitize_user(strstr($email, '@', true), true);
  if (!$username) {
      $username = 'user' . time();
  }
  // Ensure unique username
  $base = $username;
  $i = 1;
  while (username_exists($username)) {
      $username = $base . $i;
      $i++;
  }

  $user_id = wp_create_user($username, $pass, $email);
  if (is_wp_error($user_id)) {
      return $user_id;
  }

  wp_update_user([
      'ID' => $user_id,
      'first_name' => $first,
      'last_name' => $last,
  ]);

  $this->apply_user_role($user_id, $role);

  return rest_ensure_response($this->user_shape(get_userdata($user_id)));
}

public function admin_users_set_role($req) {
  $id = (int) $req['id'];
  if (!$id) {
      return new WP_Error('bad_user', 'Invalid user id', ['status' => 400]);
  }

  $d = $req->get_json_params();
  $role = sanitize_key($d['role'] ?? '');
  if (!$role) {
      return new WP_Error('missing_role', 'Role is required', ['status' => 400]);
  }

  // Safety: never modify administrators via this endpoint.
  $u = get_userdata($id);
  if (!$u) {
      return new WP_Error('not_found', 'User not found', ['status' => 404]);
  }
  if (in_array('administrator', (array) $u->roles, true)) {
      return new WP_Error('forbidden', 'Cannot modify administrators', ['status' => 403]);
  }

  $this->apply_user_role($id, $role);
  return rest_ensure_response($this->user_shape(get_userdata($id)));
}

public function admin_users_get($req) {
  $id = (int) $req['id'];
  if (!$id) {
      return new WP_Error('bad_user', 'Invalid user id', ['status' => 400]);
  }
  $u = get_userdata($id);
  if (!$u) {
      return new WP_Error('not_found', 'User not found', ['status' => 404]);
  }
  return rest_ensure_response($this->user_shape($u));
}


public function admin_users_delete($req) {
  $id = (int) $req['id'];
  if (!$id) {
      return new WP_Error('bad_user', 'Invalid user id', ['status' => 400]);
  }

  $u = get_userdata($id);
  if (!$u) {
      return new WP_Error('not_found', 'User not found', ['status' => 404]);
  }

  // Safety: never delete administrators.
  if (in_array('administrator', (array) $u->roles, true)) {
      return new WP_Error('forbidden', 'Cannot delete administrators', ['status' => 403]);
  }

  require_once ABSPATH . 'wp-admin/includes/user.php';
  wp_delete_user($id);

  // Return JSON so the frontend doesn't choke on an empty 204 response
  return rest_ensure_response(['ok' => true, 'deletedId' => (string)$id]);
  }

  private function apply_user_role($user_id, $role) {
    $role = sanitize_key($role);
  
    $allowed = [
      'admin_leader',
      'middleschoolboy',
      'middleschoolgirl',
      'highschoolboy',
      'highschoolgirl',
      'pending',
      'denied',
    ];
  
    if (!in_array($role, $allowed, true)) {
      $role = 'denied';
    }
  
    // Normalize flags
    delete_user_meta($user_id, 'tracker_denied');
    delete_user_meta($user_id, 'tracker_pending');
  
    $u = new WP_User($user_id);
  
    // Always remove admin cap first, then re-add only if needed
    $u->remove_cap('pgld_adminleader');
  
    if ($role === 'admin_leader') {
        $u->set_role('adminleader');
        $u->add_cap('pgld_adminleader');
        return;
    }
  
    // Grade-group leader roles
    if (in_array($role, ['middleschoolboy','middleschoolgirl','highschoolboy','highschoolgirl'], true)) {
        // These roles already get pgld_leader_view in add_caps()
        $u->set_role($role);
        return;
    }
  
    // pending/denied -> subscriber + flags
    if (!in_array('subscriber', (array) $u->roles, true)) {
        $u->set_role('subscriber');
    }
  
    if ($role === 'pending') {
        update_user_meta($user_id, 'tracker_pending', 1);
    }
  
    if ($role === 'denied') {
        update_user_meta($user_id, 'tracker_pending', 1);
        update_user_meta($user_id, 'tracker_denied', 1);
    }
  }
  

  public function auth_user(){
    if (!is_user_logged_in()) {
        return new WP_REST_Response(['message'=>'Unauthorized'], 401);
    }
    $u = wp_get_current_user();
    $role = $this->user_role_label($u->ID);

    return [
      'id'=>(string)$u->ID,
      'email'=>$u->user_email,
      'firstName'=>$u->first_name,
      'lastName'=>$u->last_name,
      'profileImageUrl'=>'',
      'role'=>$role,
      'createdAt'=>$u->user_registered,
      'updatedAt'=>$u->user_registered
    ];
}

    public function logout_api() {
      // No-cache headers so Cloudflare/Bluehost never replays this
      nocache_headers();
      header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
      header('Pragma: no-cache');
      header('Expires: 0');
  
      // Destroy the WP session + cookies
      if (function_exists('wp_destroy_current_session')) {
          wp_destroy_current_session();
      }
      wp_logout();
      wp_clear_auth_cookie();
  
      // For navigations (your case), do a hard redirect to login
      wp_safe_redirect(home_url('/admin/login/?loggedout=1&cb=' . time()));
      exit;
  }
  

    public function front_template($template) {
        if (is_admin() || get_query_var('pgld_route')) {
            return $template;
        }
        if (is_front_page() || is_page('pursue-home')) {
            return PGLD_PATH . 'templates/public.php';
        }
        return $template;
    }

    public function template_router() {
        $route = get_query_var('pgld_route');
        if (!$route) return;
    
        $this->send_no_cache();
    
        switch ($route) {
            case 'admin_login':
                require PGLD_PATH . 'templates/login.php';
                exit;
    
            case 'admin_register':
                require PGLD_PATH . 'templates/register.php';
                exit;
    
            case 'admin_logout':
                require PGLD_PATH . 'templates/logout.php';
                exit;
    
            case 'admin_dashboard':
                if (!is_user_logged_in()) {
                    wp_safe_redirect(home_url('/admin/login/?cb=' . time()));
                    exit;
                }
                if (!$this->can_edit()) {
                    wp_safe_redirect(home_url('/admin/login/?denied=1&cb=' . time()));
                    exit;
                }
                require PGLD_PATH . 'templates/dashboard.php';
                exit;
    
            case 'leader_dashboard':
                if (!is_user_logged_in()) {
                    wp_safe_redirect(home_url('/admin/login/?cb=' . time()));
                    exit;
                }
                // If you WANT grade roles to view leader area, use can_view_leader()
                // If you want ONLY admins/adminleaders, keep can_edit()
                if (method_exists($this, 'can_view_leader')) {
                    if (!$this->can_view_leader()) {
                        wp_safe_redirect(home_url('/admin/login/?denied=1&cb=' . time()));
                        exit;
                    }
                } else {
                    if (!$this->can_edit()) {
                        wp_safe_redirect(home_url('/admin/login/?denied=1&cb=' . time()));
                        exit;
                    }
                }
                require PGLD_PATH . 'templates/dashboard.php';
                exit;
        }
    }
    
    private function send_no_cache() {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
    }

    public function can_view_leader() {
        if (!is_user_logged_in()) return false;
    
        // Any role with this cap can view the leader portal
        if (current_user_can('pgld_leader_view')) return true;
    
        // Fallback checks (just in case)
        $u = wp_get_current_user();
        $roles = (array) $u->roles;
        return in_array('administrator', $roles, true) || in_array('adminleader', $roles, true);
    }
    
private function resources_get_store() {
    $items = get_option('pursue_resources', []);
    if (!is_array($items)) $items = [];
    return $items;
}

private function resources_set_store($items) {
    if (!is_array($items)) $items = [];
    update_option('pursue_resources', array_values($items));
}

private function resources_find_index(&$items, $id) {
    foreach ($items as $i => $it) {
        if (($it['id'] ?? '') === $id) return $i;
    }
    return -1;
}

public function resources_list($request) {
    $items = $this->resources_get_store();

    // categories derived from items
    $cats = [];
    foreach ($items as $it) {
        $c = (string)($it['category'] ?? '');
        if ($c !== '') $cats[$c] = true;
    }
    $categories = array_values(array_keys($cats));
    sort($categories);

    $favorites = [];
    if (is_user_logged_in()) {
        $favorites = get_user_meta(get_current_user_id(), 'pursue_resources_favorites', true);
        if (!is_array($favorites)) $favorites = [];
    }

    return rest_ensure_response([
        'items' => array_values($items),
        'categories' => $categories,
        'favorites' => array_values($favorites),
        'canManage' => (bool) $this->can_edit(),
    ]);
}

public function resources_create($request) {
    $body = $request->get_json_params();
    if (!is_array($body)) $body = [];

    $title = sanitize_text_field($body['title'] ?? '');
    $type = sanitize_key($body['type'] ?? '');
    $category = sanitize_text_field($body['category'] ?? '');
    $url = isset($body['url']) ? esc_url_raw($body['url']) : null;

    if ($title === '' || $category === '') {
        return new WP_REST_Response(['message' => 'Missing title or category'], 400);
    }
    if (!in_array($type, ['file', 'link', 'video'], true)) {
        return new WP_REST_Response(['message' => 'Invalid type'], 400);
    }

    $item = [
        'id' => wp_generate_uuid4(),
        'title' => $title,
        'type' => $type,
        'category' => $category,
        'createdAt' => current_time('mysql'),
        'updatedAt' => current_time('mysql'),
    ];

    if ($url) $item['url'] = $url;

    if (isset($body['mediaId'])) $item['mediaId'] = absint($body['mediaId']);
    if (isset($body['filename'])) $item['filename'] = sanitize_text_field($body['filename']);
    if (isset($body['mime'])) $item['mime'] = sanitize_text_field($body['mime']);

    $items = $this->resources_get_store();
    $items[] = $item;
    $this->resources_set_store($items);

    return new WP_REST_Response($item, 201);
}

public function resources_update($request) {
    $id = sanitize_text_field($request['id'] ?? '');
    $patch = $request->get_json_params();
    if (!is_array($patch)) $patch = [];

    $items = $this->resources_get_store();
    $idx = $this->resources_find_index($items, $id);
    if ($idx < 0) {
        return new WP_REST_Response(['message' => 'Not found'], 404);
    }

    $item = $items[$idx];

    if (array_key_exists('title', $patch)) $item['title'] = sanitize_text_field($patch['title']);
    if (array_key_exists('category', $patch)) $item['category'] = sanitize_text_field($patch['category']);

    if (array_key_exists('type', $patch)) {
        $t = sanitize_key($patch['type']);
        if (!in_array($t, ['file', 'link', 'video'], true)) {
            return new WP_REST_Response(['message' => 'Invalid type'], 400);
        }
        $item['type'] = $t;
    }

    if (array_key_exists('url', $patch)) {
        $u = $patch['url'];
        $item['url'] = $u ? esc_url_raw($u) : null;
        if ($item['url'] === null) unset($item['url']);
    }

    if (array_key_exists('mediaId', $patch)) {
        $item['mediaId'] = absint($patch['mediaId']);
        if (!$item['mediaId']) unset($item['mediaId']);
    }

    if (array_key_exists('filename', $patch)) {
        $item['filename'] = sanitize_text_field($patch['filename']);
        if ($item['filename'] === '') unset($item['filename']);
    }

    if (array_key_exists('mime', $patch)) {
        $item['mime'] = sanitize_text_field($patch['mime']);
        if ($item['mime'] === '') unset($item['mime']);
    }

    $item['updatedAt'] = current_time('mysql');

    $items[$idx] = $item;
    $this->resources_set_store($items);

    return rest_ensure_response($item);
}

public function resources_delete($request) {
    $id = sanitize_text_field($request['id'] ?? '');

    $items = $this->resources_get_store();
    $idx = $this->resources_find_index($items, $id);
    if ($idx < 0) {
        return new WP_REST_Response(['message' => 'Not found'], 404);
    }

    array_splice($items, $idx, 1);
    $this->resources_set_store($items);

    // also remove from all favorites (cheap approach: just current user)
    if (is_user_logged_in()) {
        $uid = get_current_user_id();
        $favorites = get_user_meta($uid, 'pursue_resources_favorites', true);
        if (!is_array($favorites)) $favorites = [];
        $favorites = array_values(array_filter($favorites, fn($x) => $x !== $id));
        update_user_meta($uid, 'pursue_resources_favorites', $favorites);
    }

    return new WP_REST_Response(null, 204);
}

public function resources_bulk_delete($request) {
    $body = $request->get_json_params();
    if (!is_array($body)) $body = [];
    $ids = $body['ids'] ?? [];
    if (!is_array($ids)) $ids = [];

    $ids = array_values(array_filter(array_map('sanitize_text_field', $ids)));

    $items = $this->resources_get_store();
    $kept = [];
    $deleted = [];

    foreach ($items as $it) {
        $rid = (string)($it['id'] ?? '');
        if ($rid !== '' && in_array($rid, $ids, true)) {
            $deleted[] = $rid;
        } else {
            $kept[] = $it;
        }
    }

    $this->resources_set_store($kept);

    if (is_user_logged_in()) {
        $uid = get_current_user_id();
        $favorites = get_user_meta($uid, 'pursue_resources_favorites', true);
        if (!is_array($favorites)) $favorites = [];
        $favorites = array_values(array_filter($favorites, fn($x) => !in_array($x, $deleted, true)));
        update_user_meta($uid, 'pursue_resources_favorites', $favorites);
    }

    return rest_ensure_response([
        'ok' => true,
        'deleted' => $deleted,
    ]);
}

public function resources_toggle_favorite($request) {
    if (!is_user_logged_in()) {
        return new WP_REST_Response(['message' => 'Unauthorized'], 401);
    }

    $id = sanitize_text_field($request['id'] ?? '');
    $uid = get_current_user_id();

    $favorites = get_user_meta($uid, 'pursue_resources_favorites', true);
    if (!is_array($favorites)) $favorites = [];

    $favorited = false;
    if (in_array($id, $favorites, true)) {
        $favorites = array_values(array_filter($favorites, fn($x) => $x !== $id));
        $favorited = false;
    } else {
        $favorites[] = $id;
        $favorites = array_values(array_unique($favorites));
        $favorited = true;
    }

    update_user_meta($uid, 'pursue_resources_favorites', $favorites);

    return rest_ensure_response([
        'id' => $id,
        'favorited' => $favorited,
        'favorites' => $favorites,
    ]);
}


    public function access_action() {
        if (!is_user_logged_in() || !current_user_can('manage_options')) {
            wp_die('You must be an administrator to perform this action.');
        }
        $uid = isset($_GET['uid']) ? absint($_GET['uid']) : 0;
        $token = sanitize_text_field($_GET['token'] ?? '');
        $action = sanitize_key($_GET['action'] ?? '');
        if (!$uid || !$token) wp_die('Invalid request.');

        $saved = get_user_meta($uid, 'tracker_approve_token', true);
        if (!$saved || !hash_equals($saved, $token)) wp_die('Invalid/expired approval token.');

        if ($action === 'approve') {
            delete_user_meta($uid, 'tracker_pending');
            $u = new WP_User($uid);
            $u->add_cap('pgld_adminleader');
            $u->set_role('adminleader');
        } elseif ($action === 'deny') {
            update_user_meta($uid, 'tracker_pending', 1);
            update_user_meta($uid, 'tracker_denied', 1);
        }

        delete_user_meta($uid, 'tracker_approve_token');
        wp_safe_redirect(home_url('/admin/dashboard?cb=' . time()));
        exit;
    }
}

add_filter('query_vars', function($vars) {
    $vars[] = 'pgld_route';
    return $vars;
});

add_action('init', function() {
    register_post_type('pursue_event', [
        'label' => 'Pursue Events',
        'public' => false,
        'show_ui' => true,
        'supports' => ['title', 'editor', 'thumbnail'],
    ]);
});
