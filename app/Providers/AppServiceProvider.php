<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Finance\ReceiptNumberService;
use App\Services\Finance\FeeService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(ReceiptNumberService::class);
        $this->app->singleton(FeeService::class);
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
