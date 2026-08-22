$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Ensure-Dir($path) {
  New-Item -ItemType Directory -Force -Path $path | Out-Null
}

Ensure-Dir "$root\apps\user\src\routes"
Ensure-Dir "$root\apps\user\src\layouts"
Ensure-Dir "$root\apps\user\src\pages"
Ensure-Dir "$root\apps\user\src\components\layout"
Ensure-Dir "$root\apps\admin\src\routes"
Ensure-Dir "$root\apps\admin\src\layouts"
Ensure-Dir "$root\apps\admin\src\pages"
Ensure-Dir "$root\apps\admin\src\components\layout"
Ensure-Dir "$root\packages\shared\components"

Move-Item -Force "$root\src\components\common" "$root\packages\shared\components\common"
Move-Item -Force "$root\src\context" "$root\packages\shared\context"
Move-Item -Force "$root\src\hooks" "$root\packages\shared\hooks"
Move-Item -Force "$root\src\data" "$root\packages\shared\data"
Move-Item -Force "$root\src\styles" "$root\packages\shared\styles"

Move-Item -Force "$root\src\pages\public" "$root\apps\user\src\pages\public"
Move-Item -Force "$root\src\pages\auth" "$root\apps\user\src\pages\auth"
Move-Item -Force "$root\src\pages\tenant" "$root\apps\user\src\pages\tenant"
Move-Item -Force "$root\src\pages\owner" "$root\apps\user\src\pages\owner"
Move-Item -Force "$root\src\layouts\PublicLayout.jsx" "$root\apps\user\src\layouts\PublicLayout.jsx"
Move-Item -Force "$root\src\layouts\UserLayout.jsx" "$root\apps\user\src\layouts\UserLayout.jsx"
Move-Item -Force "$root\src\routes\UserRoutes.jsx" "$root\apps\user\src\routes\UserRoutes.jsx"
Move-Item -Force "$root\src\components\layout\Navbar.jsx" "$root\apps\user\src\components\layout\Navbar.jsx"
Move-Item -Force "$root\src\components\layout\Footer.jsx" "$root\apps\user\src\components\layout\Footer.jsx"
Move-Item -Force "$root\src\components\layout\UserSidebar.jsx" "$root\apps\user\src\components\layout\UserSidebar.jsx"
Move-Item -Force "$root\src\main.jsx" "$root\apps\user\src\main.jsx"
Move-Item -Force "$root\index.html" "$root\apps\user\index.html"

Move-Item -Force "$root\src\pages\admin" "$root\apps\admin\src\pages\admin"
Move-Item -Force "$root\src\layouts\AdminLayout.jsx" "$root\apps\admin\src\layouts\AdminLayout.jsx"
Move-Item -Force "$root\src\routes\AdminRoutes.jsx" "$root\apps\admin\src\routes\AdminRoutes.jsx"
Move-Item -Force "$root\src\components\layout\AdminNavbar.jsx" "$root\apps\admin\src\components\layout\AdminNavbar.jsx"
Move-Item -Force "$root\src\components\layout\Sidebar.jsx" "$root\apps\admin\src\components\layout\Sidebar.jsx"
Move-Item -Force "$root\src\main.admin.jsx" "$root\apps\admin\src\main.jsx"
Move-Item -Force "$root\admin.html" "$root\apps\admin\index.html"

Remove-Item -Recurse -Force "$root\src" -ErrorAction SilentlyContinue

Write-Host "Restructure complete."
