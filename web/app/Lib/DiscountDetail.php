<?php

declare(strict_types=1);

namespace App\Lib;

use Exception;
use Illuminate\Http\Request;
use Shopify\Auth\Session;
use Shopify\Clients\Graphql;

class DiscountDetail
{
    private const QUERY_DISCOUNT_MUTATION = <<<'QUERY'
    query automaticDiscountNode($id: ID!){
      automaticDiscountNode(id: $id) {
        id
        metafield(namespace: "$app:order-discount-ext",key: "function-configuration"){
          value
          id
        }
        automaticDiscount {
          __typename
          ... on DiscountAutomaticApp {
            createdAt
            startsAt
            endsAt
            status
            title
            discountId
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
        }
      }
    }
    
    QUERY;

    public static function call(Session $session, $id)
    {
        $client = new Graphql($session->getShop(), $session->getAccessToken());
        $response = $client->query(
            [
                "query" => self::QUERY_DISCOUNT_MUTATION,
                "variables" => [
                  "id" => "gid://shopify/DiscountAutomaticNode/".$id,
                ]
            ],
        );
        file_put_contents('dd.txt', print_r($response->getDecodedBody(), true));

        if ($response->getStatusCode() !== 200) {
            throw new \Exception($response->getBody()->__toString());
        }
        return $response;
    }

   
}
