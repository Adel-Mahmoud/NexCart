<?php

namespace App\Domains\Users\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
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
            'phone' => ['nullable','string'],
            'status' => ['required','in:active,inactive'],
        ];
    }
}