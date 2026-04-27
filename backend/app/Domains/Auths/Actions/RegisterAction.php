<?php
namespace App\Domains\Auth\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Domains\Auth\DTOs\RegisterDTO;

class RegisterAction
{
    public function handle(RegisterDTO $dto)
    {
        $user = User::create([
            'name' => $dto->name,
            'email' => $dto->email,
            'password' => Hash::make($dto->password),
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
}