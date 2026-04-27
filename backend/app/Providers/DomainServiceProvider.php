<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\File;
use Livewire\Livewire;
use Illuminate\Support\Str;
use ReflectionClass;

class DomainServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $domainsPath = app_path('Domains');

        if (! File::exists($domainsPath)) {
            return;
        }

        foreach (File::directories($domainsPath) as $domainPath) {
            $domainName = basename($domainPath);

            // تحميل الـ routes
            if (File::exists("$domainPath/Routes/web.php")) {
                $this->loadRoutesFrom("$domainPath/Routes/web.php");
            }

            if (File::exists("$domainPath/Routes/api.php")) {
                $this->loadRoutesFrom("$domainPath/Routes/api.php");
            }

            if (File::exists("$domainPath/Routes/admin.php")) {
                $this->loadRoutesFrom("$domainPath/Routes/admin.php");
            }

            // تحميل الـ views
            if (File::isDirectory("$domainPath/Views")) {
                $this->loadViewsFrom("$domainPath/Views", strtolower($domainName));
            }

            // تحميل الـ migrations
            if (File::isDirectory("$domainPath/Database/Migrations")) {
                $this->loadMigrationsFrom("$domainPath/Database/Migrations");
            }

            // تسجيل Livewire Components
            $this->registerLivewireComponents($domainPath, $domainName);
        }
    }

    protected function registerLivewireComponents(string $domainPath, string $domainName): void
    {
        $namespace = "App\\Domains\\{$domainName}\\Livewire";
        $path = "$domainPath/Livewire";

        if (! File::isDirectory($path)) {
            return;
        }

        foreach (File::files($path) as $file) {
            $class = $namespace . '\\' . pathinfo($file, PATHINFO_FILENAME);

            if (class_exists($class)) {
                $short = (new ReflectionClass($class))->getShortName();
                $alias = Str::kebab($domainName) . '.' . Str::kebab($short);
                Livewire::component($alias, $class);
            }
        }
    }
}