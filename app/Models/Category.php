<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug'];

    /** @use HasFactory<\Database\Factories\CategoryFactory> */
    use HasFactory;

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
