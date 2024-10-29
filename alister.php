<?php

/**
 * @package alister
 * @version 0.9.2
 */
/*
Plugin Name: Alister
Description: A tool that helps woocommerce based stores import aliexpress products.
Author: Elephantfishing
Version: 0.9.2
*/

require(__DIR__ . '/endpoints.php');
require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

class Alister
{
	private $icon = 'dashicons-welcome-widgets-menus';


	public static function run()
	{
		$cls = get_called_class();
		$instance = new $cls();
		$instance->_run();
	}

	private function _run()
	{
		add_action('admin_menu', array($this, 'register_admin_menu'));
		add_action('woocommerce_product_options_general_product_data', array($this, 'add_custom_general_fields'));
		add_action('woocommerce_process_product_meta', array($this, 'add_custom_general_fields_save'));
	}

	function register_admin_menu()
	{
		add_menu_page('Alister', 'Alister', 'manage_options', 'alister', array($this, 'render_admin_page'), $this->icon);
	}

	function render_admin_page()
	{
		echo '<div id="alisterApp"></div>';
		wp_enqueue_style('alister-style', plugin_dir_url(__FILE__) . 'app/build/index.css');
		wp_enqueue_script('alister-script', plugin_dir_url(__FILE__) . 'app/build/index.js', array('wp-element', 'jquery'), '1.0.0', true);
		wp_localize_script(
			'alister-script',
			'alisterData',
			[
				'url' => admin_url('admin-ajax.php'),
				'nonce' => wp_create_nonce('wp_rest'),
			]
		);
	}

	function add_custom_general_fields()
	{
		global $woocommerce, $post;
		echo '<div class="options_group">';
		woocommerce_wp_text_input(
			array(
				'id'          => 'alister_source_link',
				'label'       => __('alister product link', 'woocommerce'),
				'value'       => get_post_meta(get_the_ID(), 'alister_source_link', true),
				'desc_tip'    => 'true',
				'description' => __('Modify the product link added by Alister', 'woocommerce')
			)
		);
		echo '</div>';
	}

	function add_custom_general_fields_save($post_id)
	{
		$woocommerce_text_field = sanitize_url($_POST['alister_source_link']);
		if (!empty($woocommerce_text_field)) {
			update_post_meta($post_id, 'alister_source_link', esc_attr($woocommerce_text_field));
		} else {
			delete_post_meta($post_id, 'alister_source_link');
		}
	}
}


Alister::run();
