<?php

declare(strict_types=1);

namespace App\Lib;

use GuzzleHttp\Client;
use Shopify\Clients\Graphql;
use Shopify\Clients\Rest;

class DiscountList
{

    private const QUERY_DISCOUNT_LIST = <<<'QUERY'
    query {
      discountNodes(first: 100) {
        edges {
          node {
            id
            metafield(namespace: "$app:order-discount-ext",key: "function-configuration"){
              value
            }
            discount {
              ... on DiscountAutomaticApp {
                title
              }
            }
          }
        }
      }
    }
    
    QUERY;


    public static function call($shop, $access_token)
    {
        $client = new Graphql($shop, $access_token);
        $response = $client->query(
            [
                "query" => self::QUERY_DISCOUNT_LIST,
            ],
        )->getDecodedBody();
        
        $re =  [];
        foreach ($response['data']['discountNodes']['edges'] as $k => $v) {
          $metafield = ((array)json_decode($v['node']['metafield']['value']));
          $title =  $v['node']['discount']['title'];
          $payPeriod = $metafield['payPeriod'];
          array_push($re, ['value' => $payPeriod, 'title' => $title]);
        }
      
        return $re;
    }

}