<?php

namespace App\Domains\Users\Actions;

use App\Domains\Users\DTOs\UpdateUserDTO;
use App\Domains\Users\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

class UpdateUserAction
{
    public function __construct(
        private UserRepository $repository
    ) {}

    public function execute(int $id, UpdateUserDTO $dto)
    {
        $data = [
            'name' => $dto->name,
            'email' => $dto->email,
            'phone' => $dto->phone,
            'status' => $dto->status,
        ];

        if (!empty($dto->password)) {
            $data['password'] = Hash::make($dto->password);
        }

        return $this->repository->update($id, array_filter(
            $data,
            fn ($value) => !is_null($value)
        ));
    }
}