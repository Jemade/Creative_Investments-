<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

$root = dirname(__DIR__);
$configFile = $root . '/config.local.php';
if (!is_file($configFile)) {
    http_response_code(503);
    echo json_encode(['error' => 'Application is not configured.']);
    exit;
}
$config = require $configFile;

function respond(int $status, mixed $data): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) respond(400, ['error' => 'Invalid JSON body']);
    return $data;
}
function bearer(): string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(.+)$/i', $header, $m)) return trim($m[1]);
    return '';
}
function cleanId(string $prefix): string {
    return $prefix . strtoupper(bin2hex(random_bytes(5)));
}
function nowIso(): string { return gmdate('c'); }
function jsonEncode(array $value): string {
    $json = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) respond(500, ['error' => 'Could not encode data']);
    return $json;
}
function loadRows(PDO $pdo, string $table): array {
    $stmt = $pdo->query("SELECT payload FROM {$table} ORDER BY created_at DESC");
    $rows = [];
    foreach ($stmt as $row) {
        $item = json_decode($row['payload'], true);
        if (is_array($item)) $rows[] = $item;
    }
    return $rows;
}
function requireAuth(PDO $pdo): array {
    $token = bearer();
    if ($token === '') respond(401, ['error' => 'Unauthorized']);
    $hash = hash('sha256', $token);
    $stmt = $pdo->prepare('SELECT username, expires_at FROM admin_sessions WHERE token_hash = ? AND expires_at > UTC_TIMESTAMP()');
    $stmt->execute([$hash]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$session) respond(401, ['error' => 'Unauthorized']);
    return ['token_hash' => $hash, 'username' => $session['username']];
}
function findPayload(PDO $pdo, string $table, string $id): ?array {
    $stmt = $pdo->prepare("SELECT payload FROM {$table} WHERE id = ?");
    $stmt->execute([$id]);
    $raw = $stmt->fetchColumn();
    if ($raw === false) return null;
    $item = json_decode((string)$raw, true);
    return is_array($item) ? $item : null;
}

