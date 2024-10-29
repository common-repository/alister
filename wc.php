<?php

namespace AlisterElephantFishing;

class AlisterWooCommerce
{

  public static function get_valid($data, $key, $allow_empty = false)
  {
    // handle logic, when property does not exist
    if (!isset($data[$key])) {
      if ($allow_empty) {
        return null;
      }

      throw new AlisterError("Invalid body. {$key} is missing", array("status" => 400));
    }

    $msg = "";
    $value = $data[$key];

    switch ($key) {
      case 'type':
        if (is_string($value) && in_array($value, array("simple", "variable", "variation")))
          return $value;
        $msg = "Invalid product type";
        break;
      case 'name':
      case 'foreign_sku':
      case 'supplier':
        if (is_string($value))
          return trim($value);
        $msg = "Invalid product " . $key;
        break;
      case 'description':
        if (is_string($value))
          return wp_kses($value, AlisterConfig::ALLOWED_HTML);
        $msg = "Invalid description";
        break;
      case 'image':
        return wp_http_validate_url($value);
      case 'url':
        if (wp_http_validate_url($value))
          return $value;
        $msg = "Invalid product " . $key;
        break;
      case 'images':
        if (is_array($value))
          return $value;
        $msg = "Invalid product images";
        break;
      case 'price':
        if (is_float(floatval($value)))
          return floatval($value);
        $msg = "Invalid product price";
        break;
      case 'postStatus':
        if (in_array($value, array("publish", "draft", "pending")))
          return $value;
        $msg = "Invalid product status";
        break;
      case 'categories':
      case 'tags':
      case 'attributes':
        if (is_array($value))
          return $value;
        $msg = "Invalid product " . $key;
        break;
      case 'parentId':
        if (is_int($value) || is_string($value))
          return $value;
        $msg = "Invalid parent Id";
        break;
      case 'id':
        if (is_int($value) || is_string($value))
          return $value;
        $msg = "Invalid product Id";
        break;
    }

    throw new AlisterError("Invalid body. {$msg}", array("status" => 400));
  }

  public static function create_product($props)
  {
    set_time_limit(60);
    if (!current_user_can('edit_posts')) {
      http_response_code(401);
      throw new \Exception("Insufficient permissions");
    }


    switch (self::get_valid($props, 'type')) {
      case 'simple':
        return AlisterWcServices::create_simple_product($props);
      case 'variable':
        return AlisterWcServices::create_variable_product($props);
      case 'variation':
        return AlisterWcServices::create_variation($props);
      default:
        http_response_code(400);
        throw new \Error("Invalid product type");
    }
  }
}

class AlisterWcServices
{
  public static function create_simple_product($data)
  {

    $product = new \WC_Product_Simple();

    $product->set_name(AlisterWooCommerce::get_valid($data, 'name'));
    $product->set_description(AlisterWooCommerce::get_valid($data, "description"));
    if (isset($data['image']) && $data['image']) {
	    $product->set_image_id(AlisterWcServices::get_image_id_from_url(AlisterWooCommerce::get_valid($data, 'image')));
    }
    if (isset($data['images']) && $data['images']) {
	    $product->set_gallery_image_ids(AlisterWcServices::get_gallery(AlisterWooCommerce::get_valid($data, 'images')));
    }
    $product->set_price(AlisterWooCommerce::get_valid($data, 'price'));
    $product->set_regular_price(AlisterWooCommerce::get_valid($data, 'price'));
    $product->set_status(AlisterWooCommerce::get_valid($data, 'postStatus'));
    $product->add_meta_data('alister_ali_id', $data['productId']);

    if ($data["categories"]) $product->set_category_ids(AlisterWooCommerce::get_valid($data, "categories", true));
    if ($data["tags"]) $product->set_tag_ids(AlisterWooCommerce::get_valid($data, "tags", true));
    AlisterWcServices::set_common_options($product, $data);
    $product->save();

    return array(
      "success" => true,
      "wc_product_id" => $product->get_id(),
      "permalink" => $product->get_permalink(),
      "title" => $product->get_name(),
      "edit_link" => admin_url("post.php?post=" . $product . "&action=edit"),
    );
  }

  public static function create_variable_product($data)
  {
    $product = new \WC_Product_Variable();

    $product->set_name(AlisterWooCommerce::get_valid($data, 'name'));
    $product->set_description(AlisterWooCommerce::get_valid($data, "description"));
    if (isset($data['image']) && $data['image']) {
	    $product->set_image_id(AlisterWcServices::get_image_id_from_url(AlisterWooCommerce::get_valid($data, 'image')));
    }
    if (isset($data['images']) && !empty($data['images'])) {
	    $product->set_gallery_image_ids(AlisterWcServices::get_gallery(AlisterWooCommerce::get_valid($data, 'images')));
    }
    $product->set_status(AlisterWooCommerce::get_valid($data, 'postStatus'));
    $product->add_meta_data('alister_ali_id', $data['productId']);
    if ($data["categories"]) $product->set_category_ids(AlisterWooCommerce::get_valid($data, "categories", true));
    AlisterWcServices::set_common_options($product, $data);

    if ($data['attributes']) {
      $product->set_attributes(AlisterWcServices::get_wc_attributes(AlisterWooCommerce::get_valid($data, 'attributes')));
    }
    $product->save();

    return array(
      "success" => true,
      "wc_product_id" => $product->get_id(),
      "permalink" => $product->get_permalink(),
      "title" => $product->get_name(),
      "edit_link" => admin_url("post.php?post=" . $product . "&action=edit"),
    );
  }

