<?php
/**
 * FBR API Proxy for Zazteck
 * Domain: https://zazteck.com
 * 
 * Upload this to: public_html/fbr-api/fbr-proxy.php
 * URL: https://zazteck.com/fbr-api/fbr-proxy.php
 */

// Security Configuration
define('API_KEY', 'zazteck-fbr-2025-secure-key-' . md5('zazteck.com')); // Change this!
define('ALLOWED_ORIGIN', 'https://zazteck.com');

// Error Logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/fbr-errors.log');

// CORS Headers
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Validate API Key
$providedKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
if ($providedKey !== API_KEY) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized', 'message' => 'Invalid API key']);
    exit();
}

// Get request data
$requestBody = file_get_contents('php://input');
$requestData = json_decode($requestBody, true);

if (!$requestData) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

// Extract parameters
$endpoint = $requestData['endpoint'] ?? 'validate';
$fbrToken = $requestData['token'] ?? '';
$invoiceData = $requestData['data'] ?? null;

// Validate required fields
if (!$fbrToken || !$invoiceData) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing token or data']);
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

// Call FBR API
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

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle errors
if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'FBR API Error', 'message' => $curlError]);
    
    // Log error
    error_log(date('Y-m-d H:i:s') . " - cURL Error: $curlError\n", 3, __DIR__ . '/fbr-errors.log');
    exit();
}

// Log successful request
$logEntry = sprintf(
    "[%s] %s - HTTP %d - IP: %s\n",
    date('Y-m-d H:i:s'),
    $endpoint,
    $httpCode,
    $_SERVER['REMOTE_ADDR'] ?? 'unknown'
);
file_put_contents(__DIR__ . '/fbr-requests.log', $logEntry, FILE_APPEND);

// Return FBR response
http_response_code($httpCode);
echo $response;
?>
