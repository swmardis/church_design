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
        $roles = ['administrator', 'adminleader'];
        foreach ($roles as $role_name) {
            $role = get_role($role_name);
            if ($role) {
                $role->add_cap('pgld_adminleader');
            }
        }
    }

    private function seed_defaults() {
        if (!get_option('pursue_content_home')) {
            update_option('pursue_content_home', [
                ['id'=>1,'pageSlug'=>'home','sectionKey'=>'hero','content'=>['title'=>'Welcome to Our Church','subtitle'=>'A place to call home','primaryButtonText'=>'Join Us','primaryButtonUrl'=>'/next-steps','secondaryButtonText'=>'Watch Online','secondaryButtonUrl'=>'/events','backgroundImage'=>'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80']],
                ['id'=>2,'pageSlug'=>'home','sectionKey'=>'schedule','content'=>['title'=>'Weekly Schedule','description'=>'Join us every Sunday at 9:00 AM and 11:00 AM.','times'=>[['label'=>'Classic Service','time'=>'9:00 AM'],['label'=>'Modern Service','time'=>'11:00 AM']]]],
            ]);
        }

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
        add_rewrite_rule('^admin/login/?$', 'index.php?pgld_route=admin_login', 'top');
        add_rewrite_rule('^admin/register/?$', 'index.php?pgld_route=admin_register', 'top');
        add_rewrite_rule('^admin/logout/?$', 'index.php?pgld_route=admin_logout', 'top');
        add_rewrite_rule('^admin/dashboard/?$', 'index.php?pgld_route=admin_dashboard', 'top');
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

        register_rest_route('pursue/v1', '/auth/user', [
            'methods' => 'GET', 'callback' => [$this, 'auth_user'], 'permission_callback' => '__return_true',
        ]);
        register_rest_route('pursue/v1', '/logout', [
            'methods' => 'GET', 'callback' => [$this, 'logout_api'], 'permission_callback' => '__return_true',
        ]);
    }

    public function can_edit() { return current_user_can('pgld_adminleader'); }

    public function content_get_page($req) {
        $page = sanitize_key($req['page']);
        return rest_ensure_response(get_option('pursue_content_' . $page, []));
    }

    public function content_update_section($req) {
        $page = sanitize_key($req['page']);
        $key = sanitize_key($req['sectionKey']);
        $body = $req->get_json_params();
        $list = get_option('pursue_content_' . $page, []);
        $found = false;
        foreach ($list as &$item) {
            if (($item['sectionKey'] ?? '') === $key) {
                $item['content'] = $body['content'];
                $item['updatedAt'] = current_time('mysql');
                $found = true;
            }
        }
        if (!$found) {
            $list[] = ['id' => count($list)+1, 'pageSlug'=>$page, 'sectionKey'=>$key, 'content'=>$body['content'], 'updatedAt'=>current_time('mysql')];
        }
        update_option('pursue_content_' . $page, $list);
        return rest_ensure_response(end($list));
    }

    public function events_list() { return rest_ensure_response(get_posts(['post_type'=>'pursue_event','posts_per_page'=>-1,'orderby'=>'date','order'=>'ASC'])); }
    public function events_create($req) {
        $d = $req->get_json_params();
        $id = wp_insert_post(['post_type'=>'pursue_event','post_status'=>'publish','post_title'=>sanitize_text_field($d['title'] ?? 'Event'),'post_content'=>sanitize_textarea_field($d['description'] ?? '')]);
        foreach (['date','time','location','imageUrl','tags','isPlanningCenter','pcoId'] as $k) update_post_meta($id,$k,$d[$k] ?? '');
        return rest_ensure_response($this->event_shape($id));
    }
    public function events_update($req) { $id=(int)$req['id']; $d=$req->get_json_params(); if(isset($d['title'])) wp_update_post(['ID'=>$id,'post_title'=>sanitize_text_field($d['title'])]); if(isset($d['description'])) wp_update_post(['ID'=>$id,'post_content'=>sanitize_textarea_field($d['description'])]); foreach($d as $k=>$v){ if(in_array($k,['date','time','location','imageUrl','tags','isPlanningCenter','pcoId'],true)) update_post_meta($id,$k,$v);} return rest_ensure_response($this->event_shape($id)); }
    public function events_delete($req) { wp_delete_post((int)$req['id'], true); return new WP_REST_Response(null,204); }
    private function event_shape($id){ return ['id'=>$id,'title'=>get_the_title($id),'description'=>get_post_field('post_content',$id),'date'=>get_post_meta($id,'date',true),'time'=>get_post_meta($id,'time',true),'location'=>get_post_meta($id,'location',true),'imageUrl'=>get_post_meta($id,'imageUrl',true),'tags'=>get_post_meta($id,'tags',true) ?: [],'isPlanningCenter'=>(bool)get_post_meta($id,'isPlanningCenter',true),'pcoId'=>get_post_meta($id,'pcoId',true),'createdAt'=>get_post_field('post_date',$id)]; }

    public function media_list(){ $items=[]; foreach(get_posts(['post_type'=>'attachment','posts_per_page'=>-1]) as $a){ $items[]=['id'=>$a->ID,'url'=>wp_get_attachment_url($a->ID),'filename'=>basename(get_attached_file($a->ID)),'mimeType'=>get_post_mime_type($a->ID),'uploadedAt'=>$a->post_date]; } return rest_ensure_response($items); }
    public function media_upload($req){ if(empty($_FILES['file'])) return new WP_Error('no_file','No file uploaded',['status'=>400]); require_once ABSPATH . 'wp-admin/includes/file.php'; require_once ABSPATH . 'wp-admin/includes/media.php'; require_once ABSPATH . 'wp-admin/includes/image.php'; $id=media_handle_upload('file',0); if(is_wp_error($id)) return $id; return rest_ensure_response(['id'=>$id,'url'=>wp_get_attachment_url($id),'filename'=>basename(get_attached_file($id)),'mimeType'=>get_post_mime_type($id),'uploadedAt'=>get_post_field('post_date',$id)]); }
    public function media_delete($req){ wp_delete_attachment((int)$req['id'],true); return new WP_REST_Response(null,204); }

    public function settings_get(){ return rest_ensure_response(get_option('pursue_settings',[])); }
    public function settings_update($req){ $d=$req->get_json_params(); update_option('pursue_settings',$d); return rest_ensure_response($d); }

    public function shortcuts_list(){ return rest_ensure_response(get_option('pursue_shortcuts',[])); }
    public function shortcuts_add($req){ $d=$req->get_json_params(); $list=get_option('pursue_shortcuts',[]); $d['id']=count($list)+1; $list[]=$d; update_option('pursue_shortcuts',$list); return rest_ensure_response($d); }
    public function shortcuts_delete($req){ $id=(int)$req['id']; $list=array_values(array_filter(get_option('pursue_shortcuts',[]),fn($x)=>(int)$x['id']!==$id)); update_option('pursue_shortcuts',$list); return new WP_REST_Response(null,204); }

    public function auth_user(){
        if (!is_user_logged_in()) {
            return new WP_REST_Response(['message'=>'Unauthorized'], 401);
        }
        $u = wp_get_current_user();
        $role = get_user_meta($u->ID, 'tracker_pending', true) ? 'pending' : (current_user_can('pgld_adminleader') ? 'admin_leader' : 'denied');
        return ['id'=>(string)$u->ID,'email'=>$u->user_email,'firstName'=>$u->first_name,'lastName'=>$u->last_name,'profileImageUrl'=>'','role'=>$role,'createdAt'=>$u->user_registered,'updatedAt'=>$u->user_registered];
    }

    public function logout_api(){ wp_safe_redirect(home_url('/admin/logout')); exit; }



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
            case 'admin_login': require PGLD_PATH . 'templates/login.php'; exit;
            case 'admin_register': require PGLD_PATH . 'templates/register.php'; exit;
            case 'admin_logout': require PGLD_PATH . 'templates/logout.php'; exit;
            case 'admin_dashboard': require PGLD_PATH . 'templates/dashboard.php'; exit;
        }
    }

    private function send_no_cache() {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
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
