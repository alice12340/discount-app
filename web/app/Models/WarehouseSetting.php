<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseSetting extends Model
{
    use HasFactory;
    
    protected $table = 'warehouse_settings';

    protected $guarded = [];

}
