<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('favorites', 'imdb_rating')) {
            Schema::table('favorites', function (Blueprint $table) {
                $table->string('imdb_rating')
                    ->nullable()
                    ->after('poster');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('favorites', 'imdb_rating')) {
            Schema::table('favorites', function (Blueprint $table) {
                $table->dropColumn('imdb_rating');
            });
        }
    }
};