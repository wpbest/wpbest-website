# ---------------------------------------------------------
# test_gemini_api_key.ps1 - Test GEMINI_API_KEY with gemini-flash-lite-latest
# Sends a fixed prompt, prints clean generated text, and logs detailed debug info
# ---------------------------------------------------------

# Function to log messages with timestamp
function Log-Info($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $message"
}

# Load .env file
if (Test-Path ".env") {
    Log-Info ".env file found. Loading environment variables..."
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "Env:$name" -Value $value
            Log-Info "Set environment variable: $name=$value"
        }
    }
} else {
    Log-Info ".env file not found in current folder."
}

# Get the API key
$apiKey = $env:GEMINI_API_KEY
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Log-Info "❌ GEMINI_API_KEY not found in .env"
    exit
}
Log-Info "GEMINI_API_KEY loaded successfully."

# Fixed prompt
$fixedPrompt = "Hello Google Gemini Flash lite 1.5"
Log-Info "Using fixed prompt: $fixedPrompt"

# Prepare headers and body
$headers = @{
    "Content-Type" = "application/json"
    "x-goog-api-key" = $apiKey
}
Log-Info "Headers set: $(ConvertTo-Json $headers -Depth 3)"

$body = @{
    "contents" = @(
        @{
            "parts" = @(
                @{ "text" = $fixedPrompt }
            )
        }
    )
} 
$bodyJson = $body | ConvertTo-Json -Depth 10
Log-Info "Request body prepared: $bodyJson"

# Choose model and URI
$model = "models/gemini-flash-lite-latest"
$uri = "https://generativelanguage.googleapis.com/v1beta/$($model):generateContent?key=$apiKey"
Log-Info "Using model: $model"
Log-Info "Request URI: $uri"

# Send request and handle errors
try {
    Log-Info "Sending request to Gemini API..."
    $response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $bodyJson
    Log-Info "Request completed successfully."

    Write-Host "`n✅ Success! Generated text:" -ForegroundColor Green

    # Print all text parts cleanly
    if ($response.candidates) {
        foreach ($candidate in $response.candidates) {
            foreach ($part in $candidate.content.parts) {
                Write-Host $part.text
            }
        }
    } else {
        Write-Host ($response | ConvertTo-Json -Depth 10)
    }
}
catch {
    Log-Info "❌ ERROR DETAILS FROM GOOGLE"
    try {
        if ($_.Exception.Response -ne $null) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $rawText = $reader.ReadToEnd()
            Log-Info "Raw error text: $rawText"
            try {
                $jsonError = $rawText | ConvertFrom-Json
                Log-Info "Parsed JSON error: $(ConvertTo-Json $jsonError -Depth 10)"
            } catch {
                Log-Info "Error text is not JSON."
            }
        } else {
            Log-Info "No response stream. Message: $($_.Exception.Message)"
        }
    } catch {
        Log-Info "Error while reading error response: $($_.Exception.Message)"
    }
}