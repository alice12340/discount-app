<?php

declare(strict_types=1);

namespace App\Lib;

use App\Exceptions\ShopifyProductCreatorException;
use Shopify\Auth\Session;
use Shopify\Clients\Graphql;

class ProductFetch
{
    private const FETCH_PRODUCTS_QUERY = <<<'QUERY'
    query {
        products(first:10){
            edges{
                node{
                    id,
                    title,
                    description
                }
            }
        }
    }
    QUERY;

    public static function call(Session $session)
    {
        $client = new Graphql($session->getShop(), $session->getAccessToken());
        $response = $client->query(["query" => self::FETCH_PRODUCTS_QUERY]);
        return $response;
    }

}