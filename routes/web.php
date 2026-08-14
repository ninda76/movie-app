<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MovieController;
use App\Http\Controllers\Admin\FavoriteController;


use Inertia\Inertia;


/*
|--------------------------------------------------------------------------
| ROOT
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Splash/Index');
});

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
|
| Login sekarang menggunakan LoginController.
| Tidak lagi menggunakan closure di routes/web.php.
|
*/


/*
|--------------------------------------------------------------------------
| LOGIN PAGE
|--------------------------------------------------------------------------
*/

Route::get('/login', [
    LoginController::class,
    'show'
])->name('login');


/*
|--------------------------------------------------------------------------
| LOGIN PROCESS
|--------------------------------------------------------------------------
*/

Route::post('/login', [
    LoginController::class,
    'login'
])->name('login.process');


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

Route::post('/logout', [
    LoginController::class,
    'logout'
])->name('logout');


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
|
| Semua halaman admin harus login terlebih dahulu.
|
*/

Route::middleware('auth')->group(function () {


    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/dashboard',
        [DashboardController::class, 'index']
    )->name('admin.dashboard');


    /*
    |--------------------------------------------------------------------------
    | MOVIE LIST
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/movies',
        [MovieController::class, 'index']
    )->name('admin.movies.index');


    /*
    |--------------------------------------------------------------------------
    | MOVIE DETAIL
    |--------------------------------------------------------------------------
    |
    | Digunakan oleh:
    | - Movie List
    | - Favorite
    |
    */

    Route::get(
        '/admin/movies/{imdbID}',
        [MovieController::class, 'show']
    )->name('admin.movies.show');


    /*
    |--------------------------------------------------------------------------
    | FAVORITE PAGE
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/favorite',
        [FavoriteController::class, 'index']
    )->name('admin.favorite');

});


/*
|--------------------------------------------------------------------------
| FAVORITE API
|--------------------------------------------------------------------------
|
| POST   /favorite
| DELETE /favorite/{imdbID}
|
*/


/*
|--------------------------------------------------------------------------
| ADD FAVORITE
|--------------------------------------------------------------------------
*/

Route::post(
    '/favorite',
    [FavoriteController::class, 'store']
)->name('favorite.store');


/*
|--------------------------------------------------------------------------
| DELETE FAVORITE
|--------------------------------------------------------------------------
*/

Route::delete(
    '/favorite/{imdbID}',
    [FavoriteController::class, 'destroy']
)->name('favorite.destroy');