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
    query products($first: Int, $last: Int, $before: String, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean){
        products(first: $first, last: $last, before: $before, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
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
        $queryValue = $request->get('queryValue');
        $sortSelected = $request->get('sortSelected');
        $filterQueryStatus = $request->get('filterQueryStatus');
        $filterQueryTag = $request->get('filterQueryTag');
        $query = "inventory_total:<". $min_inventory;
        if ($filterQueryStatus){
            $query = $query . " AND ". $filterQueryStatus;
        }

        if ($filterQueryTag){
            $query = $query . " AND ". $filterQueryTag;
        }
        if ($queryValue){
            $query = $queryValue. " AND inventory_total:<". $min_inventory;
        }
        $sortSelectArr = array();
        if ($sortSelected){
            $sortSelectArr = explode(" ", $sortSelected);
        }

        if ( $type == 'pre'){
            $variables = [
                "last"      => 10,
                "before"    => $type == 'pre' && $request->get('cursor') ? $request->get('cursor') : null,
                "query"     => $query,
                "sortKey"   => $sortSelected ? $sortSelectArr[0] : null,
                "reverse"   => $sortSelected ? ($sortSelectArr[1] === 'asc' ? false : true) : false
            ];
        }else{
            $variables = [
                "first"     => 10,
                "after"     => $type == 'next' && $request->get('cursor') ? $request->get('cursor') : null,
                "sortKey"   => $sortSelected ? $sortSelectArr[0] : null,
                "reverse"   => $sortSelected ? ($sortSelectArr[1] === 'asc' ? false : true) : false,
                "query"     => $query,
            ];
        }

        // print_r($variables);
       
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
            'id' => $v['node']['id'],
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