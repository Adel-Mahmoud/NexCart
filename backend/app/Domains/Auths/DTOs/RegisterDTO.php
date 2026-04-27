<?php

namespace App\Domains\Auth\DTOs;

class RegisterDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
    ) {}
}