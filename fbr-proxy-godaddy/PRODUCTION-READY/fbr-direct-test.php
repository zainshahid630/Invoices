<?php
/**
 * FBR Direct API Test
 * 
 * This page directly calls FBR API with your invoice data
 * Upload to: https://zazteck.com/fbr-api/fbr-direct-test.php
 */

// FBR Configuration
$FBR_TOKEN = '07de2afc-caed-3215-900b-b01720619ca4';

// Try both sandbox and production URLs
$FBR_URLS = [
    'validate_sb' => 'https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb',
    'post_sb' => 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb',
    'validate_prod' => 'https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata',
    'post_prod' => 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata'
];

$FBR_URL_VALIDATE = $FBR_URLS['validate_sb'];
$FBR_URL_POST = $FBR_URLS['post_sb'];

// Test Scenarios - Switch between them by changing $selectedScenario
$selectedScenario = 'SN004'; // Change to 'SN003' or 'SN004'

$scenarios = [
    'SN003' => [
        "scenarioId" => "SN003",
        "items" => [
            [
                "hsCode" => "7214.1010",
                "productDescription" => "",
                "rate" => "18%",
                "uoM" => "MT",
                "quantity" => 1,
                "totalValues" => 0,
                "valueSalesExcludingST" => 205000,
                "fixedNotifiedValueOrRetailPrice" => 0,
                "salesTaxApplicable" => 36900,
                "salesTaxWithheldAtSource" => 0,
                "extraTax" => 0,
                "furtherTax" => 0,
                "sroScheduleNo" => "",
                "fedPayable" => 0,
                "discount" => 0,
                "saleType" => "Steel melting and re-rolling",
                "sroItemSerialNo" => ""
            ]
        ]
    ],
    'SN004' => [
        "scenarioId" => "SN004",
        "items" => [
            [
                "hsCode" => "7204.4910",
                "productDescription" => "",
                "rate" => "18%",
                "uoM" => "MT",
                "quantity" => 1,
                "totalValues" => 0,
                "valueSalesExcludingST" => 175000,
                "salesTaxApplicable" => 31500,
                "fixedNotifiedValueOrRetailPrice" => 0,
                "salesTaxWithheldAtSource" => 0,
                "extraTax" => 0,
                "furtherTax" => 0,
                "sroScheduleNo" => "",
                "fedPayable" => 0,
                "discount" => 0,
                "saleType" => "Ship breaking",
                "sroItemSerialNo" => ""
            ]
        ]
    ]
];

// Invoice Data
$invoiceData = [
    "invoiceType" => "Sale Invoice",
    "invoiceDate" => date('Y-m-d'), // Today's date
    "sellerNTNCNIC" => "5419764",
    "sellerBusinessName" => "IBRAHIM STAINLESS STELL PIPE INDUSTRY",
    "sellerProvince" => "Punjab",
    "sellerAddress" => "23-BRANDRETH ROAD",
    "buyerNTNCNIC" => "3710505701479",
    "buyerBusinessName" => "FERTILIZER MANUFAC IRS NEW",
    "buyerProvince" => "Sindh",
    "buyerAddress" => "Karachi",
    "invoiceRefNo" => "INV-" . time() . "-" . rand(100, 999),
    "scenarioId" => $scenarios[$selectedScenario]['scenarioId'],
    "buyerRegistrationType" => "Unregistered",
    "items" => $scenarios[$selectedScenario]['items']
];

