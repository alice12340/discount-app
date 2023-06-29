<?php

declare(strict_types=1);

namespace App\Lib;

use GuzzleHttp\Client;
use Shopify\Clients\Graphql;
use Shopify\Clients\Rest;

class UpdateCartDiscount
{
    // mutation {
    //     cartDiscountCodesUpdate(
    //         cartId:"gid://shopify/Cart/c1-22db8e5e9829b8595b77671d7f8e3f38",
    //         discountCodes:["30d"]
    //       ) {
    //         cart {
    //           id
    //           createdAt
    //           updatedAt
    //           lines(first: 100) {
    //             edges {
    //               node {
    //                 id
    //                 quantity
    //                 discountAllocations {
    //                   discountedAmount {
    //                     amount
    //                     currencyCode
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //           # The estimated total cost of all merchandise that the customer will pay at checkout.
    //           cost {
    //             totalAmount {
    //               amount
    //               currencyCode
    //             }
    //             # The estimated amount, before taxes and discounts, for the customer to pay at checkout.
    //             subtotalAmount {
    //               amount
    //               currencyCode
    //             }
    //             # The estimated tax amount for the customer to pay at checkout.
    //             totalTaxAmount {
    //               amount
    //               currencyCode
    //             }
    //             # The estimated duty amount for the customer to pay at checkout.
    //             totalDutyAmount {
    //               amount
    //               currencyCode
    //             }
    //           }
    //           discountCodes {
    //               applicable
    //               code
    //           }
    //         }
    //         userErrors {
    //           field
    //           message
    //         }
    //       }
    //     }
    private const CART_UPDATE_MUTATION = <<<'QUERY'
    mutation {
            cartDiscountCodesUpdate(
                cartId:"gid://shopify/Cart/c1-30902fbfd26bcae82ed6b54da472a9d6",
                discountCodes:["11"]
              ) {
                cart {
                  id
                  createdAt
                  updatedAt
                  lines(first: 100) {
                    edges {
                      node {
                        id
                        quantity
                        discountAllocations {
                          discountedAmount {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                  # The estimated total cost of all merchandise that the customer will pay at checkout.
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                    # The estimated amount, before taxes and discounts, for the customer to pay at checkout.
                    subtotalAmount {
                      amount
                      currencyCode
                    }
                    # The estimated tax amount for the customer to pay at checkout.
                    totalTaxAmount {
                      amount
                      currencyCode
                    }
                    # The estimated duty amount for the customer to pay at checkout.
                    totalDutyAmount {
                      amount
                      currencyCode
                    }
                  }
                  discountCodes {
                      applicable
                      code
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
        
    QUERY;


    public static function call($shop, $access_token)
    {
        $client = new Graphql($shop, $access_token);
   
        $query  = <<<'QUERY'
        mutation storefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
            storefrontAccessTokenCreate(input: $input) {
              shop {
                id
              }
              storefrontAccessToken {
                accessToken
              }
              userErrors {
                field
                message
              }
            }
          }
        QUERY;
        $accessTokenVars = [
            "input" => [
                "title" =>"my-access-token"
                ]
            ];

        $response = $client->query(
            [
                "query" => $query,
                "variables" => $accessTokenVars
            ],
        )->getDecodedBody();
       
       
        $storefrontAccessToken = $response['data']['storefrontAccessTokenCreate']['storefrontAccessToken']['accessToken'];
        $client = new Client();
        $response = $client->post("https://".$shop."/api/2023-04/graphql.json", [
            'headers' => [
                'Content-Type' => 'application/json',
                'X-Shopify-Storefront-Access-Token' => $storefrontAccessToken,
            ],
            'json' => ['query' => self::CART_UPDATE_MUTATION],
        ]);

        $data = json_decode($response->getBody()->getContents(), true);
       
        return $data;

    }

}