<?php

namespace App\Domains\Users\Http\Resources;

use App\Domains\Users\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    public function toArray($request): array
    {
        return [
            'data' => UserResource::collection($this->collection),
        ];
    }

    public function paginationInformation($request, $paginated, $default)
    {
        return [
            'meta' => [
                'currentPage' => $paginated['current_page'],
                'lastPage' => $paginated['last_page'],
                'perPage' => $paginated['per_page'],
                'total' => $paginated['total'],
            ],
            'links' => $default['links'],
        ];
    }
}