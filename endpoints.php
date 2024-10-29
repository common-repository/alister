<?php

namespace AlisterElephantFishing;

require_once(__DIR__ . '/aliexpress.php');
require_once(__DIR__ . '/wc.php');


function alister_add_product() {
    header("Content-Type: application/json");
    try {
        $result = AlisterWooCommerce::create_product($_POST);
        echo json_encode($result);
    } catch (\Exception $e) {
        # if no status code set, return 500
        if (http_response_code() == 200) {
            http_response_code(500);
        }
        echo json_encode(array("message" => $e->getMessage(), "statusCode" => 500)); // Unable to return 500
    }
    wp_die();
}

function alister_get_product_data() {
    header("Content-Type: application/json");
    $id = sanitize_text_field($_GET['id']);
    echo json_encode(Alister_Ali_Client::get_data($id, false, $_GET), true);
    die();
}

function alister_get_existing_product()
{
    header("Content-Type: application/json");

    $id = $_GET['id'];
    $product = wc_get_product($id);
    $result = $product -> get_data();

    $attachment_ids = $product->get_gallery_image_ids();
    $variation_ids = $product->get_children();

    $image_urls = [];
    $variations = [];
    foreach( $attachment_ids as $attachment_id ) {
        $image_urls[] = wp_get_attachment_url( $attachment_id );
    }
    foreach( $variation_ids as $variation_id ) {
        $wc_variation = wc_get_product($variation_id);
        $wc_variation_data = $wc_variation -> get_data();
        $wc_variation_image_url = wp_get_attachment_url( $wc_variation_data["image_id"] );
        $variations[] = array("attributes" => $wc_variation_data["attributes"], "price" => $wc_variation_data["price"], "sku" => $wc_variation_data["sku"], "image_url" => $wc_variation_image_url, "id" => $variation_id);
    }

    $categories = [];
    $category_ids = $result['category_ids'];

    if (count($category_ids)) {
        $cat_args = array(
            "hide_empty" => 0,
            "taxonomy" => "product_cat",
            "include" => implode(',', $category_ids)
        );
        $categories = get_categories($cat_args);
    }

    $result['image_urls'] = $image_urls;
    $result['variations'] = $variations;
    $result['categories'] = $categories;

    echo json_encode($result, true);
    die();
}

function alister_get_description() {
    header("Content-Type: application/json");
    echo json_encode(Alister_Ali_Client::description($_POST), true);
    die();
}

function alister_get_product_categories()
{
    header("Content-Type: application/json");
    $search_query = sanitize_text_field($_GET['input']);
    $args = array(
        "hide_empty" => 0,
        "taxonomy" => "product_cat",
        "search" => $search_query,
        "number" => 100
    );
    $categories = get_categories($args);
    foreach(  $categories as $category ) {
        $category_tree = alister_get_parent_category_tree($category);
        $category-> tree = $category_tree;
    }
    echo json_encode($categories, true);
    die();
}

function alister_get_product_tags()
{
    header("Content-Type: application/json");
    $search_query = sanitize_text_field($_GET['input']);
    $args = array(
        "hide_empty" => 0,
        "taxonomy" => "product_tag",
        "search" => $search_query,
        "number" => 100
    );
    $tags = get_terms($args);
    echo json_encode($tags, true);
    die();
}

function alister_get_parent_category_tree($category) {
    $result = $category->cat_name;
    while ($category->parent != 0) {
        $category = get_term($category->parent, "product_cat");
        $result = $category->name.">>".$result;
    }
    return $result;
}

function alister_get_orders_ids_by_product_id( $product_id, $count_only=false ) {
    global $wpdb;
    
    // Define HERE the orders status to include in  <==  <==  <==  <==  <==  <==  <==
    $orders_statuses = "'wc-completed', 'wc-processing', 'wc-on-hold'";

    # Get All defined statuses Orders IDs for a defined product ID (or variation ID)
    $result = $wpdb->get_col( "
        SELECT DISTINCT " . ($count_only ? "COUNT(woi.order_id)" : "woi.order_id") ."
        FROM {$wpdb->prefix}woocommerce_order_itemmeta as woim, 
             {$wpdb->prefix}woocommerce_order_items as woi, 
             {$wpdb->prefix}posts as p
        WHERE  woi.order_item_id = woim.order_item_id
        AND woi.order_id = p.ID
        AND p.post_status IN ( $orders_statuses )
        AND woim.meta_key IN ( '_product_id', '_variation_id' )
        AND woim.meta_value LIKE '$product_id'
        ORDER BY woi.order_item_id DESC"
    );

	return $count_only ? $result[0] : $result;
}

