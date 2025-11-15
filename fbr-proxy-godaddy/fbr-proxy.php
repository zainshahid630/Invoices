<?php
/**
 * FBR API Proxy for GoDaddy Shared Hosting
 * 
 * This proxy forwards FBR API requests from your Next.js app
 * Uses GoDaddy's whitelisted IP to call FBR
 * 
 * Upload this file to your GoDaddy hosting
 * URL: https://yourdomain.com/fbr-proxy.php
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Set to 0 in production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/fbr-proxy-errors.log');

// CORS Headers - Allow your Next.js app to call this proxy
header('Access-Control-Allow-Origin: *'); // Change * to your domain in production
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Security: API Key validation (optional but recommended)
$VALID_API_KEY = 'your-secret-api-key-here'; // Change this!
$providedKey = $_SERVER['HTTP_X_API_KEY'] ?? '';

if ($providedKey !== $VALID_API_KEY) {
    http_response_code(401);
    echo json_encode([
        'error' => 'Unauthorized',
        'message' => 'Invalid API key'
    ]);
    exit();
}

// Get request data
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestBody = file_get_contents('php://input');
$requestData = json_decode($requestBody, true);

// Validate request
if (!$requestData) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Bad Request',
        'message' => 'Invalid JSON data'
    ]);
    exit();
}

// Get FBR endpoint and token from request
$endpoint = $requestData['endpoint'] ?? 'validate'; // 'validate' or 'post'
$fbrToken = $requestData['token'] ?? '';
$invoiceData = $requestData['data'] ?? null;

if (!$fbrToken || !$invoiceData) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Bad Request',
        'message' => 'Missing token or data'
    ]);
    exit();
}

// FBR API URLs
$fbrUrls = [
    'validate' => 'https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb',
    'post' => 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb',
    'validate_prod' => 'https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata',
    'post_prod' => 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata'
];

$fbrUrl = $fbrUrls[$endpoint] ?? $fbrUrls['validate'];

// Prepare cURL request to FBR
$ch = curl_init($fbrUrl);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($invoiceData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $fbrToken
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2
]);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);

// Handle errors
if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'error' => 'FBR API Error',
        'message' => $curlError
    ]);
    exit();
}

// Return FBR response
http_response_code($httpCode);
echo $response;

// Log request (optional - for debugging)
$logEntry = [
    'timestamp' => date('Y-m-d H:i:s'),
    'endpoint' => $endpoint,
    'http_code' => $httpCode,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];
file_put_contents(
    __DIR__ . '/fbr-proxy-log.txt',
    json_encode($logEntry) . "\n",
    FILE_APPEND
);
?>
