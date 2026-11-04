# Chạy test tự động trên emulator: cài APK, cấp quyền, chạy các luồng Maestro, thu log và ảnh màn hình.
# Dùng:  powershell -File scripts/test-loop.ps1 -Apk F:\path\app.apk
# Kết quả ở mobile/test-reports/<giờ>/ (không commit). Cần: JDK 17, Android SDK, AVD "pp-test", Maestro.
param(
  [Parameter(Mandatory = $true)][string]$Apk,
  [string]$Avd = 'pp-test',
  [string]$Flows = 'mobile/.maestro'
)
$ErrorActionPreference = 'Stop'
$pkg = 'vn.parentpal.app'
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = (Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory | Select-Object -First 1).FullName
$env:ANDROID_HOME = $sdk
$adb = "$sdk\platform-tools\adb.exe"
$maestro = (Get-Command maestro -ErrorAction SilentlyContinue).Source
if (-not $maestro) { $maestro = "$env:USERPROFILE\.maestro\bin\maestro.bat" }

$out = "mobile/test-reports/$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Force $out | Out-Null

# 1. Emulator
if (-not (& $adb devices | Select-String '\tdevice')) {
  Start-Process "$sdk\emulator\emulator.exe" -ArgumentList "-avd $Avd -no-snapshot -no-audio" -WindowStyle Minimized
  & $adb wait-for-device
  while ((& $adb shell getprop sys.boot_completed).Trim() -ne '1') { Start-Sleep 3 }
}

# 2. Cài APK và cấp quyền (hộp thoại quyền không test bằng Maestro; xem docs "test sau")
& $adb install -r $Apk | Out-Null
foreach ($p in 'POST_NOTIFICATIONS', 'CAMERA', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION') {
  & $adb shell pm grant $pkg "android.permission.$p" 2>$null
}
& $adb shell settings put secure location_mode 3 | Out-Null       # bật dịch vụ vị trí của emulator
& $adb emu geo fix 105.8342 21.0278 | Out-Null                     # vị trí giả, chỉ để nút 2 chạy được
& $adb logcat -c

# 3. Maestro
& $maestro test $Flows --format junit --output "$out/report.xml" --test-output-dir "$out/maestro"
$code = $LASTEXITCODE

# 4. Chẩn đoán
# cmd giữ nguyên byte (PowerShell 5 ghi UTF-16 làm hỏng ảnh PNG)
$outWin = (Resolve-Path $out).Path
cmd /c "`"$adb`" logcat -d -v time *:W > `"$outWin\logcat-warn.txt`""
cmd /c "`"$adb`" logcat -d -v time > `"$outWin\logcat-all.txt`""
cmd /c "`"$adb`" exec-out screencap -p > `"$outWin\man-hinh-cuoi.png`""

Write-Host "Kết quả: $out  (maestro exit $code)"
exit $code