function alister_update_product_price() {
    header("Content-Type: application/json");
    if (class_exists("Aliexpress_Client")) {
        $product_id = sanitize_text_field($_POST['product_id']); 
        $parent_id = sanitize_text_field($_POST['parent_id']);
        $client = new Aliexpress_Client($product_id, $parent_id);
        $result = $client->sync_product();
    	echo json_encode(["result" => json_encode($result), "message" => "Prices updated", "product_id" => $product_id]);
    } else {
    	echo json_encode(["message" => "Price update failed. No Aliexpress_Client class found"]);
    }
    die();
}

function alister_get_remaining_requests() {
    header("Content-Type: application/json");
    echo json_encode(Alister_Ali_Client::get_remaining_requests());
    die();
}

function schedule_import_rule($id) {
	$_map = [
		"daily" => 24 * 1 * 3600,
		"weekly" => 24 * 7 * 3600,
		"monthly" => 24 * 28 * 3600
	];

	$post = get_post($id);

	if ($post) {
		$rule = json_decode($post->post_content, true);
		$period = $_map[$rule["polling_option"]];
		if ($period && function_exists("as_schedule_recurring_action") && did_action("init")) {
			if(!as_next_scheduled_action('alister_import_rule', [$id], 'alister')) {
				as_schedule_recurring_action(time() + $period, $period, 'alister_import_rule', [$id], 'alister');
			}
		}
	}
}

function add_import_rule($data) {
	$data = stripslashes_deep($data);
	$update = false;
	$result = get_posts([
		"post_type" => "alister_import_rule",
		"post_status" => "any",
		"post_name__in" => [urlencode($data['name'])]
	]);

	if (!empty($result)) {
		$rule = $result[0];
		$rule->post_content = json_encode($data, JSON_PRETTY_PRINT);
		wp_update_post($rule);
		$update = true;
	} else {
		$id = wp_insert_post(array(
			"post_title" => $data['name'],
			"post_name" => urlencode($data['name']),
			"post_content" => json_encode($data, JSON_PRETTY_PRINT),
			"post_type" => "alister_import_rule",
		), true);

		if ($id) {
			schedule_import_rule($id);
		}
	}
	return $update;
}

function get_import_rules() {
	$result = [];
	$perPage = intval($_GET["per_page"] ?? 1000);
	$page = intval($_GET["page"] ?? 1);
	$rules = get_posts([
		"post_type" => "alister_import_rule",
		"post_status" => "any",
		'posts_per_page'  => $perPage,
		'offset'          => $perPage * ($page - 1),
	]);
	foreach ($rules as $rule) {
		$result []= [
			"id" => $rule->ID,
			"delete_nonce" => wp_create_nonce("delete-post_" . $rule->ID),
			"updatedAt" => $rule->post_modified] + json_decode($rule->post_content, true);
	}

	return $result;
}

