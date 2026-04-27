<?php

namespace App\Domains\Users\Http\Requests;
use Illuminate\Validation\Rule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],

            'password' => [
                'nullable',
                'min:6'
            ],

            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['required','in:active,inactive'],
        ];
    }
}