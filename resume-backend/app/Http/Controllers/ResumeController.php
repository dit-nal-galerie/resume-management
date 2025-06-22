<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ResumeService;
use Illuminate\Support\Facades\Auth;

class ResumeController extends Controller
{
    protected $resumeService;

    public function __construct(ResumeService $resumeService)
    {
        $this->resumeService = $resumeService;
    }

    public function getResumesWithUsers(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $resumes = $this->resumeService->getResumesWithUsers($userId);
        return response()->json($resumes);
    }
}