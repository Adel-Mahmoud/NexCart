<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeDomain extends Command
{
    protected $signature = 'make:domain {name : The name of the domain}
                            {--table : Generate migration table}
                            {--policy : Generate policy class}
                            {--repository : Generate repository class}
                            {--livewire : Generate livewire component}
                            {--request : Generate form request class}
                            {--all : Generate all optional classes (migration, policy, repository, request, livewire)}
                            {--api : Generate API structure (Controller, DTO, Action, Resource, Request)}
                            {--api-version= : API version prefix (e.g., v1, default v1)}
                            {--dto : Generate DTO class (for API)}
                            {--action : Generate action class (for API)}
                            {--resource : Generate API resource class}';

    protected $description = 'Create a new domain structure with full API support (DTOs, Actions, Resources, API routes)';

    public function handle(): void
    {
        $name = Str::pluralStudly($this->argument('name'));
        $className = Str::studly(Str::singular($this->argument('name')));
        $domainPath = app_path("Domains/{$name}");
        $apiVersion = $this->option('api-version') ?: 'v1';
        $generateApi = $this->option('api') || $this->option('dto') || $this->option('action') || $this->option('resource');

        $this->createDirectoryStructure($domainPath, $generateApi, $apiVersion);
        $this->createModel($domainPath, $name, $className);
        $this->createControllers($domainPath, $name, $className);
        $this->createRoutes($domainPath, $name, $className, $generateApi, $apiVersion);
        $this->createViews($domainPath, $name);
        $this->createOptionalClasses($domainPath, $name, $className);

        if ($generateApi) {
            $this->createApiStructure($domainPath, $name, $className, $apiVersion);
        }

        $this->info("Domain {$name} created successfully.");
    }

    // ======================== Directory Structure ========================
    private function createDirectoryStructure(string $domainPath, bool $generateApi, string $apiVersion): void
    {
        $directories = [
            "{$domainPath}/Models",
            "{$domainPath}/Controllers/Web",
            "{$domainPath}/Controllers/Admin",
            "{$domainPath}/Routes",
            "{$domainPath}/Views/web",
            "{$domainPath}/Views/admin",
            "{$domainPath}/Database/Migrations",
        ];

        if ($generateApi) {
            $directories = array_merge($directories, [
                "{$domainPath}/Controllers/Api/{$apiVersion}",
                "{$domainPath}/Requests/Api",
                "{$domainPath}/DTOs",
                "{$domainPath}/Actions",
                "{$domainPath}/Resources",
                "{$domainPath}/Routes/Api",
            ]);
        }

        foreach ($directories as $dir) {
            File::ensureDirectoryExists($dir);
        }
    }

    // ======================== Model ========================
    private function createModel(string $domainPath, string $name, string $className): void
    {
        $modelPath = "{$domainPath}/Models/{$className}.php";
        if (!File::exists($modelPath)) {
            File::put($modelPath, $this->getModelStub($name, $className));
            $this->info("Model created: {$modelPath}");
        }
    }

    // ======================== Controllers (Web/Admin) ========================
    private function createControllers(string $domainPath, string $name, string $className): void
    {
        $webControllerPath = "{$domainPath}/Controllers/Web/{$className}Controller.php";
        $adminControllerPath = "{$domainPath}/Controllers/Admin/{$className}Controller.php";

        if (!File::exists($webControllerPath)) {
            File::put($webControllerPath, $this->getControllerStub($name, $className, 'Web'));
            $this->info("Web Controller created: {$webControllerPath}");
        }

        if (!File::exists($adminControllerPath)) {
            File::put($adminControllerPath, $this->getControllerStub($name, $className, 'Admin'));
            $this->info("Admin Controller created: {$adminControllerPath}");
        }
    }

    // ======================== Routes (Web, Admin, API) ========================
    private function createRoutes(string $domainPath, string $name, string $className, bool $generateApi, string $apiVersion): void
    {
        $lowercaseName = strtolower($name);
        $webRoutes = <<<PHP
        <?php

        use Illuminate\Support\Facades\Route;
        use App\Domains\\{$name}\Controllers\Web\\{$className}Controller;

        Route::middleware('web')->prefix('{$lowercaseName}')->name('{$lowercaseName}.')->group(function () {
            Route::get('/', [{$className}Controller::class, 'index'])->name('index');
        });
        PHP;

        $adminRoutes = <<<PHP
        <?php

        use Illuminate\Support\Facades\Route;
        use App\Domains\\{$name}\Controllers\Admin\\{$className}Controller;

        Route::middleware(['web', 'auth.admin'])->prefix('admin')->name('admin.')->group(function () {
            Route::resource('{$lowercaseName}', {$className}Controller::class);
        });
        PHP;

        File::put("{$domainPath}/Routes/web.php", $webRoutes);
        File::put("{$domainPath}/Routes/admin.php", $adminRoutes);

        if ($generateApi) {
            $apiRoutes = <<<PHP
            <?php

            use Illuminate\Support\Facades\Route;
            use App\Domains\\{$name}\Controllers\Api\\{$apiVersion}\\{$className}Controller;

            Route::prefix('api/{$apiVersion}/{$lowercaseName}')->name('api.{$apiVersion}.{$lowercaseName}.')->group(function () {
                Route::get('/', [{$className}Controller::class, 'index'])->name('index');
                Route::post('/', [{$className}Controller::class, 'store'])->name('store');
                Route::get('/{id}', [{$className}Controller::class, 'show'])->name('show');
                Route::put('/{id}', [{$className}Controller::class, 'update'])->name('update');
                Route::delete('/{id}', [{$className}Controller::class, 'destroy'])->name('destroy');
            });
            PHP;

            File::put("{$domainPath}/Routes/Api/{$apiVersion}.php", $apiRoutes);
            $this->info("API routes created for version {$apiVersion}");
        }
    }

    // ======================== Views (simple stubs) ========================
    private function createViews(string $domainPath, string $name): void
    {
        $webViewPath = "{$domainPath}/Views/web/index.blade.php";
        $adminViewPath = "{$domainPath}/Views/admin/index.blade.php";

        if (!File::exists($webViewPath)) {
            File::put($webViewPath, "<h1>{$name} Web Index</h1>");
            $this->info("Web view created: {$webViewPath}");
        }

        if (!File::exists($adminViewPath)) {
            File::put($adminViewPath, "<h1>{$name} Admin Index</h1>");
            $this->info("Admin view created: {$adminViewPath}");
        }
    }

    // ======================== Optional Classes (original features) ========================
    private function createOptionalClasses(string $domainPath, string $name, string $className): void
    {
        $generateAll = $this->option('all');

        if ($this->option('table') || $generateAll) {
            $this->createMigration($domainPath, $name);
        }

        if ($this->option('policy') || $generateAll) {
            $this->createPolicy($domainPath, $name, $className);
        }

        if ($this->option('repository') || $generateAll) {
            $this->createRepository($domainPath, $name, $className);
        }

        if ($this->option('livewire') || $generateAll) {
            $this->createLivewire($domainPath, $name, $className);
        }

        if ($this->option('request') || $generateAll) {
            $this->createWebRequest($domainPath, $name, $className);
        }
    }

    private function createMigration(string $domainPath, string $name): void
    {
        $table = Str::snake($name);
        $timestamp = now()->format('Y_m_d_His');
        $migrationPath = "{$domainPath}/Database/Migrations/{$timestamp}_create_{$table}_table.php";

        if (!File::exists($migrationPath)) {
            File::put($migrationPath, $this->getMigrationStub($table));
            $this->info("Migration created: {$migrationPath}");
        }
    }

    private function createPolicy(string $domainPath, string $name, string $className): void
    {
        $policyPath = "{$domainPath}/Policies/{$className}Policy.php";
        File::ensureDirectoryExists(dirname($policyPath));
        if (!File::exists($policyPath)) {
            File::put($policyPath, $this->getPolicyStub($name, $className));
            $this->info("Policy created: {$policyPath}");
        }
    }

    private function createRepository(string $domainPath, string $name, string $className): void
    {
        $repoPath = "{$domainPath}/Repositories/{$className}Repository.php";
        File::ensureDirectoryExists(dirname($repoPath));
        if (!File::exists($repoPath)) {
            File::put($repoPath, $this->getRepositoryStub($name, $className));
            $this->info("Repository created: {$repoPath}");
        }
    }

    private function createLivewire(string $domainPath, string $name, string $className): void
    {
        $livewirePath = "{$domainPath}/Livewire/{$className}Index.php";
        File::ensureDirectoryExists(dirname($livewirePath));
        if (!File::exists($livewirePath)) {
            File::put($livewirePath, $this->getLivewireStub($name, $className));
            $this->info("Livewire component created: {$livewirePath}");
        }

        $viewDir = "{$domainPath}/Views/livewire";
        File::ensureDirectoryExists($viewDir);
        $bladeFile = "{$viewDir}/" . Str::kebab($className) . "-index.blade.php";
        if (!File::exists($bladeFile)) {
            File::put($bladeFile, "<div>\n    <h1>{$name} Livewire Component</h1>\n</div>");
            $this->info("Livewire view created: {$bladeFile}");
        }
    }

    private function createWebRequest(string $domainPath, string $name, string $className): void
    {
        $requestPath = "{$domainPath}/Requests/{$className}Request.php";
        File::ensureDirectoryExists(dirname($requestPath));
        if (!File::exists($requestPath)) {
            File::put($requestPath, $this->getWebRequestStub($name, $className));
            $this->info("Web request created: {$requestPath}");
        }
    }

    // ======================== API Structure ========================
    private function createApiStructure(string $domainPath, string $name, string $className, string $apiVersion): void
    {
        $this->createApiController($domainPath, $name, $className, $apiVersion);
        $this->createApiRequest($domainPath, $name, $className);
        $this->createDto($domainPath, $name, $className);
        $this->createResource($domainPath, $name, $className);
        $this->createActions($domainPath, $name, $className);
    }

    private function createApiController(string $domainPath, string $name, string $className, string $apiVersion): void
    {
        $controllerPath = "{$domainPath}/Controllers/Api/{$apiVersion}/{$className}Controller.php";
        if (!File::exists($controllerPath)) {
            File::put($controllerPath, $this->getApiControllerStub($name, $className, $apiVersion));
            $this->info("API Controller created: {$controllerPath}");
        }
    }

    private function createApiRequest(string $domainPath, string $name, string $className): void
    {
        $requestPath = "{$domainPath}/Requests/Api/{$className}Request.php";
        if (!File::exists($requestPath)) {
            File::put($requestPath, $this->getApiRequestStub($name, $className));
            $this->info("API Request created: {$requestPath}");
        }
    }

    private function createDto(string $domainPath, string $name, string $className): void
    {
        $dtoPath = "{$domainPath}/DTOs/{$className}DTO.php";
        if (!File::exists($dtoPath) || $this->option('dto')) {
            File::put($dtoPath, $this->getDtoStub($name, $className));
            $this->info("DTO created: {$dtoPath}");
        }
    }

    private function createResource(string $domainPath, string $name, string $className): void
    {
        $resourcePath = "{$domainPath}/Resources/{$className}Resource.php";
        if (!File::exists($resourcePath) || $this->option('resource')) {
            File::put($resourcePath, $this->getResourceStub($name, $className));
            $this->info("API Resource created: {$resourcePath}");
        }
    }

    private function createActions(string $domainPath, string $name, string $className): void
    {
        $actions = ['Create', 'Update', 'Delete', 'GetAll', 'GetOne'];
        foreach ($actions as $action) {
            $actionPath = "{$domainPath}/Actions/{$action}{$className}Action.php";
            if (!File::exists($actionPath) || $this->option('action')) {
                File::put($actionPath, $this->getActionStub($name, $className, $action));
                $this->info("Action created: {$actionPath}");
            }
        }
    }

    // ======================== Stubs ========================
    protected function getModelStub(string $name, string $className): string
    {
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\Models;

        use Illuminate\\Database\\Eloquent\\Model;

        class {$className} extends Model
        {
            protected \$guarded = [];

            protected \$casts = [
                'id' => 'int',
            ];
        }
        PHP;
    }

    protected function getControllerStub(string $name, string $className, string $type): string
    {
        $viewNamespace = strtolower($name) . '::' . strtolower($type) . '.index';
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\Controllers\\{$type};

        use App\\Http\\Controllers\\Controller;

        class {$className}Controller extends Controller
        {
            public function index()
            {
                return view('{$viewNamespace}');
            }
        }
        PHP;
    }

    protected function getMigrationStub(string $table): string
    {
        return <<<PHP
        <?php

        declare(strict_types=1);

        use Illuminate\\Database\\Migrations\\Migration;
        use Illuminate\\Database\\Schema\\Blueprint;
        use Illuminate\\Support\\Facades\\Schema;

        return new class extends Migration
        {
            public function up(): void
            {
                Schema::create('{$table}', function (Blueprint \$table) {
                    \$table->id();
                    \$table->string('name');
                    \$table->timestamps();
                });
            }

            public function down(): void
            {
                Schema::dropIfExists('{$table}');
            }
        };
        PHP;
    }

    protected function getPolicyStub(string $name, string $className): string
    {
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\Policies;

        use App\\Models\\User;
        use App\\Domains\\{$name}\\Models\\{$className};

        class {$className}Policy
        {
            public function view(User \$user, {$className} \$model): bool
            {
                return true;
            }

            public function create(User \$user): bool
            {
                return true;
            }

            public function update(User \$user, {$className} \$model): bool
            {
                return true;
            }

            public function delete(User \$user, {$className} \$model): bool
            {
                return true;
            }
        }
        PHP;
    }

    protected function getRepositoryStub(string $name, string $className): string
    {
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\Repositories;

        use App\\Domains\\{$name}\\Models\\{$className};
        use Illuminate\\Support\\Collection;

        class {$className}Repository
        {
            public function all(): Collection
            {
                return {$className}::all();
            }

            public function find(int \$id): ?{$className}
            {
                return {$className}::find(\$id);
            }

            public function create(array \$data): {$className}
            {
                return {$className}::create(\$data);
            }

            public function update(int \$id, array \$data): {$className}
            {
                \$model = {$className}::findOrFail(\$id);
                \$model->update(\$data);
                return \$model;
            }

            public function delete(int \$id): ?bool
            {
                return {$className}::destroy(\$id);
            }
        }
        PHP;
    }

    protected function getWebRequestStub(string $name, string $className): string
    {
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\Requests;

        use Illuminate\\Foundation\\Http\\FormRequest;

        class {$className}Request extends FormRequest
        {
            public function authorize(): bool
            {
                return true;
            }

            public function rules(): array
            {
                return [
                    'name' => 'required|string|max:255',
                ];
            }
        }
        PHP;
    }

    protected function getLivewireStub(string $name, string $className): string
    {
        $kebab = Str::kebab($className);
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\Livewire;

        use Livewire\\Component;

        class {$className}Index extends Component
        {
            public function render()
            {
                return view('domains.{$name}.livewire.{$kebab}-index');
            }
        }
        PHP;
    }

    // API Stubs
    protected function getApiControllerStub(string $name, string $className, string $apiVersion): string
    {
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\Controllers\\Api\\{$apiVersion};

        use App\\Domains\\{$name}\\Actions\\Create{$className}Action;
        use App\\Domains\\{$name}\\Actions\\Delete{$className}Action;
        use App\\Domains\\{$name}\\Actions\\GetAll{$className}Action;
        use App\\Domains\\{$name}\\Actions\\GetOne{$className}Action;
        use App\\Domains\\{$name}\\Actions\\Update{$className}Action;
        use App\\Domains\\{$name}\\DTOs\\{$className}DTO;
        use App\\Domains\\{$name}\\Requests\\Api\\{$className}Request;
        use App\\Domains\\{$name}\\Resources\\{$className}Resource;
        use Illuminate\\Http\\JsonResponse;

        class {$className}Controller
        {
            public function index(GetAll{$className}Action \$action): JsonResponse
            {
                \$models = \$action->execute();
                return response()->json({$className}Resource::collection(\$models));
            }

            public function show(int \$id, GetOne{$className}Action \$action): JsonResponse
            {
                \$model = \$action->execute(\$id);
                return response()->json(new {$className}Resource(\$model));
            }

            public function store({$className}Request \$request, Create{$className}Action \$action): JsonResponse
            {
                \$dto = {$className}DTO::fromRequest(\$request);
                \$model = \$action->execute(\$dto);
                return response()->json(new {$className}Resource(\$model), 201);
            }

            public function update({$className}Request \$request, int \$id, Update{$className}Action \$action): JsonResponse
            {
                \$dto = {$className}DTO::fromRequest(\$request);
                \$model = \$action->execute(\$id, \$dto);
                return response()->json(new {$className}Resource(\$model));
            }

            public function destroy(int \$id, Delete{$className}Action \$action): JsonResponse
            {
                \$action->execute(\$id);
                return response()->json(null, 204);
            }
        }
        PHP;
    }

    protected function getApiRequestStub(string $name, string $className): string
    {
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\Requests\\Api;

        use Illuminate\\Contracts\\Validation\\Validator;
        use Illuminate\\Foundation\\Http\\FormRequest;
        use Illuminate\\Http\\Exceptions\\HttpResponseException;
        use Illuminate\\Validation\\ValidationException;

        class {$className}Request extends FormRequest
        {
            public function authorize(): bool
            {
                return true;
            }

            public function rules(): array
            {
                return [
                    'name' => 'required|string|max:255',
                ];
            }

            protected function failedValidation(Validator \$validator): void
            {
                \$errors = (new ValidationException(\$validator))->errors();
                throw new HttpResponseException(
                    response()->json(['errors' => \$errors], 422)
                );
            }
        }
        PHP;
    }

    protected function getDtoStub(string $name, string $className): string
    {
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\DTOs;

        use App\\Domains\\{$name}\\Requests\\Api\\{$className}Request;

        class {$className}DTO
        {
            public function __construct(
                public readonly string \$name,
            ) {}

            public static function fromRequest({$className}Request \$request): self
            {
                return new self(
                    name: \$request->validated('name'),
                );
            }

            public function toArray(): array
            {
                return [
                    'name' => \$this->name,
                ];
            }
        }
        PHP;
    }

    protected function getResourceStub(string $name, string $className): string
    {
        return <<<PHP
        <?php

        declare(strict_types=1);

        namespace App\\Domains\\{$name}\\Resources;

        use App\\Domains\\{$name}\\Models\\{$className};
        use Illuminate\\Http\\Resources\\Json\\JsonResource;

        /**
         * @property {$className} \$resource
         */
        class {$className}Resource extends JsonResource
        {
            public function toArray(\$request): array
            {
                return [
                    'id' => \$this->resource->id,
                    'name' => \$this->resource->name,
                    'created_at' => \$this->resource->created_at?->toISOString(),
                    'updated_at' => \$this->resource->updated_at?->toISOString(),
                ];
            }
        }
        PHP;
    }

    protected function getActionStub(string $name, string $className, string $actionType): string
    {
        $modelClass = "App\\Domains\\{$name}\\Models\\{$className}";
        $dtoClass = "App\\Domains\\{$name}\\DTOs\\{$className}DTO";
        $repoClass = "App\\Domains\\{$name}\\Repositories\\{$className}Repository";

        switch ($actionType) {
            case 'Create':
                return <<<PHP
                <?php

                declare(strict_types=1);

                namespace App\\Domains\\{$name}\\Actions;

                use App\\Domains\\{$name}\\DTOs\\{$className}DTO;
                use App\\Domains\\{$name}\\Models\\{$className};
                use App\\Domains\\{$name}\\Repositories\\{$className}Repository;

                class Create{$className}Action
                {
                    public function __construct(
                        private {$className}Repository \$repository
                    ) {}

                    public function execute({$className}DTO \$dto): {$className}
                    {
                        return \$this->repository->create(\$dto->toArray());
                    }
                }
                PHP;
            case 'Update':
                return <<<PHP
                <?php

                declare(strict_types=1);

                namespace App\\Domains\\{$name}\\Actions;

                use App\\Domains\\{$name}\\DTOs\\{$className}DTO;
                use App\\Domains\\{$name}\\Models\\{$className};
                use App\\Domains\\{$name}\\Repositories\\{$className}Repository;

                class Update{$className}Action
                {
                    public function __construct(
                        private {$className}Repository \$repository
                    ) {}

                    public function execute(int \$id, {$className}DTO \$dto): {$className}
                    {
                        return \$this->repository->update(\$id, \$dto->toArray());
                    }
                }
                PHP;
            case 'Delete':
                return <<<PHP
                <?php

                declare(strict_types=1);

                namespace App\\Domains\\{$name}\\Actions;

                use App\\Domains\\{$name}\\Repositories\\{$className}Repository;

                class Delete{$className}Action
                {
                    public function __construct(
                        private {$className}Repository \$repository
                    ) {}

                    public function execute(int \$id): void
                    {
                        \$this->repository->delete(\$id);
                    }
                }
                PHP;
            case 'GetAll':
                return <<<PHP
                <?php

                declare(strict_types=1);

                namespace App\\Domains\\{$name}\\Actions;

                use App\\Domains\\{$name}\\Models\\{$className};
                use App\\Domains\\{$name}\\Repositories\\{$className}Repository;
                use Illuminate\\Support\\Collection;

                class GetAll{$className}Action
                {
                    public function __construct(
                        private {$className}Repository \$repository
                    ) {}

                    public function execute(): Collection
                    {
                        return \$this->repository->all();
                    }
                }
                PHP;
            case 'GetOne':
                return <<<PHP
                <?php

                declare(strict_types=1);

                namespace App\\Domains\\{$name}\\Actions;

                use App\\Domains\\{$name}\\Models\\{$className};
                use App\\Domains\\{$name}\\Repositories\\{$className}Repository;

                class GetOne{$className}Action
                {
                    public function __construct(
                        private {$className}Repository \$repository
                    ) {}

                    public function execute(int \$id): {$className}
                    {
                        return \$this->repository->find(\$id);
                    }
                }
                PHP;
            default:
                return '';
        }
    }
}