function get_queue_products() {
	global $wpdb;

	// search
	$search_statement = "";
	$search = $_GET["search"] ?? null;
	if ($search) {
		$search_statement = $wpdb->prepare("WHERE post.post_name LIKE %%s% OR post.post_title LIKE %%s%", $search, $search);
	}

	// filters
	$filters = [];
	$exists = $_GET["exists"] ?? null;
	if ($exists == "0") {
		$filters []= "WHERE product.post_id is NULL";
	} else if ($exists == "1") {
		$filters []= "WHERE product.post_id is NOT NULL";
	}
	// extend filters here
	$filters = implode("\n", $filters);

	// source, status, date_updated
	$order_direction = ($_GET['order'] ?? "desc") == "desc" ? "DESC" : "ASC";
	$order_map = [
		"source" => "source.meta_value",
		"status" => "product.post_id",
		"date_updated" => "post.post_modified"
	];
	$order_field = $order_map[$_GET["order_by"]] ?? "post.ID";
	$order_by = "ORDER BY {$order_field} {$order_direction}";

	$per_page = intval($_GET["per_page"]) ?? 10;
	$offset = $per_page * intval($_GET["page"] ?? 0);

	$result = $wpdb->get_results("
	SELECT
		post.ID as id,
		post.post_name as ali_id,
		post.post_title as name,
		post.post_content as category,
		post.post_modified as update_at,
		image.meta_value as image,
		source.meta_value as source,
		args.meta_value as args,
		product.post_id as product,
		NULL as product_delete_nonce,
		NULL as product_status,
		NULL as product_details
	FROM {$wpdb->posts} post
	LEFT JOIN {$wpdb->postmeta} as image ON image.post_id = post.ID AND image.meta_key = 'ali_image'
	LEFT JOIN {$wpdb->postmeta} as args ON args.post_id = post.ID AND args.meta_key = 'endpoint_args'
	LEFT JOIN {$wpdb->postmeta} as source ON source.post_id = post.ID AND source.meta_key = 'source'
	LEFT JOIN {$wpdb->postmeta} as product ON product.meta_value = post.post_name AND product.meta_key= 'alister_ali_id'
	WHERE post.post_type = 'alister_queue_prod'
	{$search_statement}
	{$filters}
	{$order_by}
	LIMIT {$per_page}
	OFFSET {$offset}");
	foreach($result as $p) {
		$p->delete_nonce = wp_create_nonce('delete-post_' . $p->id);
		$p->edit_link = get_edit_post_link($p->product, "link");
		if ($p->args) {

			$p->args = unserialize($p->args);
		}
		if ($p->product) {
			$p->product_delete_nonce = wp_create_nonce("delete-post_" . $p->product);
			$wc_product = wc_get_product($p->product);
			if ($wc_product) {
				$p->product_status = $wc_product->get_status();
				$p->product_details = [
					"multiplier" => $wc_product->get_meta('alister_price_multiplier'),
					"shipping_cost" => $wc_product->get_meta('alister_shipping_cost'),
					"sync" => $wc_product->get_meta('alister_sync_price')
				];
			}
		}
	}

	$count = $wpdb->get_var( "SELECT COUNT(*) FROM $wpdb->posts WHERE post_type = 'alister_queue_prod'" );

	return ["data" => $result, "count" => $count];
}

function insert_product_in_queue($ali_id, $name, $image, $ali_category="", $source="manual", $upsert=false, $endpoint_args=[]) {
	global $wpdb;
	$result = get_posts(["post_type" => "alister_queue_prod", "post_status" => "any", "post_name__in" => [$ali_id]]);

	if (!empty($result)) {
		if (!$upsert) {
			http_response_code(409);
			die();
		} else {
			$product = $result[0];
			$product->post_title = $name;
			if ($ali_category) $product->post_content = $ali_category;
			if ($source) update_post_meta($product->ID, 'source', $source);
			if ($image) update_post_meta($product->ID, 'ali_image', $image);
			update_post_meta($product->ID, 'endpoint_args', $image);
			wp_update_post($product);
		}

	} else {

		wp_insert_post(array(
			"post_title" => $name,
			"post_name" => $ali_id,
			"post_content" => $ali_category,
			"post_type" => "alister_queue_prod",
			"meta_input" => ["ali_image" => $image, "source" => $source, "endpoint_args" => $endpoint_args]
		), true);
	}

}

function add_description_template($name, $template) {
	return wp_insert_post(array(
		"post_title" => $name,
		"post_content" => $template,
		"post_type" => "alister_desc_temp",
	), true);
}

function ignore_product($post_id) {
	global $wpdb;
	$product = get_post($post_id);
	$import_rule_name = get_post_meta($post_id, "source", true);
	$rules = get_posts(["post_type" => "alister_import_rule", "post_status" => "any", "title" => $import_rule_name]);

	if (!empty($rules)) {
		$import_rule = $rules[0];
		add_post_meta($import_rule->ID, "ignore_product", $product->post_name);
	}
}

function add_ai_description_template($name, $template) {
	return wp_insert_post(array(
		"post_title" => $name,
		"post_content" => $template,
		"post_type" => "alister_ai_desc_temp",
	), true);
}

function add_ai_title_template($name, $template) {
	return wp_insert_post(array(
		"post_title" => $name,
		"post_content" => $template,
		"post_type" => "alister_ai_ttl_temp",
	), true);
}

function get_description_title_templates() {
	$data = get_posts([
		"post_type" => array("alister_ai_desc_temp", "alister_desc_temp", "alister_ai_ttl_temp"),
		"post_status" => "any",
	]);
	$result = [];
	foreach($data as $template) {
		$result []= [
			"id" => $template->ID,
			"name" => $template->post_title,
			"type" => $template->post_type,
			"template" => $template->post_content,
			"delete_nonce" => wp_create_nonce("delete-post_" . $template->ID)
		];
	}
	return $result;
}

function poll_product_queue($id, $insert_in_queue = "yes", $args = null)
{
	$HOST = "https://my.donkeybooks.com/alister";
	$ignore_products = [];

	if (!$args) {
		$post = get_post($id);
		if (!$post) {
			http_response_code(404);
			die();
		}
		$args = json_decode($post->post_content, true);
		$ignore_products = get_post_meta($post->ID, 'ignore_product');
	}

	$query = array_filter($args, function ($a) {
		return $a != "action" && $a != "polling_option";
	}, ARRAY_FILTER_USE_KEY);

	$query["ignore_products"] = implode(",", $ignore_products);

	$lang = explode("_", $args["locale"])[0];
	$product_args = ["lang" => $lang, "country" => $args["region"]];

	$response = wp_remote_get($HOST . "/v1/products?" . http_build_query($query), ['body' => $body, 'timeout' => 180]);
	$http_code = wp_remote_retrieve_response_code($response);
	error_log($http_code);
	if (intval($http_code) == 200) {
		$body = wp_remote_retrieve_body($response );
		$products = json_decode($body, true);
		if ($insert_in_queue == "yes") {
			foreach($products as $p) {
				insert_product_in_queue($p["id"], $p["name"], $p["image"], "", $args["name"], true, $product_args);
			}
		}
		return $products;
	} else {
		http_response_code(intval($http_code));
		return new \WP_Error('alister_poll_error', "Could not poll for products");
	}
}

function update_ali_prices() {
	$query = get_posts(["meta_key" => "alister_ali_id", "post_type" => "any", "fields" => "ids"]);

	foreach ($query as $id) {
		$product = wc_get_product($id);
		$ali_id = $product->get_meta('alister_ali_id');

		if($product->get_meta('alister_sync_price')) { continue;}

		$shipping_cost = $product->get_meta('alister_shipping_cost');
		$shipping_cost = $shipping_cost ? floatval($shipping_cost) : 0;

		$multiplier = $product->get_meta('alister_price_multiplier');
		$multiplier = $multiplier ? floatval($multiplier) : 1.2;

		// Request aliexpress data
		$resp = Alister_Ali_Client::get_data($ali_id);

		// If product was not found change status to draft
		if (intval($resp["statusCode"]) != 200) {
			// wp_update_post(array(
			// 	'ID'    =>  $id,
			// 	'post_status'   =>  'pending'
			// ));
			// error_log("Post was not found. Changing product to draft:" . print_r($resp, true));
			continue;
		}

		$data = $resp["data"];

		// Iterate over product "children". In case of a simple product children is an array
		// with a single element containing id of itself.
		$_children = $product->get_type() == "variable" ? $product->get_children() : [$product->get_id()];
		foreach($_children as $p) {
			$child = wc_get_product($p);
			$sku = $child->get_meta('foreign_sku');

			$i = array_search($sku, array_column($data["variations"], "sku"));
			if ($i !== false) {
				$variation = $data["variations"][$i];

				$price_web = $variation["price"]["web"]["originalPrice"]["value"];
				$price_app = $variation["price"]["app"]["originalPrice"]["value"];
				// Prioritize web price
				$price = $price_web ? $price_web : $price_app;

				//if ($multiplier && $price) {
				if ($multiplier && $price) {
					$old_price = $child->get_price();
					$new_price = $shipping_cost + ($multiplier * floatval($price));
					$child->set_price($new_price);
					$child->set_regular_price($new_price);
					$child->save();
					error_log($id . ", updated price from " . $old_price . " to " . $child->get_price());
				}  else {
					error_log("Found variation but no additional info: " . $id);
				}
					error_log("New price: " . $price . " < -- >" . $multiplier * floatval($price));
				// Variation was found
			} else {
				error_log("Nooo, nothing found :|");
			}
		}
	}
}


add_action('plugins_loaded', function () {
  if (!current_user_can( 'edit_posts' )) return;
  add_action('wp_ajax_get_product_data', __NAMESPACE__."\\alister_get_product_data");
  add_action('wp_ajax_alister_get_existing_product', __NAMESPACE__."\\alister_get_existing_product");
  add_action('wp_ajax_get_categories',  __NAMESPACE__."\\alister_get_product_categories");
  add_action('wp_ajax_get_tags',  __NAMESPACE__."\\alister_get_product_tags");
  add_action('wp_ajax_alister_add_product',  __NAMESPACE__."\\alister_add_product");
  add_action('wp_ajax_alister_ai_description',  __NAMESPACE__."\\alister_get_description");
  add_action('wp_ajax_alister_update_prices',  __NAMESPACE__."\\alister_update_product_price");
  add_action('wp_ajax_alister_get_remaining_requests',  __NAMESPACE__."\\alister_get_remaining_requests");

  add_action('wp_ajax_alister_get_options', function() { 
	global $wpdb;
	header("Content-Type: application/json");
	$result = [];
	$options = $wpdb->get_results("SELECT option_name
		FROM {$wpdb->options}
		WHERE option_name LIKE 'alister_%'");
	foreach($options as $option) {
		$key = $option->option_name;
		$result[substr($key, 8)] = get_option($key);
	}
	if (!isset($result['property_dictionary'])) {
		$result['property_dictionary'] = [];
	}
	echo json_encode($result);
	die();
  });

  add_action('wp_ajax_alister_delete_property_dict', function() { 
	global $wpdb;
	header("Content-Type: application/json");

	$dictionary = get_option('alister_property_dictionary', []);

	$key = $_POST['key'] ?? null;
	if ($key && isset($dictionary[$key])) {
		unset($dictionary[$key]);
		update_option('alister_property_dictionary', $dictionary);
	}
	die();
  });

  add_action('wp_ajax_alister_set_option', function() { 
	header("Content-Type: application/json");
	
	$name = 'alister_' . $_POST['name'];
	if ($name == 'alister_property_dictionary')  {
		$dict_option = get_option($name, []);
		$dict_option[$_POST['original']] = $_POST['translation'];
		update_option($name, $dict_option);
	} else {
		if (!get_option($name)) {
			add_option($name, $_POST['value']);
		} else {
			update_option($name, $_POST['value']);
		}
		echo json_encode(["value" => get_option($name)]);
	}
	die();
  });

  add_action('wp_ajax_alister_add_description_template', function() { 
	header("Content-Type: application/json");
	echo json_encode(["message"=> "success", "id" => add_description_template($_POST['name'], $_POST['template'])]); 
	die();
  });

  add_action('wp_ajax_alister_add_ai_description_template', function() { 
	header("Content-Type: application/json");
	echo json_encode(["message"=> "success", "id" => add_ai_description_template($_POST['name'], $_POST['template'])]); 
	die();
  });

  add_action('wp_ajax_alister_add_ai_title_template', function() { 
	header("Content-Type: application/json");
	echo json_encode(["message"=> "success", "id" => add_ai_title_template($_POST['name'], $_POST['template'])]); 
	die();
  });

  add_action('wp_ajax_alister_get_description_title_templates', function() { 
	header("Content-Type: application/json");
	echo json_encode(get_description_title_templates()); 
	die();
  });

  add_action('wp_ajax_alister_get_import_rules', function() { 
	header("Content-Type: application/json");
	echo json_encode(get_import_rules()); 
	die();
  });

  add_action('wp_ajax_alister_add_import_rule', function() {
	header("Content-Type: application/json");
	$update = add_import_rule($_POST);
	echo json_encode(["message" => "successfully " . ($update ? "updated" : "inserted") . " import rule"]);
	die();
  });

  add_action('wp_ajax_alister_remove_product', function() {
	header("Content-Type: application/json");

	$message = "successfully deleted";
	$id = intval($_POST["id"] ?? 0);
	$product_id = intval($_POST["product_id"]);
	if ($product_id)  {
		$product = wc_get_product(intval($product_id));
		if ($product) {
		    if ($product->is_type("variable")) {
			foreach ($product->get_children() as $var_id) {
			    $var = wc_get_product($var_id);
			    $var->delete(true);
			}
		    }
		    $product->delete(true);
		} else {
			$message = "Could not find corresponding product";
		}
	}

	wp_delete_post($id, true);
	echo json_encode(["message" => $message]);
	die();
  });

  add_action('wp_ajax_alister_get_product_queue', function() {
    header("Content-Type: application/json");
    echo json_encode(get_queue_products());
    die();
  });

  add_action('wp_ajax_alister_edit_product_meta', function() {
    header("Content-Type: application/json");
    $id = $_POST['id'];
    $key = $_POST['key'];
    $value = $_POST['value'];
    $product = wc_get_product(intval($id));
    if ($product) {
	    $product->update_meta_data($key, $value);
	    $product->save();
	    echo json_encode(["message" => "succeess"]);
    } else {
	    http_response_code(404);
	    echo json_encode(["message" => "product not found"]);
    }
    die();
  });

  add_action('wp_ajax_alister_add_product_to_queue', function () {
	  header("Content-Type: application/json");
	  $id = $_POST['ali_id'] ?? null;
	  $country = $_POST['destination'] ?? "ch";
	  $lang = $_POST['lang'] ?? "de";
	  $args = ["country" => $country, "lang" => $lang];
	  $data = Alister_Ali_Client::get_data($id, true, $args)["data"];
          insert_product_in_queue($id, $data["title"], $data["productImages"][0], "", "manual", false, $args);
	  echo json_encode(["message" => "success"]);
	  die();
  });

  add_action('wp_ajax_alister_poll_products_from_queue', function () {
	  header("Content-Type: application/json");
	  $import_data = null;
	  if ($_POST["name"] && $_POST["source"] && $_POST["locale"]) {
		$import_data = array(
			"name" => $_POST["name"],
			"source" => $_POST["source"],
			"currency" => $_POST["currency"],
			"locale" => $_POST["locale"],
			"region" => $_POST["region"],
			"max_products" => $_POST["max_products"],
			"min_num_of_reviews" => $_POST["min_num_of_reviews"],
			"min_review_score" => $_POST["min_review_score"],
			"min_seller_score" => $_POST["min_seller_score"],
			"min_orders" => $_POST["min_orders"],
			"shipping_methods" => $_POST["shipping_methods"],
			"polling_option" => $_POST["polling_option"]
		);
	  }
	  $data = poll_product_queue(intval($_POST["id"] ?? 0), $_POST["insert_in_queue"], $import_data);

	  if (!is_wp_error($data)) {
		  echo json_encode(["products" => $data, "message" => "success"]);
	  } else {
		  echo json_encode(["message" => $data->get_error_message()]);
	  }

	  die();
  });

  add_action('alister_import_rule', function($id) {
	if (function_exists("as_schedule_recurring_action") && did_action("init")) {
		if (get_post($id)) {
			poll_product_queue($id);
		}
	}
  });



  add_action('wp_ajax_alister_get_ai_product_title', function() {
	header("Content-Type: application/json");
	$data = array_filter($_GET, function ($a) {
		return $a != "action";
	}, ARRAY_FILTER_USE_KEY);
   	echo json_encode(Alister_Ali_Client::title($data));
	die();
  });

  add_action('wp_ajax_alister_get_open_ai_product_data', function() {
	header("Content-Type: application/json");
	$data = array_filter($_GET, function ($a) {
		return $a != "action";
	}, ARRAY_FILTER_USE_KEY);
   	echo json_encode(Alister_Ali_Client::get_open_ai_data($data));
	die();
  });

  add_action( 'before_delete_post', function ( $post_id ) {
	  error_log("before delete");
        if (get_post_type($post_id) == "alister_queue_prod") {
		error_log("yes it's a queue prod");
		ignore_product($post_id);
        }
  });

  add_action('wp_ajax_alister_get_ai_product_title', function() {
	header("Content-Type: application/json");
	$data = array_filter($_GET, function ($a) {
		return $a != "action";
	}, ARRAY_FILTER_USE_KEY);
   	echo json_encode(Alister_Ali_Client::title($data));
	die();
  });

  add_action('alister_update_price',  __NAMESPACE__."\\update_ali_prices");
  add_action('init', function() {

	// Schedule alister_update_price
	$period = 5 * 24 * 3600;
	if (function_exists("as_next_scheduled_action")) {
		if(!as_next_scheduled_action('alister_update_price', [], 'alister')) {
			as_schedule_recurring_action(time(), $period, 'alister_update_price', [], 'alister');
		}
	}

	// Cancel orphan actions
	// This is extremly inefficient, but could not find a better solution
  	$args = [
		"hook" => "alister_import_rule",
		"group" => "alister",
		"per_page" => 100,
		"status" => \ActionScheduler_Store::STATUS_PENDING
		
  	];
	foreach (as_get_scheduled_actions($args) as $action) {
		$_id = $action->get_args()[0];
		if (!get_post($_id)) {
			as_unschedule_action('alister_import_rule', [$_id], 'alister');
		}
	}
  });

});
