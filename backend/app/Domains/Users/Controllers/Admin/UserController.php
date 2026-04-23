<?php

namespace App\Domains\Users\Controllers\Admin;

use App\Http\Controllers\Controller;

class UserController extends Controller
{
    public function index()
    {
        return view('users::admin.index');
    }
}