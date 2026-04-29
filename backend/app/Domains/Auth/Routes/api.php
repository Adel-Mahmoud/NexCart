<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Http\Controllers\Api\V1\AuthController;

Route::middleware(['api'])->prefix('api/v1/auth')->name('api.v1.')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});