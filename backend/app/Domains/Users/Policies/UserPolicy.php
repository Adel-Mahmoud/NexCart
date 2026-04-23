<?php

namespace App\Domains\Users\Policies;

use App\Models\User as AuthUser;
use App\Domains\Users\Models\User;

class UserPolicy
{
    public function view(AuthUser $user, User $model): bool
    {
        return true;
    }

    public function create(AuthUser $user): bool
    {
        return true;
    }

    public function update(AuthUser $user, User $model): bool
    {
        return true;
    }

    public function delete(AuthUser $user, User $model): bool
    {
        return true;
    }
}