<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeDomain extends Command
{
    protected $signature = 'make:domain
        {name}
        {--all}
        {--api}';

    protected $description = 'Generate a full Domain (DDD structure)';

    public function handle(): void
    {
        $name = Str::pluralStudly($this->argument('name'));
        $singular = Str::studly(Str::singular($this->argument('name')));
        $domainPath = app_path("Domains/{$name}");

        $isApi = $this->option('api');
        $isAll = $this->option('all');

        $this->createStructure($domainPath, $isApi);

        $this->createModel($domainPath, $name, $singular);

        $this->createControllers($domainPath, $name, $singular, $isApi);

        $this->createRoutes($domainPath, $name, $singular, $isApi);

        $this->createCoreLayers($domainPath, $name, $singular);

        if (!$isApi) {
            $this->createViews($domainPath, $name);
            $this->createLivewire($domainPath, $name, $singular);
        }

        if ($isAll || $isApi) {
            $this->createDatabase($domainPath, $name);
            $this->createResources($domainPath, $name, $singular);
            $this->createRequests($domainPath, $name, $singular);
            $this->createActions($domainPath, $name, $singular);
            $this->createDTOs($domainPath, $name, $singular);
            $this->createRepository($domainPath, $name, $singular);
            $this->createPolicy($domainPath, $name, $singular);
        }

        $this->info("Domain {$name} created successfully.");
    }

    // =========================
    // STRUCTURE
    // =========================

    private function createStructure(string $path, bool $api): void
    {
        $dirs = [
            "{$path}/Models",
            "{$path}/Actions",
            "{$path}/DTOs",
            "{$path}/Repositories",
            "{$path}/Policies",

            "{$path}/Http/Requests",
            "{$path}/Http/Resources",

            "{$path}/Http/Controllers/Api/V1",
            "{$path}/Database/Migrations",
            "{$path}/Routes",
        ];

        if (!$api) {
            $dirs[] = "{$path}/Http/Controllers/Web";
            $dirs[] = "{$path}/Http/Controllers/Admin";
            $dirs[] = "{$path}/Views/web";
            $dirs[] = "{$path}/Views/admin";
            $dirs[] = "{$path}/Views/livewire";
            $dirs[] = "{$path}/Livewire";
        }

        foreach ($dirs as $dir) {
            File::ensureDirectoryExists($dir);
        }
    }

    // =========================
    // MODEL
    // =========================

    private function createModel($path, $name, $class): void
    {
        File::put("{$path}/Models/{$class}.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Models;

use Illuminate\Database\Eloquent\Model;

class {$class} extends Model
{
    protected \$guarded = [];
}
PHP);
    }

    // =========================
    // CONTROLLERS
    // =========================

    private function createControllers($path, $name, $class, $api): void
    {
        if ($api) {
            File::put("{$path}/Http/Controllers/Api/V1/{$class}Controller.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

class {$class}Controller extends Controller
{
    public function index()
    {
        return response()->json(['message' => '{$class} API']);
    }
}
PHP);
            return;
        }

        File::put("{$path}/Http/Controllers/Web/{$class}Controller.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class {$class}Controller extends Controller
{
    public function index()
    {
        return view('domains.{$name}::web.index');
    }
}
PHP);

        File::put("{$path}/Http/Controllers/Admin/{$class}Controller.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

class {$class}Controller extends Controller
{
    public function index()
    {
        return view('domains.{$name}::admin.index');
    }
}
PHP);
    }

    // =========================
    // ROUTES
    // =========================

    private function createRoutes($path, $name, $class, $api): void
    {
        if ($api) {
            File::put("{$path}/Routes/api.php", <<<PHP
<?php

use Illuminate\Support\Facades\Route;
use App\Domains\\{$name}\Http\Controllers\Api\V1\\{$class}Controller;

Route::prefix('v1')->group(function () {
    Route::get('/{$name}', [{$class}Controller::class, 'index']);
});
PHP);
            return;
        }

        File::put("{$path}/Routes/web.php", <<<PHP
<?php

use Illuminate\Support\Facades\Route;
use App\Domains\\{$name}\Http\Controllers\Web\\{$class}Controller;

Route::get('/{$name}', [{$class}Controller::class, 'index']);
PHP);

        File::put("{$path}/Routes/admin.php", <<<PHP
<?php

use Illuminate\Support\Facades\Route;
use App\Domains\\{$name}\Http\Controllers\Admin\\{$class}Controller;

Route::prefix('admin')->group(function () {
    Route::get('/{$name}', [{$class}Controller::class, 'index']);
});
PHP);
    }

    // =========================
    // CORE LAYERS (Actions + DTO + etc)
    // =========================

    private function createCoreLayers($path, $name, $class): void {}

    private function createActions($path, $name, $class)
    {
        File::put("{$path}/Actions/Create{$class}Action.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Actions;

use App\Domains\\{$name}\DTOs\Create{$class}DTO;
use App\Domains\\{$name}\Models\\{$class};

class Create{$class}Action
{
    public function execute(Create{$class}DTO \$dto)
    {
        return {$class}::create((array) \$dto);
    }
}
PHP);
    }

    private function createDTOs($path, $name, $class)
    {
        File::put("{$path}/DTOs/Create{$class}DTO.php", <<<PHP
<?php

namespace App\Domains\\{$name}\DTOs;

class Create{$class}DTO
{
    public function __construct(
        public string \$name
    ) {}
}
PHP);
    }

    private function createResources($path, $name, $class)
    {
        File::put("{$path}/Http/Resources/{$class}Resource.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class {$class}Resource extends JsonResource
{
    public function toArray(\$request)
    {
        return [
            'id' => \$this->id,
            'name' => \$this->name,
        ];
    }
}
PHP);
    }

    private function createRequests($path, $name, $class)
    {
        File::put("{$path}/Http/Requests/Store{$class}Request.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Store{$class}Request extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255'
        ];
    }
}
PHP);
    }

    private function createRepository($path, $name, $class)
    {
        File::put("{$path}/Repositories/{$class}Repository.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Repositories;

use App\Domains\\{$name}\Models\\{$class};

class {$class}Repository
{
    public function all()
    {
        return {$class}::all();
    }
}
PHP);
    }

    private function createPolicy($path, $name, $class)
    {
        File::put("{$path}/Policies/{$class}Policy.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Policies;

class {$class}Policy
{
    public function view() { return true; }
}
PHP);
    }

    // =========================
    // VIEWS
    // =========================

    private function createViews($path, $name)
    {
        File::put("{$path}/Views/web/index.blade.php", "<h1>{$name} Web</h1>");
        File::put("{$path}/Views/admin/index.blade.php", "<h1>{$name} Admin</h1>");
    }

    private function createLivewire($path, $name, $class)
    {
        File::put("{$path}/Livewire/{$class}Index.php", <<<PHP
<?php

namespace App\Domains\\{$name}\Livewire;

use Livewire\Component;

class {$class}Index extends Component
{
    public function render()
    {
        return view('domains.{$name}::livewire.index');
    }
}
PHP);

        File::put("{$path}/Views/livewire/index.blade.php", "<h1>Livewire {$name}</h1>");
    }

    // =========================
    // DATABASE
    // =========================

    private function createDatabase($path, $name)
    {
        $table = Str::snake($name);

        File::put("{$path}/Database/Migrations/" . now()->format('Y_m_d_His') . "_create_{$table}.php", <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('{$table}', function (Blueprint \$table) {
            \$table->id();
            \$table->string('name');
            \$table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('{$table}');
    }
};
PHP);
    }
}