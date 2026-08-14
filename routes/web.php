<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MovieController;
use App\Http\Controllers\Admin\FavoriteController;


/*
|--------------------------------------------------------------------------
| ROOT
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect('/login');
});


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

/*
| Halaman Login
|
| File React:
| resources/js/Pages/Login/Index.jsx
*/

Route::get('/login', function () {
    return Inertia::render('Login/Index');
})->name('login');


/*
|--------------------------------------------------------------------------
| LOGIN PROCESS
|--------------------------------------------------------------------------
*/

Route::post('/login', function (Request $request) {

    $credentials = $request->validate([
        'username' => ['required'],
        'password' => ['required'],
    ]);

    if (
        Auth::attempt([
            'username' => $credentials['username'],
            'password' => $credentials['password'],
        ])
    ) {

        $request->session()->regenerate();

        return redirect()->intended(
            '/admin/dashboard'
        );
    }

    return back()->withErrors([
        'login' => 'Username atau password salah.',
    ]);

})->name('login.process');


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
|
| PENTING:
| Logout menggunakan POST.
|
| Jangan menggunakan:
|
| GET /logout
|
*/

Route::post('/logout', function (Request $request) {

    Auth::logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return redirect('/login');

})->name('logout');


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
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
    | - Movie List modal
    | - Favorite modal
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
| Tambah Favorite
*/

Route::post(
    '/favorite',
    [FavoriteController::class, 'store']
)->name('favorite.store');


/*
| Hapus Favorite
*/

Route::delete(
    '/favorite/{imdbID}',
    [FavoriteController::class, 'destroy']
)->name('favorite.destroy');