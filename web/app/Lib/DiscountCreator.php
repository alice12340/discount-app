<?php

declare(strict_types=1);

namespace App\Lib;

use Exception;
use Illuminate\Http\Request;
use Shopify\Auth\Session;
use Shopify\Clients\Graphql;

class DiscountCreator
{
    private const CREATE_CODE_MUTATION = <<<'QUERY'
    mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
      discountCreate: discountCodeAppCreate(codeAppDiscount: $discount) {
        userErrors {
          code
          message
          field
        }
      }
    }
    QUERY;

    private const CREATE_AUTOMATIC_MUTATION = <<<'QUERY'
    mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
      discountCreate: discountAutomaticAppCreate(
        automaticAppDiscount: $discount
      ) {
        userErrors {
          code
          message
          field
        }
      }
    }
    QUERY;

    private const UPDATE_AUTOMATIC_MUTATION = <<<'QUERY'
    mutation UpdateDiscountAutomaticApp($id: ID!, $discount: DiscountAutomaticAppInput!) {
      discountUpdate: discountAutomaticAppUpdate(
        id: $id
        automaticAppDiscount: $discount
        
    ) {
        userErrors {
          field
          message
        }
      }
    }
    QUERY;


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

    public static function call($type, Session $session, $request)
    {
        $client = new Graphql($session->getShop(), $session->getAccessToken());
        if ($type === 'auto'){
            $response = $client->query(
              [
                  "query" => self::CREATE_AUTOMATIC_MUTATION,
                  "variables" => $request,
              ],
            );
        }else{
            $id = $request['discount']['id'];
            unset($request['discount']['id']);
            $variables  =[
              'id' => 'gid://shopify/DiscountAutomaticNode/'.$id,
              'discount'  => $request['discount']
            ];
            $response = $client->query(
              [
                  "query" => self::UPDATE_AUTOMATIC_MUTATION,
                  "variables" => $variables,
              ],
            );
        }
        // file_put_contents('33.txt', print_r($variables, true));

        if ($response->getStatusCode() !== 200) {
            throw new \Exception($response->getBody()->__toString());
        }
        return $response;
    }

   
}
