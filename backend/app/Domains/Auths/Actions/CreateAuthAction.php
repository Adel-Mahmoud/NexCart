<?php

namespace App\Domains\Auths\Actions;

use App\Domains\Auths\DTOs\CreateAuthDTO;
use App\Domains\Auths\Models\Auth;

class CreateAuthAction
{
    public function execute(CreateAuthDTO $dto)
    {
        return Auth::create((array) $dto);
    }
}