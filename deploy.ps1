echo ">> Starting deployment"
$json = Get-Content -Raw 'config.json' | Out-String | ConvertFrom-Json
$remoteIP = $json.remoteIP
echo ">> Remote IP retrieved from config file"
scp -r .\\src\\ .\\config.json .\\tsconfig.json .\\package.json .\\package-lock.json .\\webpack.*.config.js root@${remoteIP}:/root/dev/td
echo ">> Deployment completed"
