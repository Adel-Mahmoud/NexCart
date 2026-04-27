<?php

namespace App\Domains\Users\Actions;

use App\Domains\Users\DTOs\CreateUserDTO;
use App\Domains\Users\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

class CreateUserAction
{
    public function __construct(
        private UserRepository $repository
    ) {}

    public function execute(CreateUserDTO $dto)
    {
        return $this->repository->create([
            'name' => $dto->name,
            'email' => $dto->email,
            'phone' => $dto->phone,
            'password' => Hash::make($dto->password),
            'status' => $dto->status,
        ]);
    }
}