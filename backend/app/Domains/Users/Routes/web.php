<?php

use Illuminate\Support\Facades\Route;

Route::middleware('web')->prefix('users')->group(function () {
    // Route::get('/', [App\Domains\Users\Controllers\Web\UserController::class, 'index']);
});