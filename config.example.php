<?php
declare(strict_types=1);

/**
 * Copy this file to config.local.php on WebZim and fill in the values.
 * config.local.php is ignored by Git and must never be committed.
 */
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'cpaneluser_creativewing',
        'user' => 'cpaneluser_creativewing',
        'pass' => 'CHANGE_ME',
        'charset' => 'utf8mb4',
    ],
    'admin' => [
        'username' => 'owner',
        'email' => 'info@creativewinginvestments.co.zw',
        // Generate with: php -r "echo password_hash('YOUR_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"
        'password_hash' => 'CHANGE_ME_TO_A_PASSWORD_HASH',
    ],
    'session_hours' => 8,
    'max_upload_bytes' => 10 * 1024 * 1024,
];
