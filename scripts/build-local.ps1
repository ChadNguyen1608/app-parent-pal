# Build APK trên máy (không tốn lượt EAS). Dùng:  powershell -File scripts/build-local.ps1
# Kết quả: C:\p\android\app\build\outputs\apk\release\app-release.apk (ký bằng khóa debug, khác khóa EAS: gỡ bản cũ trước khi cài).
#
# Vì sao sao chép sang C:\p: Windows giới hạn tạo thư mục 248 ký tự; đường dẫn build C++ của các thư viện
# (gesture-handler, reanimated) trong F:\03.Project\app-parent-pal\mobile vượt giới hạn. Ổ ảo subst không đủ vì Node trả
# đường dẫn thật. Nên sao chép dự án sang C:\p và đặt thư mục build C++ ở C:\c.
# Cần: JDK 17 (Adoptium), Android SDK (NDK 27, CMake 3.22), key\google-services.json (không có trong git).
param(
  [string]$Src = (Join-Path $PSScriptRoot '..\mobile'),
  [string]$Work = 'C:\p',
  [string]$Archs = 'arm64-v8a,x86_64'
)
$ErrorActionPreference = 'Stop'
$Src = (Resolve-Path $Src).Path
$keyFile = (Resolve-Path (Join-Path $Src '..\key\google-services.json')).Path

$env:JAVA_HOME = (Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory | Select-Object -First 1).FullName
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NODE_ENV = 'production'

# 1. Sao chép (chỉ loại thư mục android ở gốc; không được loại mọi thư mục tên android vì node_modules cần chúng)
New-Item -ItemType Directory -Force $Work | Out-Null
robocopy $Src $Work /E /XD "$Src\android" "$Src\.gradle" "$Src\test-reports" /NFL /NDL /NJH /NJS /NP | Out-Null
Copy-Item $keyFile "$Work\google-services.json" -Force

# 2. Sinh dự án Android và đặt thư mục build C++ ngắn
Set-Location $Work
$env:GOOGLE_SERVICES_JSON = "$Work\google-services.json"
npx expo prebuild --platform android --clean --no-install
$gradle = "$Work\android\app\build.gradle"
$t = Get-Content $gradle -Raw
$t = $t -replace '(?m)^android \{', "android {`n    externalNativeBuild {`n        cmake {`n            buildStagingDirectory file('C:/c')`n        }`n    }"
Set-Content $gradle $t -NoNewline
$props = "$Work\android\gradle.properties"
(Get-Content $props) -replace 'org.gradle.jvmargs=.*', 'org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=768m' | Set-Content $props

# 3. Build
Set-Location "$Work\android"
.\gradlew.bat assembleRelease "-PreactNativeArchitectures=$Archs" --no-daemon --console=plain
if ($LASTEXITCODE -ne 0) { throw "Gradle lỗi (mã $LASTEXITCODE)" }
"APK: $Work\android\app\build\outputs\apk\release\app-release.apk"
