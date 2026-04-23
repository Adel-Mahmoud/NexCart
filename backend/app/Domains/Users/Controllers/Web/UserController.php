<?php

namespace App\Domains\Users\Controllers\Web;

use App\Http\Controllers\Controller;

class UserController extends Controller
{
    public function index()
    {
        return view('users::web.index');
    }
}