  public static function create_variation($data)
  {
    $parent = wc_get_product($data['parentId']);

    if (!$parent || $parent->get_type() != 'variable') {
      throw new AlisterError("Parent Product does not exists", array('status' => 404));
    }

    $product = new \WC_Product_Variation();
    $product->set_parent_id(AlisterWooCommerce::get_valid($data, 'parentId'));
    $product->set_price(AlisterWooCommerce::get_valid($data, 'price'));
    $product->set_regular_price(AlisterWooCommerce::get_valid($data, 'price'));
    if (isset($data['image']) && $data['image']) {
	    $product->set_image_id(AlisterWcServices::get_image_id_from_url(AlisterWooCommerce::get_valid($data, 'image')));
    }
    AlisterWcServices::set_common_options($product, $data);

    if ($data['attributes']) {
      $product->set_attributes(AlisterWcServices::get_wc_attributes(AlisterWooCommerce::get_valid($data, 'attributes'), false));
    }

    $product->save();

    AlisterWcServices::_log('info', "Created new variation. Parent Id: {$data['parentId']}. Variation Id: {$product->get_id()}");

    return array(
      "message" => "Successfully added variation. Id: " . $product->get_id(),
    );
  }

  private static function set_common_options($product, $data)
  {
    $product->set_sku($data['sku']);
    $product->set_catalog_visibility('visible');
    $product->set_stock_status('instock');
    $product->set_downloadable(false);
    $product->set_manage_stock(false);
    $product->set_purchase_note('');
    $product->set_featured(false);
    $product->set_backorders('no');
    $product->add_meta_data('supplier', 'Aliexpress');
    $product->add_meta_data('foreign_link', AlisterWooCommerce::get_valid($data, 'url'));
    $product->add_meta_data('foreign_sku', AlisterWooCommerce::get_valid($data, 'foreign_sku'));
    $product->add_meta_data('supplier_price', AlisterWooCommerce::get_valid($data, 'price'));
    $product->add_meta_data('supplier_shipping_cost', 0);
    $product->add_meta_data('alister_source_link', AlisterWooCommerce::get_valid($data, 'url'));
    if (isset($data['shipping_price'])) $product->add_meta_data('alister_shipping_cost', floatval($data['shipping_price']));
    if (isset($data['price_multiplier'])) $product->add_meta_data('alister_price_multiplier', floatval($data['price_multiplier']));
    if (isset($data['shipping_carrier'])) $product->add_meta_data('alister_carrier', $data['shipping_carrier']);

    $product->add_meta_data('_ultimus_product_external_id', 'Aliexpress_' . $data['productId']);
  }

  // NEW
  private static function get_gallery($images)
  {
    $result = [];
    foreach ($images as $image) {
      $result[] = AlisterWcServices::get_image_id_from_url($image["url"]);
    }
    return $result;
  }

  private static function get_image_id_from_url($url)
  {

    if (!$url)
      throw new AlisterError("Product image is empty");

    // Try to find image locally first
    $wp_image = get_posts(array(
      'numberposts' => 1,
      'fields' => 'ids',
      'post_type' => 'attachment',
      'post_status' => 'inherit',
      'meta_query' => array(
        array(
          'key' => '_original_src_url',
          'value' => $url,
        ),
      ),
    ));

    if (!empty($wp_image))
      return $wp_image[0];


    $img = AlisterWcServices::get_binary_image_from_url($url);
    $filename = str_ends_with($url, '.webp') ? basename($url) . '.png' : basename($url);
    $wp_img = wp_upload_bits($filename, null, $img);

    if ($wp_img['error'])
      throw new AlisterError("Could not create image");

    $filetype = wp_check_filetype($filename);

    $attachment = wp_insert_attachment(array(
      'post_mime_type' => $filetype['type'],
      'post_parent' => 0,
      'post_title' => preg_replace('/\.[^.]+$/', '', $filename),
      'post_content' => '',
      'post_status' => 'inherit',
      'meta_input' => array(
        '_original_src_url' => $url
      )
    ), $wp_img['file']);

    if (is_wp_error($attachment))
      throw new \Exception("Could not add attachment");

    // Generate smaller size images
    $metadata = wp_generate_attachment_metadata($attachment, $wp_img['file']);
    wp_update_attachment_metadata($attachment, $metadata);

    return $attachment;
  }

