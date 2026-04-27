<?php

namespace App\Domains\Auths\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AuthResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}