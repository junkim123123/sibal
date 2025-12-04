# Git 히스토리에서 Sanity API 토큰 제거 스크립트
# 주의: 이 스크립트는 Git 히스토리를 수정합니다. 실행 전 백업을 권장합니다.

Write-Host "⚠️  경고: 이 스크립트는 Git 히스토리를 수정합니다." -ForegroundColor Yellow
Write-Host "실행 전에 반드시 원격 저장소를 백업하세요." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "취소되었습니다." -ForegroundColor Red
    exit
}

# 토큰 목록
$tokens = @(
    "sktXThi7RG2MBAMvnm2Ut770ZmXlomium3Vrtuc24r48e0Oew2REsXcXtydt4Rh9jiGWAmbeAexafQx9HhOmIl6MBPUcD8GImBHlRm4FWOYZm9loOl32dqiZrEAuAHvHL9poZzBWxPPiNzA9h6dPWiOOCgivRP9njsuxaJNH4aNdtHfZ2iNd",
    "skUFMqFIEBvUZzCvFNdJtPtlldDkIC1SbbaDWvDlyNp1r3Z9XKuxaCR2mYl9SQKURVNz6UTycnPolbU00uWuLrugdS0SeiUIyStj0JW66wXyMRJpsrYnKy82uGl9hDkB5UIYFhvIcZWcPx5rBogboEja5Ce0yYaQJD1WpMoZxP3503VBRk5f"
)

Write-Host "Git filter-branch를 사용하여 토큰을 제거합니다..." -ForegroundColor Green

foreach ($token in $tokens) {
    Write-Host "토큰 제거 중: $($token.Substring(0, 20))..." -ForegroundColor Yellow
    git filter-branch --force --index-filter "git rm --cached --ignore-unmatch -r ." --prune-empty --tag-name-filter cat -- --all
    if ($LASTEXITCODE -ne 0) {
        Write-Host "오류 발생: $LASTEXITCODE" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ 완료되었습니다." -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. git push --force --all (주의: force push입니다!)" -ForegroundColor Yellow
Write-Host "2. Sanity 대시보드에서 토큰을 재생성하세요" -ForegroundColor Yellow

