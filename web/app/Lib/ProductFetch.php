<?php

declare(strict_types=1);

namespace App\Lib;

use App\Exceptions\ShopifyProductCreatorException;
use App\Models\WarehouseSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Shopify\Auth\Session;
use Shopify\Clients\Graphql;

class ProductFetch
{
    private const FETCH_PRODUCTS_QUERY = <<<'QUERY'
    query products($first: Int, $last: Int, $before: String, $after: String, $query: String){
        products(first: $first, last: $last, before: $before, after: $after, query: $query) {
            pageInfo{
                hasNextPage
                hasPreviousPage
              }
            edges {
                cursor
                node {
                    id
                    title
                    featuredImage{
                        url
                    }
                    status
                    totalInventory
                }
            }
        }
    }
    QUERY;


    public static function call(Session $session, Request $request)
    {
       
        $min_inventory = WarehouseSetting::where('shop', $session->getShop())->value('min_inventory');
        $client = new Graphql($session->getShop(), $session->getAccessToken());
        $type = $request->get('type') ? $request->get('type') : 'next';
        
      

        if ( $type == 'pre'){
            $variables = [
                "last"      => 10,
                "before"    => $type == 'pre' && $request->get('cursor') ? $request->get('cursor') : null,
                "query"     => "inventory_total:<". $min_inventory,
            ];
        }else{
            $variables = [
                "first"     => 10,
                "after"     => $type == 'next' && $request->get('cursor') ? $request->get('cursor') : null,
                "query"     => "inventory_total:<". $min_inventory,
            ];
        }

     
       
        $response = $client->query(
            [
                "query" => self::FETCH_PRODUCTS_QUERY,
                "variables" => $variables,
            ],
        );

        if ($response->getStatusCode() !== 200) {
            throw new \Exception($response->getBody()->__toString());
        }
        $re =  [];
        $response = $response->getDecodedBody();
        foreach ($response['data']['products']['edges'] as $k => $v) {
          $item = [
            'title' => $v['node']['title'],
            'status' => $v['node']['status'],
            'featuredImage' => $v['node']['featuredImage']['url'],
            'totalInventory' => $v['node']['totalInventory'],
            'cursor' => $v['cursor']
          ];
          array_push($re, $item);
        }

        $result = array(
            'products' => $re,
            'pageInfo'  => $response['data']['products']['pageInfo']
        );
      
        return $result;
    }

}