<?php
namespace App\Domains\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Domains\Auth\DTOs\RegisterDTO;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required','string','max:255'],
            'email' => ['required','email','unique:users,email'],
            'password' => ['required','min:6'],
        ];
    }

    public function dto(): RegisterDTO
    {
        return new RegisterDTO(
            $this->name,
            $this->email,
            $this->password
        );
    }
}