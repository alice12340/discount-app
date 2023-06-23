<?php

declare(strict_types=1);

namespace App\Lib;

use Shopify\Auth\Session;
use Shopify\Clients\Graphql;

class ScriptTag
{
    private const CREATE_SCRIPTTAG_MUTATION = <<<'QUERY'
    mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
          scriptTag {
            id
            src
            displayScope
          }
          userErrors {
            field
            message
          }
        }
      }      
    QUERY;

    private const FETCH_SCRIPTTAG_MUTATION = <<<'QUERY'
    query {
        scriptTags(first: 50) {
            edges {
                node {
                    id
                    src
                }
            }
        }
    }
    QUERY;

    private const DELETE_SCRIPTTAG_MUTATION = <<<'QUERY'
    mutation scriptTagDelete($id: ID!) {
        scriptTagDelete(id: $id) {
          deletedScriptTagId
          userErrors {
            field
            message
          }
        }
    }
    QUERY;


    public static function call(Session $session)
    {
        // file_put_contents('cc.txt', print_r( $session->getShop().$session->getAccessToken()));
        $client = new Graphql($session->getShop(), $session->getAccessToken());
        $response = $client->query([
            "query" => self::FETCH_SCRIPTTAG_MUTATION
        ])->getDecodedBody();
        file_put_contents('aa1.txt', print_r($response, true));
   
        // $restClient = new Rest($session->getShop(), $session->getAccessToken());
        foreach ($response["data"]["scriptTags"]["edges"] as $edge) {
            $id = $edge["node"]["id"];
            // $restClient->delete('script_tags', $id);
            $mutation_variables = [
                "id" => $id,
            ];
            $res = $client->query(
                [
                    "query" => self::DELETE_SCRIPTTAG_MUTATION,
                    "variables" => $mutation_variables,
                ],
            );

        }

    

        $response = $client->query(
            [
                "query" => self::CREATE_SCRIPTTAG_MUTATION,
                "variables" => [
                    "input" => [
                        "cache" => true,
                        "displayScope"=> "ALL",
                        "src"   => asset('assets/scriptTags/updateCartDiscount.js'),
                    ]
                ]
            ],
        );
        return $response;

    }

}