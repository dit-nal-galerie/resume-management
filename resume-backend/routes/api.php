<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ResumeController;

Route::middleware(['auth:api'])->group(function () {
    Route::get('/resumes', [ResumeController::class, 'getResumesWithUsers']);
});