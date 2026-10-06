<?php
declare(strict_types=1);

$root = dirname(__DIR__);
$configFile = $root . '/config.local.php';
if (!is_file($configFile)) { fwrite(STDERR, "Missing config.local.php\n"); exit(1); }
$config = require $configFile;
$db = $config['db'];
$pdo = new PDO(
    sprintf('mysql:host=%s;dbname=%s;charset=%s', $db['host'], $db['name'], $db['charset'] ?? 'utf8mb4'),
    $db['user'], $db['pass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false]
);
$schema = file_get_contents($root . '/database/schema.sql');
foreach (array_filter(array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $schema))) as $sql) $pdo->exec($sql);

function importItems(PDO $pdo, string $file, string $table): int {
    $items = json_decode((string)file_get_contents($file), true);
    if (!is_array($items)) throw new RuntimeException("Invalid JSON: $file");
    $stmt = $pdo->prepare("INSERT INTO {$table} (id, payload) VALUES (?, ?) ON DUPLICATE KEY UPDATE payload = VALUES(payload)");
    $count = 0;
    foreach ($items as $item) {
        if (!is_array($item) || empty($item['id'])) continue;
        $stmt->execute([(string)$item['id'], json_encode($item, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)]);
        $count++;
    }
    return $count;
}
$vehicles = importItems($pdo, $root . '/data/vehicles.json', 'vehicles');
$sportswear = importItems($pdo, $root . '/data/sportswear.json', 'sportswear');
$adminConfig = json_decode((string)file_get_contents($root . '/data/admin-config.json'), true);
$settings = is_array($adminConfig) && isset($adminConfig['settings']) ? $adminConfig['settings'] : [];
$stmt = $pdo->prepare('INSERT INTO settings (id, payload) VALUES (1, ?) ON DUPLICATE KEY UPDATE payload = VALUES(payload)');
$stmt->execute([json_encode($settings, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)]);
echo "Imported {$vehicles} vehicles, {$sportswear} sportswear items, and business settings.\n";
