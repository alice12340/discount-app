<?php

use App\Lib\UpdateCartDiscount;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});

Route::post('updateCartDiscount', function(Request $request){
    $sesion = Session::first();
    $res = UpdateCartDiscount::call($sesion->shop, $sesion->access_token);
    return json_encode($res);
});