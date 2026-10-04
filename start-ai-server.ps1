$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$python = 'C:/Users/ikrom/AppData/Local/Programs/Python/Python312/python.exe'
$logPath = Join-Path $root 'ai_server.log'
$errPath = Join-Path $root 'ai_server.err'

if (-not (Test-Path $python)) {
    throw "Python not found at: $python"
}

$existingServers = Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -match '(?:^|\s)-m\s+ai\.model_server(?:\s|$)'
}
foreach ($existingServer in $existingServers) {
    Stop-Process -Id $existingServer.ProcessId -Force -ErrorAction SilentlyContinue
}

Start-Process -FilePath $python -ArgumentList @('-m', 'ai.model_server') -WorkingDirectory $root -RedirectStandardOutput $logPath -RedirectStandardError $errPath -WindowStyle Hidden

Write-Host "AI server starting from: $root"
Write-Host "Log: $logPath"
Write-Host "If the model is ready, open http://127.0.0.1:8000"