  private static function get_binary_image_from_url($url)
  {

    // Convert webp
    if (preg_match("/\.webp$/", strtolower($url))) {

      $stream = fopen('php://memory', 'r+');
      imagepng(imagecreatefromwebp($url), $stream); // write png to memory
      rewind($stream); // rewind stream
      return stream_get_contents($stream);
    }

    $response = wp_remote_get($url, ['timeout' => 30]);
    $http_code = wp_remote_retrieve_response_code($response);
    if ($http_code == 200) {
      AlisterWcServices::_log('info', gettype(wp_remote_retrieve_body($response)));
      return wp_remote_retrieve_body($response);
    }
    throw new AlisterError("Could not retrieve image data", array('status' => $http_code));
  }

  private static function get_wc_attributes($_attrs, $generate_wc_attrs = true)
  {
    // transform attributes
    $attributes = array();
    foreach ($_attrs as $_attr) {
      $values = $_attr["values"];
      $attr = array(
        "name" => sanitize_title($_attr["name"]),
        "slug" => wc_sanitize_taxonomy_name($_attr["name"]),
        "value" => $_attr["value"] ?? null,
        "values" => $_attr["values"] ?? array($_attr["value"]),
      );


      if ($name == 'color') {
        $attr["name"] = "Farbe";
        $attr["slug"] = "farbe";
      } else if ($name == 'size') {
        $attr["name"] = "Größe";
        $attr["slug"] = "groesse";
      }

      $attributes[] = $attr;
    }

    $result = array();

    // register attributes
    foreach ($attributes as $_data) {
      $name = $_data["name"];
      $slug = $_data["slug"];
      $values = $_data["values"];
      $attribute_id = wc_attribute_taxonomy_id_by_name($name);

      // if attribute taxonomy does not exist, create it
      if (!$attribute_id) {
        // create wc attribute
        $attribute_id = wc_create_attribute(array(
          'slug'    => $slug,
          'name'   => $name,
          'type'    => 'select',
          'orderby' => 'menu_order',
          'has_archives'  => false,
        ));
      }

      // Register taxonomy is not preserved in db, it should be called every time
      $taxonomy_name = wc_attribute_taxonomy_name($name);

      register_taxonomy(
        $taxonomy_name,
        apply_filters('woocommerce_taxonomy_objects_' . $taxonomy_name, array('product')),
        apply_filters(
          'woocommerce_taxonomy_args_' . $taxonomy_name,
          array(
            'label'        => $name,
            'hierarchical' => false,
            'show_ui'      => false,
            'query_var'    => true,
          )
        )
      );

      // Setup term ids
      $terms = array();
      foreach ($values as $value) {
        $term = term_exists($value, $taxonomy_name);

        if (!$term) {
          $term = wp_insert_term($value, $taxonomy_name, array('slug' => sanitize_title($value)));
        }

        // Without casting this value to `int` WC_Product->set_attributes()
        // sets these options as literal strings
        $terms[] = intval($term["term_id"]);
      }

      if ($generate_wc_attrs) {
        $attribute = new \WC_Product_Attribute();
        $attribute->set_id(intval($attribute_id));
        $attribute->set_name($taxonomy_name);
        $attribute->set_visible(true);
        $attribute->set_variation(true);
        $attribute->set_options($terms);
        $attribute->set_position(sizeof($result) + 1);
        $result[] = $attribute;
      } else {
        $result[$taxonomy_name] = get_term($terms[0])->slug;
      }
    }

    return $result;
  }

  public static function _log($lvl, $msg)
  {
    $logger = wc_get_logger();
    $logger->log($lvl, $msg, AlisterConfig::CONTEXT);
  }
}

class AlisterConfig
{
  // WC_Logger context
  const CONTEXT = array('source' => 'Alister');


  // Allowed html in product descriptions
  const ALLOWED_HTML = [
    'a' => [
      'href' => [],
      'title' => [],
    ],
    'br' => [],
    'em' => [],
    'ul' => [],
    'li' => [],
    'dl' => [],
    'dt' => [],
    'dd' => [],
    'div' => [],
    'strong' => [],
    'p' => [],
    'ol' => [],
    'table' => [
      'cellpadding' => [],
      'cellspacing' => [],
    ],
    'tbody' => [],
    'thead' => [],
    'tr' => [],
    'td' => [],
    'th' => [],
    'h1' => [],
    'h2' => [],
    'h3' => [],
    'h4' => [],
    'h5' => [],
    'h6' => [],
    'div' => [],
  ];
}

class AlisterError extends \Exception
{
  private $_data = '';

  public function __construct($message, $data = array())
  {
    $this->_data = $data;
    parent::__construct($message);
  }

  public function getData()
  {
    return $this->_data;
  }

  public function getStatus()
  {
    return isset($this->_data['status']) ? $this->_data['status'] : null;
  }
}