try {
    $db = $config['db'] ?? [];
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $db['host'] ?? 'localhost', $db['name'] ?? '', $db['charset'] ?? 'utf8mb4');
    $pdo = new PDO($dsn, $db['user'] ?? '', $db['pass'] ?? '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    error_log('Creative Wing DB connection error: ' . $e->getMessage());
    respond(503, ['error' => 'Database unavailable']);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$apiPos = strpos($uriPath, '/api/');
$path = $apiPos === false ? '/api' : substr($uriPath, $apiPos);
$path = rtrim($path, '/') ?: '/api';

try {
    if ($method === 'POST' && $path === '/api/auth/login') {
        $input = body();
        $username = trim((string)($input['username'] ?? ''));
        $password = (string)($input['password'] ?? '');
        $admin = $config['admin'] ?? [];
        $allowedUser = hash_equals((string)($admin['username'] ?? 'owner'), $username)
            || (($admin['email'] ?? '') !== '' && hash_equals((string)$admin['email'], $username));
        $hash = (string)($admin['password_hash'] ?? '');
        if (!$allowedUser || $hash === '' || $hash === 'CHANGE_ME_TO_A_PASSWORD_HASH' || !password_verify($password, $hash)) {
            respond(401, ['error' => 'Invalid username or password']);
        }
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $hours = max(1, min(72, (int)($config['session_hours'] ?? 8)));
        $pdo->exec('DELETE FROM admin_sessions WHERE expires_at <= UTC_TIMESTAMP()');
        $stmt = $pdo->prepare('INSERT INTO admin_sessions (token_hash, username, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? HOUR))');
        $stmt->execute([$tokenHash, (string)$admin['username'], $hours]);
        respond(200, ['success' => true, 'token' => $token, 'user' => [
            'username' => (string)$admin['username'], 'displayName' => 'Owner Administration', 'role' => 'OWNER'
        ]]);
    }

    if ($method === 'GET' && $path === '/api/auth/verify') {
        $session = requireAuth($pdo);
        respond(200, ['authenticated' => true, 'user' => [
            'username' => $session['username'], 'displayName' => 'Owner Administration', 'role' => 'OWNER'
        ]]);
    }

    if ($method === 'POST' && $path === '/api/auth/logout') {
        $session = requireAuth($pdo);
        $stmt = $pdo->prepare('DELETE FROM admin_sessions WHERE token_hash = ?');
        $stmt->execute([$session['token_hash']]);
        respond(200, ['success' => true]);
    }

    if ($method === 'GET' && $path === '/api/inventory/vehicles') respond(200, loadRows($pdo, 'vehicles'));
    if ($method === 'GET' && $path === '/api/inventory/sportswear') respond(200, loadRows($pdo, 'sportswear'));

    if ($method === 'POST' && $path === '/api/inventory/vehicles') {
        requireAuth($pdo); $v = body();
        if (trim((string)($v['name'] ?? '')) === '' || !isset($v['price'])) respond(400, ['error' => 'Vehicle name and price are required']);
        $v['id'] = cleanId('C'); $v['price'] = (float)$v['price']; $v['currency'] = $v['currency'] ?? 'USD';
        $v['status'] = $v['status'] ?? 'Available'; $v['inStock'] = $v['status'] !== 'Sold';
        $v['createdAt'] = nowIso(); $v['updatedAt'] = $v['createdAt'];
        $stmt = $pdo->prepare('INSERT INTO vehicles (id, payload) VALUES (?, ?)');
        $stmt->execute([$v['id'], jsonEncode($v)]);
        respond(201, ['success' => true, 'vehicle' => $v]);
    }

    if ($method === 'POST' && $path === '/api/inventory/sportswear') {
        requireAuth($pdo); $p = body();
        if (trim((string)($p['name'] ?? '')) === '' || !isset($p['price'])) respond(400, ['error' => 'Sportswear product name and price are required']);
        $p['id'] = cleanId('S'); $p['price'] = (float)$p['price']; $p['currency'] = $p['currency'] ?? 'USD';
        $p['status'] = $p['status'] ?? 'Available'; $p['inStock'] = $p['status'] !== 'Unavailable';
        $p['createdAt'] = nowIso(); $p['updatedAt'] = $p['createdAt'];
        $stmt = $pdo->prepare('INSERT INTO sportswear (id, payload) VALUES (?, ?)');
        $stmt->execute([$p['id'], jsonEncode($p)]);
        respond(201, ['success' => true, 'product' => $p]);
    }

    if (preg_match('#^/api/inventory/(vehicles|sportswear)/([^/]+)$#', $path, $m)) {
        $kind = $m[1]; $id = rawurldecode($m[2]); $table = $kind === 'vehicles' ? 'vehicles' : 'sportswear';
        requireAuth($pdo);
        if ($method === 'PUT') {
            $current = findPayload($pdo, $table, $id);
            if (!$current) respond(404, ['error' => $kind === 'vehicles' ? 'Vehicle not found' : 'Sportswear product not found']);
            $input = body(); unset($input['id'], $input['createdAt']);
            $item = array_replace($current, $input); $item['id'] = $id; $item['updatedAt'] = nowIso();
            if (isset($item['price'])) $item['price'] = (float)$item['price'];
            if ($kind === 'vehicles') $item['inStock'] = ($item['status'] ?? 'Available') !== 'Sold';
            else $item['inStock'] = ($item['status'] ?? 'Available') !== 'Unavailable';
            $stmt = $pdo->prepare("UPDATE {$table} SET payload = ? WHERE id = ?");
            $stmt->execute([jsonEncode($item), $id]);
            respond(200, ['success' => true, $kind === 'vehicles' ? 'vehicle' : 'product' => $item]);
        }
        if ($method === 'DELETE') {
            $stmt = $pdo->prepare("DELETE FROM {$table} WHERE id = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() === 0) respond(404, ['error' => $kind === 'vehicles' ? 'Vehicle not found' : 'Sportswear product not found']);
            respond(200, ['success' => true, 'deletedId' => $id]);
        }
    }

    if ($method === 'POST' && $path === '/api/upload') {
        requireAuth($pdo); $input = body();
        $dataUrl = (string)($input['dataUrl'] ?? '');
        if (!preg_match('#^data:image/(png|jpeg|jpg|webp);base64,(.+)$#s', $dataUrl, $m)) respond(400, ['error' => 'Valid PNG, JPEG or WebP image required']);
        $binary = base64_decode($m[2], true);
        if ($binary === false) respond(400, ['error' => 'Invalid image data']);
        $max = (int)($config['max_upload_bytes'] ?? 10485760);
        if (strlen($binary) > $max) respond(413, ['error' => 'Image too large']);
        $finfo = new finfo(FILEINFO_MIME_TYPE); $mime = $finfo->buffer($binary);
        $extMap = ['image/png'=>'png','image/jpeg'=>'jpeg','image/webp'=>'webp'];
        if (!isset($extMap[$mime])) respond(400, ['error' => 'Unsupported image type']);
        $folder = ($input['folder'] ?? '') === 'sportswear' ? 'sportswear' : 'cars';
        $base = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)($input['filename'] ?? ''));
        if ($base === '') $base = 'upload_' . gmdate('Ymd_His') . '_' . bin2hex(random_bytes(3));
        $name = $base . '.' . $extMap[$mime];
        $dir = $root . '/images/' . $folder;
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) respond(500, ['error' => 'Upload directory unavailable']);
        if (file_put_contents($dir . '/' . $name, $binary, LOCK_EX) === false) respond(500, ['error' => 'Could not save image']);
        respond(200, ['success' => true, 'url' => 'images/' . $folder . '/' . $name]);
    }

    if ($method === 'GET' && $path === '/api/settings') {
        $raw = $pdo->query('SELECT payload FROM settings WHERE id = 1')->fetchColumn();
        respond(200, $raw === false ? [] : (json_decode((string)$raw, true) ?: []));
    }
    if ($method === 'PUT' && $path === '/api/settings') {
        requireAuth($pdo); $incoming = body();
        $raw = $pdo->query('SELECT payload FROM settings WHERE id = 1')->fetchColumn();
        $current = $raw === false ? [] : (json_decode((string)$raw, true) ?: []);
        $settings = array_replace($current, $incoming);
        $stmt = $pdo->prepare('INSERT INTO settings (id, payload) VALUES (1, ?) ON DUPLICATE KEY UPDATE payload = VALUES(payload)');
        $stmt->execute([jsonEncode($settings)]);
        respond(200, ['success' => true, 'settings' => $settings]);
    }

    respond(404, ['error' => 'API endpoint not found']);
} catch (Throwable $e) {
    error_log('Creative Wing API error: ' . $e->getMessage());
    respond(500, ['error' => 'Server error']);
}
