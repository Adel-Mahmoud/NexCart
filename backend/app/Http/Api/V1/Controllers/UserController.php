<?php

namespace App\Http\Api\V1\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Users\Requests\StoreUserRequest;
use App\Domains\Users\DTOs\CreateUserDTO;
use App\Domains\Users\Actions\CreateUserAction;
use App\Domains\Users\Resources\UserResource;
use App\Domains\Users\Repositories\UserRepository;

class UserController extends Controller
{
    public function index(UserRepository $repository)
    {
        return UserResource::collection($repository->all());
    }

    public function store(
        StoreUserRequest $request,
        CreateUserAction $action
    ) {
        $dto = CreateUserDTO::fromArray($request->validated());

        $user = $action->execute($dto);

        return new UserResource($user);
    }


    public function show(int $id, UserRepository $repository)
    {
        $user = $repository->find($id);

        return new UserResource($user);
    }

    public function update(int $id, UpdateUserRequest $request, UserRepository $repository)
    {
        $dto = UpdateUserDTO::fromArray($request->validated());
    }

    public function destroy(int $id, UserRepository $repository)
    {
        $repository->delete($id);

        return response()->noContent();
    }
}


// http://localhost:8000/api/v1/users
// http://localhost:8000/api/v1/users/1
// http://localhost:8000/api/v1/users/1