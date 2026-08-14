<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $table = 'favorites';

    protected $fillable = [
        'imdb_id',
        'title',
        'year',
        'genre',
        'poster',
        'imdb_rating',
    ];
}