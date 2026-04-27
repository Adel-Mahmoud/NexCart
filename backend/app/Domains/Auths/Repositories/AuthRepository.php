<?php

namespace App\Domains\Auths\Repositories;

use App\Domains\Auths\Models\Auth;

class AuthRepository
{
    public function all()
    {
        return Auth::all();
    }
}