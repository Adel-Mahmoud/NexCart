<?php

namespace App\Domains\Auths\Http\Controllers\Api\V1;

use App\Domains\Auth\Actions\RegisterAction;
use App\Domains\Auth\Http\Requests\RegisterRequest;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Auth API']);
    }

    public function register(RegisterRequest $request, RegisterAction $action)
    {
        return $action->handle($request->dto());
    }
}