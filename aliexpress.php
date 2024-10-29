<?php

namespace AlisterElephantFishing;

// set store token
$TOKEN_NAME = "alister_store_token";
if (!get_option($TOKEN_NAME)) {
	add_option($TOKEN_NAME, bin2hex(random_bytes(20)));
}
$STORE_TOKEN = get_option($TOKEN_NAME);


class Alister_Ali_Client
{
  private static $HOST = "https://my.donkeybooks.com/alister";

  private static function get_token() {
	  global $STORE_TOKEN;
	  return $STORE_TOKEN;
  }


  public static function get_remaining_requests()
  {
    $args = array(
      'headers' => array(
          'Authorization' => 'Bearer ' . self::get_token()
          )
      );
    $response = wp_remote_get( Alister_Ali_Client::$HOST . "/v1/ai/limit", $args);
    $http_code = wp_remote_retrieve_response_code( $response );

    if ($http_code == 200) {
      $body = wp_remote_retrieve_body($response );
      return json_decode($body, true);
    }

    return array(
      "data" => array(
        "statusId" => "5",
        "status" => "error",
      ),
      "statusCode" => "500"
    );
  }

  public static function get_open_ai_data($params)
  {
    $args = array(
      'body'        => json_encode($params),
      'timeout'     => '60',
      'redirection' => '5',
	    'httpversion' => '1.0',
	    'blocking'    => true,
      'headers'     => array('Accept' => 'application/json', 'Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . self::get_token()),
      'cookies'     => array(),
    );

    $response = wp_remote_post( Alister_Ali_Client::$HOST . "/v1/ai/completion", $args);
    $http_code = wp_remote_retrieve_response_code( $response );

    if ($http_code == 200) {
      $body = wp_remote_retrieve_body($response );
      return json_decode($body, true);
    }

    return array(
      "data" => array(
        "statusId" => "5",
        "status" => "error",
      ),
      "statusCode" => "500"
    );
  }

  public static function title($params)
  {
    $args = array(
	'headers' => array(
		    'Accept' => 'application/json',
		    'Content-Type' => 'application/json',
		    'Authorization' => 'Bearer ' . self::get_token()
		),
	'timeout' => '70'
    );

    $url = Alister_Ali_Client::$HOST . "/v1/ai/title?" . http_build_query($params);
    $response = wp_remote_get($url, $args);
    $http_code = wp_remote_retrieve_response_code( $response );
    $response_message = wp_remote_retrieve_response_message($response);

    if ($http_code == 200) {
      $body = json_decode(wp_remote_retrieve_body($response), true);
      return ["statusCode" => 200, "data" => array("title" => $body["data"], "limit" => $body["limit"])];
    }
    return array(
      "data" => array(
        "statusId" =>$args,
        "status" => $response_message,
      ),
      "statusCode" => $http_code
    );
  }

  public static function description($data)
  {

    $product_id = $data["product_id"];
    $title = $data["title"];
    $features = $data["features"];
    $word_count = $data["word_count"];
    $temperature = $data["temperature"];
    $language = $data["language"];
    $creations = $data["creations"];

    $body = array("title" => $title, "features" => $features, "word_count" => $word_count, "temperature" => $temperature, "language" => $language, "creations" => $creations);
    $args = array(
      'body'        => json_encode($body),
      'timeout'     => '10',
      'redirection' => '5',
	    'httpversion' => '1.0',
	    'blocking'    => true,
      'headers'     => array('Accept' => 'application/json', 'Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . self::get_token()),
      'cookies'     => array(),
    );

    $url = Alister_Ali_Client::$HOST . "/v1/ai/" . $product_id . "/description";
    $response = wp_remote_post($url, $args);
    $http_code = wp_remote_retrieve_response_code( $response );
    $response_message = wp_remote_retrieve_response_message($response);

    if ($http_code == 200) {
      $body = wp_remote_retrieve_body($response);
      return array("data" => json_decode($body, true), "statusCode" => $http_code);
    }

    return array(
      "data" => array(
        "statusId" =>$args,
        "status" => $response_message,
      ),
      "statusCode" => $http_code
    );
  }

  public static function get_data($ali_id, $ignore_oos = true, $query_args=[])
  {

    $r = array(
      "statusId" => "4",
      "status" => "productNotFound",
      "hasSinglePrice" => false,
      "hasVariations" => true,
      "htmlDescription" => "",
      "productImages" => [],
      "properties" => [],
      "shipping" => array(
        "carriers" => [],
        "currency" => "CHF",
        "isAvailableForSelectedCountries" => false,
        "shipFrom" => "CN"
      ),
      "title" => "",
      "variations" => []
    );


    $HOST = "https://my.donkeybooks.com/alister";
    $url = $HOST . "/v1/products/" . $ali_id . "?" . http_build_query($query_args);
    $args = array(
      'headers'     => array('Accept' => 'application/json', 'Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . self::get_token()),
      'timeout' => '70'
    );

    $response = wp_remote_get($url, $args);

    $http_code = wp_remote_retrieve_response_code( $response );
    $response_message = wp_remote_retrieve_response_message($response);

    $product_data = null;
    $body = null;
    
    if ($http_code == 200) {
      $body = json_decode(wp_remote_retrieve_body($response), true);
      $product_data = $body['details'];
    }

    if (isset($product_data)) {
      if (!empty($product_data["error_code"])) {
        return array(
          "data" => array(
            "statusId" => "4",
            "status" => $response_message,
            "variations" => []
          ),
          "statusCode" => $http_code
        );
      }

      if (isset($product_data["product_status_type"])) {
        $product_status = $product_data["product_status_type"];
      } else {
        throw new \Exception("Product has no status!!!");
      }

      if ($product_status === "onSelling") {
        // product OK
        $r["status"] = "active";
        $r["statusId"] = "0";
      } else {
        // product is offline
        $r["status"] = "unknown";
        $r["statusId"] = "99";
      }

      if (isset($product_data["subject"])) {
        $r["title"] = $product_data["subject"];
      } else {
        throw new \Exception("Error: Missing product title!!!!");
      }

      $r["productId"] = "" . $product_data["product_id"];
      $r["productUrl"] = "https://de.aliexpress.com/item/" . $product_data["product_id"] . ".html";

      $global_price = 0.0;
      $single_global_price = true;

      if (!isset($product_data["aeop_ae_product_s_k_us"])) {
        throw new \Exception("Error: Have no ali variations!!!!");
      }

      foreach ($product_data["aeop_ae_product_s_k_us"]["aeop_ae_product_sku"] as $variation) {

        if (isset($variation["s_k_u_available_stock"]) && $ignore_oos && intval($variation["s_k_u_available_stock"]) === 0) {
          continue;
        }

        $r_var = array(
          "imageUrl" => "",
          "sku" => "",
          "stock" => "0",
          "price" => array(
            "app" => array(
              "hasDiscount" => false,
              "originalPrice" => []
            ),
            "web" => array(
              "hasDiscount" => false,
              "originalPrice" => []
            )
          ),
          "properties" => []
        );

        if (isset($variation["id"]) && $variation["id"] !== "<none>") {
          $r_var["sku"] = $variation["id"];
        }

        if ($variation["currency_code"] !== "USD" && $variation["currency_code"] !== "CNY") {
          throw new \Exception(__CLASS__ . "::" . __FUNCTION__ . ": Error:  Unexpected currency! " . $variation["currency_code"]);
        }

        if (isset($variation["s_k_u_available_stock"])) {
          $r_var["stock"] = "" . $variation["s_k_u_available_stock"];
        }

        $variation_price = 0.0;

        if (isset($variation["offer_sale_price"]) && floatval($variation["offer_sale_price"]) > floatval($variation["sku_price"])) {
          error_log("ALI API WARNING: SALE PRICE HIGHER THAN SKU PRICE!!!");
        }

        if (isset($variation["offer_sale_price"]) && floatval($variation["offer_sale_price"]) < floatval($variation["sku_price"])) {
          $variation_price = self::price2chf(floatval($variation["offer_sale_price"]), strval($variation["currency_code"]));
        } else {
          $variation_price = self::price2chf(floatval($variation["sku_price"]), strval($variation["currency_code"]));
        }

        if (($global_price !== 0.0) && ($global_price !== $variation_price)) {
          $single_global_price = false;
        }

        $global_price = $variation_price;
        $r_var["price"]["app"]["originalPrice"]["value"] = $variation_price;
        $r_var["price"]["web"]["originalPrice"]["value"] = $variation_price;

        if (isset($variation["aeop_s_k_u_propertys"]) && isset($variation["aeop_s_k_u_propertys"]["aeop_sku_property"])) {
          foreach ($variation["aeop_s_k_u_propertys"]["aeop_sku_property"] as $prop) {

            if (!isset($r["properties"][$prop["sku_property_id"]])) {
              $r["properties"][$prop["sku_property_id"]] = array(
                "id" => "" . $prop["sku_property_id"],
                "name" => $prop["sku_property_name"],
                "values" =>  []
              );
            }

            if (!isset($r["properties"][$prop["sku_property_id"]]["values"][$prop["property_value_id_long"]])) {
              $r["properties"][$prop["sku_property_id"]]["values"][$prop["property_value_id_long"]] = array(
                "id" => "" . $prop["property_value_id_long"],
                "name" => isset($prop["property_value_definition_name"]) ? $prop["property_value_definition_name"] : $prop["sku_property_value"],
              );
            }


            $r_var["properties"][] = array(
              "id" => "" . $prop["sku_property_id"],
              "name" => $prop["sku_property_name"],
              "value" => array(
                "id" => "" . $prop["property_value_id_long"],
                "name" => isset($prop["property_value_definition_name"]) ? $prop["property_value_definition_name"] : $prop["sku_property_value"]
              )
            );

            if (isset($prop["sku_image"])) {
              $r_var["imageUrl"] = $prop["sku_image"];
              $r_var["thumbnailImageUrl"] = $prop["sku_image"];
            }
          }
        }

        $r["variations"][] = $r_var;
      }

      if ($single_global_price) {
        $r["hasSinglePrice"] = true;
        $r["price"] = array(
          "app" => array(
            "hasDiscount" => false,
            "originalPrice" => array(
              "value" => $global_price
            )
          ),
          "web" => array(
            "hasDiscount" => false,
            "originalPrice" => array(
              "value" => $global_price
            )
          )
        );
      }

      if (isset($product_data["image_u_r_ls"])) {
        $r["productImages"] = explode(";", $product_data["image_u_r_ls"]);
      }

      $shipping = $body['shipping'];

      if (isset($shipping) && isset($shipping["success"])) {
        if ($shipping["success"]) {

          if (
            isset($shipping["aeop_freight_calculate_result_for_buyer_d_t_o_list"])
            && isset($shipping["aeop_freight_calculate_result_for_buyer_d_t_o_list"]["aeop_freight_calculate_result_for_buyer_dto"])
            && count($shipping["aeop_freight_calculate_result_for_buyer_d_t_o_list"]["aeop_freight_calculate_result_for_buyer_dto"]) > 0
          ) {
            $r["shipTo"] = "CH";
            $r["shipping"]["isAvailableForSelectedCountries"] = true;

            foreach ($shipping["aeop_freight_calculate_result_for_buyer_d_t_o_list"]["aeop_freight_calculate_result_for_buyer_dto"] as $shipping_method) {
              // ...

              if ($shipping_method["freight"]["currency_code"] !== "USD" && $shipping_method["freight"]["currency_code"] !== "CNY") {
                error_log("");
                error_log("");
                error_log("****** SHIPING CURENCY NOT USD or CNY!!!!");
                error_log("");
                error_log("");
                continue;
              }

              $service = $shipping_method["service_name"];
              // $cost = self::usd2chf(floatval($shipping_method["freight"]["amount"]));
              $cost = self::price2chf(floatval($shipping_method["freight"]["amount"]), strval($shipping_method["freight"]["currency_code"]));

              $r["shipping"]["carriers"][] = array(
                "company" => array(
                  "id" => $service,
                  "name" => $service,
                ),
                "price" => array(
                  "value" => $cost
                )
              );
            }
          }
        }
      }

      $r["description"] = $product_data["description"];

      return array(
        "data" => $r,
        "statusCode" => "200"
      );
    }


    return array(
      "data" => array(
        "statusId" => "4",
        "status" => "productNotFound",
        "variations" => [],
      ),
      "statusCode" => "404"
    );
  }

  public static function price2chf($price, $currency)
  {
    return $price;
    $ultimus_currency_rates = get_option('ultimus_currency_rates', array(
      "USD" => (float) 0,
      "CNY" => (float) 0
    ));

    if (empty($ultimus_currency_rates[$currency])) {
      throw new \Exception("Wrong currency code.");
    }
    return floatval($price) / floatval($ultimus_currency_rates[$currency]);
  }
}
