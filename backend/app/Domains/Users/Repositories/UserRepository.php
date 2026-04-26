<?php

namespace App\Domains\Users\Repositories;

use App\Domains\Users\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository
{
    public function create(array $data): User
    {
        return User::query()->create($data);
    }

    public function find(int $id): ?User
    {
        return User::query()->find($id);
    }

    public function all(?int $perPage = null): LengthAwarePaginator
    {
        $perPage = $perPage ?? request()->integer('per_page', 1);

        return User::query()
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function update(int $id, array $data): bool
    {
        return User::query()
            ->where('id', $id)
            ->update($data);
    }

    public function delete(int $id): bool
    {
        return User::query()
            ->where('id', $id)
            ->delete();
    }
}