<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auths\Http\Controllers\Api\V1\AuthController;

Route::prefix('v1/auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
});