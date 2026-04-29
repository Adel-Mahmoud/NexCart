<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Auth\DTOs\CreateAuthDTO;
use App\Domains\Auth\Models\Auth;

class CreateAuthAction
{
    public function execute(CreateAuthDTO $dto)
    {
        return Auth::create((array) $dto);
    }
}