// Handle form submission
$result = null;
$error = null;
$endpoint = 'validate';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $endpoint = $_POST['endpoint'] ?? 'validate';
    $fbrUrl = ($endpoint === 'post') ? $FBR_URL_POST : $FBR_URL_VALIDATE;
    
    // Call FBR API
    $ch = curl_init($fbrUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($invoiceData),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $FBR_TOKEN
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    $curlInfo = curl_getinfo($ch);
    curl_close($ch);
    
    if ($curlError) {
        $error = "cURL Error: " . $curlError;
    } else {
        $decodedResponse = json_decode($response, true);
        
        $result = [
            'http_code' => $httpCode,
            'response' => $decodedResponse ?? $response,
            'raw_response' => $response,
            'response_length' => strlen($response),
            'curl_info' => [
                'url' => $curlInfo['url'],
                'content_type' => $curlInfo['content_type'],
                'total_time' => $curlInfo['total_time']
            ]
        ];
        
        // If response is empty
        if (empty($response)) {
            $error = "FBR returned empty response. This might mean:\n" .
                     "1. Token is invalid or expired\n" .
                     "2. IP is not whitelisted with FBR\n" .
                     "3. FBR API is down\n" .
                     "4. Request format is incorrect";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FBR Direct API Test - Zazteck</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
        .content { padding: 30px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #e0e0e0;
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #555; }
        .value { color: #333; font-family: monospace; }
        .btn-group {
            display: flex;
            gap: 15px;
            margin: 30px 0;
        }
        .btn {
            flex: 1;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-validate {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-post {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .response {
            margin-top: 30px;
            padding: 20px;
            border-radius: 10px;
            display: <?php echo ($result || $error) ? 'block' : 'none'; ?>;
        }
        .response.success {
            background: #d4edda;
            border: 3px solid #28a745;
        }
        .response.error {
            background: #f8d7da;
            border: 3px solid #dc3545;
        }
        .response h3 {
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        .response pre {
            background: rgba(0,0,0,0.05);
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 13px;
            line-height: 1.6;
        }
        .badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }
        .badge-success { background: #28a745; color: white; }
        .badge-error { background: #dc3545; color: white; }
        .badge-info { background: #17a2b8; color: white; }
        .alert {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
            .btn-group { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 FBR Direct API Test</h1>
            <p>Zazteck - Direct FBR Integration Test</p>
            <p style="font-size: 0.9em; margin-top: 10px;">NTN: 5419764 | Seller: IBRAHIM STAINLESS STELL PIPE INDUSTRY</p>
        </div>
        
        <div class="content">
            <div class="alert">
                <strong>⚠️ Important:</strong> This page directly calls FBR API from your GoDaddy server using the whitelisted IP.
                Each test creates a unique invoice reference number.
            </div>

            <div class="grid">
                <!-- Seller Information -->
                <div class="section">
                    <h2>👤 Seller Information</h2>
                    <div class="info-row">
                        <span class="label">NTN:</span>
                        <span class="value"><?php echo $invoiceData['sellerNTNCNIC']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Business Name:</span>
                        <span class="value"><?php echo $invoiceData['sellerBusinessName']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Province:</span>
                        <span class="value"><?php echo $invoiceData['sellerProvince']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Address:</span>
                        <span class="value"><?php echo $invoiceData['sellerAddress']; ?></span>
                    </div>
                </div>

                <!-- Buyer Information -->
                <div class="section">
                    <h2>🏢 Buyer Information</h2>
                    <div class="info-row">
                        <span class="label">NTN:</span>
                        <span class="value"><?php echo $invoiceData['buyerNTNCNIC']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Business Name:</span>
                        <span class="value"><?php echo $invoiceData['buyerBusinessName']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Province:</span>
                        <span class="value"><?php echo $invoiceData['buyerProvince']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Registration:</span>
                        <span class="value"><?php echo $invoiceData['buyerRegistrationType']; ?></span>
                    </div>
                </div>

                <!-- Invoice Details -->
                <div class="section">
                    <h2>📄 Invoice Details</h2>
                    <div class="info-row">
                        <span class="label">Type:</span>
                        <span class="value"><?php echo $invoiceData['invoiceType']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Date:</span>
                        <span class="value"><?php echo $invoiceData['invoiceDate']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Ref No:</span>
                        <span class="value"><?php echo $invoiceData['invoiceRefNo']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Scenario:</span>
                        <span class="value"><?php echo $invoiceData['scenarioId']; ?></span>
                    </div>
                </div>

                <!-- Item Details -->
                <div class="section">
                    <h2>📦 Item Details</h2>
                    <?php $item = $invoiceData['items'][0]; ?>
                    <div class="info-row">
                        <span class="label">HS Code:</span>
                        <span class="value"><?php echo $item['hsCode']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Sale Type:</span>
                        <span class="value"><?php echo $item['saleType']; ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Value (Excl. ST):</span>
                        <span class="value">Rs. <?php echo number_format($item['valueSalesExcludingST']); ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Sales Tax:</span>
                        <span class="value">Rs. <?php echo number_format($item['salesTaxApplicable']); ?></span>
                    </div>
                    <div class="info-row">
                        <span class="label">Rate:</span>
                        <span class="value"><?php echo $item['rate']; ?></span>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <form method="POST">
                <div class="btn-group">
                    <button type="submit" name="endpoint" value="validate" class="btn btn-validate">
                        ✓ Validate Invoice
                    </button>
                    <button type="submit" name="endpoint" value="post" class="btn btn-post">
                        📤 Post Invoice to FBR
                    </button>
                </div>
            </form>

            <!-- Response Section -->
            <?php if ($result): ?>
                <div class="response success">
                    <h3>
                        <?php if ($result['http_code'] == 200): ?>
                            ✅ Success!
                            <span class="badge badge-success">HTTP <?php echo $result['http_code']; ?></span>
                        <?php else: ?>
                            ⚠️ Response Received
                            <span class="badge badge-info">HTTP <?php echo $result['http_code']; ?></span>
                        <?php endif; ?>
                    </h3>
                    <p><strong>Endpoint:</strong> <?php echo strtoupper($endpoint); ?></p>
                    <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
                    
                    <?php if (isset($result['response']['invoiceNumber'])): ?>
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <h4 style="color: #28a745; margin-bottom: 10px;">📋 Invoice Number Generated:</h4>
                            <p style="font-size: 1.5em; font-weight: bold; color: #667eea; font-family: monospace;">
                                <?php echo $result['response']['invoiceNumber']; ?>
                            </p>
                        </div>
                    <?php endif; ?>
                    
                    <h4 style="margin-top: 20px; margin-bottom: 10px;">Full Response:</h4>
                    <pre><?php echo json_encode($result['response'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); ?></pre>
                    
                    <h4 style="margin-top: 20px; margin-bottom: 10px;">Debug Info:</h4>
                    <pre><?php 
                        echo "Response Length: " . $result['response_length'] . " bytes\n";
                        echo "Raw Response: " . ($result['raw_response'] ?: '(empty)') . "\n\n";
                        echo "cURL Info:\n";
                        echo json_encode($result['curl_info'], JSON_PRETTY_PRINT);
                    ?></pre>
                </div>
            <?php elseif ($error): ?>
                <div class="response error">
                    <h3>❌ Error <span class="badge badge-error">Failed</span></h3>
                    <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
                    <pre><?php echo htmlspecialchars($error); ?></pre>
                </div>
            <?php endif; ?>

            <!-- JSON Preview -->
            <div class="section" style="margin-top: 30px;">
                <h2>📋 Request JSON Preview</h2>
                <pre><?php echo json_encode($invoiceData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); ?></pre>
            </div>

            <!-- API Info -->
            <div class="section" style="margin-top: 20px;">
                <h2>🔧 API Configuration</h2>
                <div class="info-row">
                    <span class="label">Validate URL:</span>
                    <span class="value" style="font-size: 11px;"><?php echo $FBR_URL_VALIDATE; ?></span>
                </div>
                <div class="info-row">
                    <span class="label">Post URL:</span>
                    <span class="value" style="font-size: 11px;"><?php echo $FBR_URL_POST; ?></span>
                </div>
                <div class="info-row">
                    <span class="label">Token:</span>
                    <span class="value"><?php echo substr($FBR_TOKEN, 0, 20); ?>...</span>
                </div>
                <div class="info-row">
                    <span class="label">Server IP:</span>
                    <span class="value"><?php echo $_SERVER['SERVER_ADDR'] ?? 'Unknown'; ?></span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
