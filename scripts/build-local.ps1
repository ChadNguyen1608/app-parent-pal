# Build APK trên máy (không qua EAS). Dùng:
#   powershell -File scripts/build-local.ps1                      # build cả app phụ huynh và app con (apps/mobile)
#   powershell -File scripts/build-local.ps1 -Variant parent      # chỉ app phụ huynh
#   powershell -File scripts/build-local.ps1 -Variant child       # chỉ app con
#   powershell -File scripts/build-local.ps1 -Src mobile -Variant none   # app Plan A cũ (tạm dừng, D-31)
# Kết quả: C:\p-out\parentbestpal-<variant>.apk (ký bằng khóa debug: cài đè được bản local trước, không đè được bản EAS).
#
# Vì sao sao chép sang C:\p: Windows giới hạn tạo thư mục 248 ký tự; đường dẫn build C++ của các thư viện
# (gesture-handler, reanimated) trong F:\03.Project\app-parent-pal\... vượt giới hạn. Ổ ảo subst không đủ vì Node trả
# đường dẫn thật. Nên sao chép dự án sang C:\p và đặt thư mục build C++ ở C:\c.
# Cần: JDK 17 (Adoptium), Android SDK (NDK 27, CMake 3.22).
# apps/mobile cần file .env (sao từ .env.example; KHÔNG commit). key\google-services.json là tùy chọn (chỉ cần cho đẩy FCM).
param(
  [string]$Src = 'apps/mobile',
  [ValidateSet('both', 'parent', 'child', 'none')]
  [string]$Variant = 'both',
  [string]$Work = 'C:\p',
  [string]$Out = 'C:\p-out',
  [string]$Archs = 'arm64-v8a,x86_64'
)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Src = (Resolve-Path (Join-Path $repo $Src)).Path

$env:JAVA_HOME = (Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory | Select-Object -First 1).FullName
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NODE_ENV = 'production'

if ($Variant -ne 'none' -and -not (Test-Path (Join-Path $Src '.env'))) {
  throw "Thiếu $Src\.env. Sao từ .env.example rồi điền EXPO_PUBLIC_SUPABASE_URL và EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
}
if (-not (Test-Path (Join-Path $Src 'node_modules'))) {
  Write-Host "Chưa có node_modules, chạy npm ci trong $Src"
  Push-Location $Src; npm ci; if ($LASTEXITCODE -ne 0) { throw 'npm ci lỗi' }; Pop-Location
}

$keyPath = Join-Path $repo 'key\google-services.json'
$hasKey = Test-Path $keyPath
New-Item -ItemType Directory -Force $Out | Out-Null

function Build-One([string]$v) {
  Write-Host "=== Build biến thể: $v ==="
  # 1. Sao chép (chỉ loại thư mục android ở gốc; không được loại mọi thư mục tên android vì node_modules cần chúng)
  New-Item -ItemType Directory -Force $Work | Out-Null
  robocopy $Src $Work /E /XD "$Src\android" "$Src\.gradle" "$Src\test-reports" /NFL /NDL /NJH /NJS /NP | Out-Null
  # Chỉ dùng google-services.json nếu có client đúng tên gói của biến thể; file của app cũ (vn.parentpal.app) làm Gradle lỗi.
  $pkg = if ($v -eq 'none') { 'vn.parentpal.app' } else { "vn.parentbestpal.$v" }
  $useKey = $hasKey -and ((Get-Content $keyPath -Raw) -match ('"package_name"\s*:\s*"' + [regex]::Escape($pkg) + '"'))
  if ($useKey) {
    Copy-Item $keyPath "$Work\google-services.json" -Force
    $env:GOOGLE_SERVICES_JSON = "$Work\google-services.json"
  } else {
    Remove-Item Env:GOOGLE_SERVICES_JSON -ErrorAction SilentlyContinue
    Write-Host "Không có key\google-services.json cho gói ${pkg}: build không có đẩy FCM (nấc 1 chưa cần)."
  }
  if ($v -ne 'none') { $env:APP_VARIANT = $v } else { Remove-Item Env:APP_VARIANT -ErrorAction SilentlyContinue }

  # 2. Sinh dự án Android (--clean xóa android/ cũ, nên hai biến thể không lẫn nhau) và đặt thư mục build C++ ngắn
  Set-Location $Work
  npx expo prebuild --platform android --clean --no-install
  if ($LASTEXITCODE -ne 0) { throw "expo prebuild lỗi (mã $LASTEXITCODE)" }
  $gradle = "$Work\android\app\build.gradle"
  $t = Get-Content $gradle -Raw
  $t = $t -replace '(?m)^android \{', "android {`n    externalNativeBuild {`n        cmake {`n            buildStagingDirectory file('C:/c')`n        }`n    }"
  Set-Content $gradle $t -NoNewline
  $props = "$Work\android\gradle.properties"
  (Get-Content $props) -replace 'org.gradle.jvmargs=.*', 'org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=768m' | Set-Content $props

  # 3. Build. JVM của Gradle thỉnh thoảng sập ngẫu nhiên: thử lại 1 lần.
  Set-Location "$Work\android"
  .\gradlew.bat assembleRelease "-PreactNativeArchitectures=$Archs" --no-daemon --console=plain
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Gradle lỗi, thử lại một lần...'
    .\gradlew.bat assembleRelease "-PreactNativeArchitectures=$Archs" --no-daemon --console=plain
    if ($LASTEXITCODE -ne 0) { throw "Gradle lỗi (mã $LASTEXITCODE)" }
  }
  $name = if ($v -eq 'none') { 'plan-a' } else { $v }
  $dst = Join-Path $Out "parentbestpal-$name.apk"
  Copy-Item "$Work\android\app\build\outputs\apk\release\app-release.apk" $dst -Force
  "APK: $dst"
  Set-Location $repo
}

$list = if ($Variant -eq 'both') { @('parent', 'child') } else { @($Variant) }
foreach ($v in $list) { Build-One $v }
