<?php

use Illuminate\Support\Facades\Route;

use App\Domains\Users\Http\Controllers\Api\V1\UserController;

// Route::middleware(['web','auth.admin'])->prefix('admin')->name('admin.')->group(function () {
Route::middleware(['api'])->prefix('api/v1')->name('api.v1.')->group(function () {
    Route::apiResource('users', UserController::class);
});