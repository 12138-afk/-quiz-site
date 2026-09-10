$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$localUrl = 'http://127.0.0.1:3000'
$nodePath = (Get-Command node -ErrorAction Stop).Source
$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    $logDir = Join-Path $PSScriptRoot '.local-server'
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    $env:WRANGLER_SEND_METRICS = 'false'
    Start-Process -FilePath $nodePath -ArgumentList 'node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --ip 0.0.0.0 --port 3000 --local' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDir 'output.log') -RedirectStandardError (Join-Path $logDir 'error.log') | Out-Null
}
for ($attempt=0; $attempt -lt 30; $attempt++) {
    try {
        $response = Invoke-WebRequest -Uri $localUrl -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            if ($response.Content -notmatch '目标智能') { throw 'Port 3000 is used by another website.' }
            Start-Process $localUrl
            exit 0
        }
    } catch { Start-Sleep -Seconds 1 }
}
throw 'Website did not start. Check .local-server/output.log and error.log, or whether port 3000 is occupied.'
