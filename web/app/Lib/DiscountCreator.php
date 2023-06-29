<?php

declare(strict_types=1);

namespace App\Lib;

use Exception;
use Shopify\Auth\Session;
use Shopify\Clients\Graphql;

class DiscountCreator
{
    private const CREATE_DISCOUNT_MUTATION = <<<'QUERY'
    mutation {
        discountCodeBasicCreate(
          basicCodeDiscount: {
            title: "code basic test11"
            startsAt: "2019-01-01"
            endsAt: "2025-01-01"
            customerSelection: { all: true }
            code: "123456"
            customerGets: {
              value: {
                percentage: 1.0
              }
             items: {
                all: true,
                } 
          }
          }
        ) {
          userErrors {
            field
            message
            code
          }
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                summary
                status
                codes(first: 10) {
                  edges {
                    node {
                      code
                    }
                  }
                }
              }
            }
          }
        }
      }
    QUERY;

    public static function call(Session $session)
    {
        $client = new Graphql($session->getShop(), $session->getAccessToken());

            $response = $client->query(
                [
                    "query" => self::CREATE_DISCOUNT_MUTATION,
                ],
            );
            file_put_contents('66.txt', print_r($response, true));

            if ($response->getStatusCode() !== 200) {
                throw new \Exception($response->getBody()->__toString());
            }
        
    }

   
}
