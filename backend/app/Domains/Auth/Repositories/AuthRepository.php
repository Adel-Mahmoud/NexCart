<?php

namespace App\Domains\Auth\Repositories;

use App\Domains\Auth\Models\Auth;

class AuthRepository
{
    public function all()
    {
        return Auth::all();
    }
}