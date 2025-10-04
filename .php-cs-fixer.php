<?php

return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR12' => true, // Basis wie ESLint recommended
        'no_extra_blank_lines' => true, // max 1 Leerzeile wie no-multiple-empty-lines
        'blank_line_before_statement' => [
            // analog zu "padding-line-between-statements"
            'return' => true,
            'if' => true,
            'try' => true,
            'case' => true,
            'continue' => true,
            'declare' => true,
            'do' => true,
            'exit' => true,
            'for' => true,
            'foreach' => true,
            'switch' => true,
            'throw' => true,
            'while' => true,
        ],
    ])
    ->setFinder(
        PhpCsFixer\Finder::create()
            ->in(__DIR__ . '/backend-php') // nur PHP-Code hier
            ->name('*.php')
            ->ignoreDotFiles(true)
            ->ignoreVCS(true)
    );
