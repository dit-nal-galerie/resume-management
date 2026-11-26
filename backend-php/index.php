<?php

// Lokaler Entwicklungslauf (Docroot = backend-php/, z. B. MAMP/XAMPP):
// dient nur als Einstieg und leitet an den Front Controller in public/ weiter.
// Produktiv (Docker/Render) ist das Docroot backend-php/public, diese Datei
// wird dort nie ausgeliefert.
require __DIR__ . '/public/index.php';
