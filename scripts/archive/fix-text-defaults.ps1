$content = Get-Content "D:\Dev Projects\halalneo\src\lib\server\db\schema.ts" -Raw

# Replace text().default() to text().defaultFn() for strings
$content = $content -replace 'text\(\'.+?\'\)\.default\("active"\)', 'text(`$1`).defaultFn(() => "active")'
$content = $content -replace 'text\(\'.+?\'\)\.default\("pending"\)', 'text(`$1`).defaultFn(() => "pending")'
$content = $content -replace 'text\(\'.+?\'\)\.default\("draft"\)', 'text(`$1`).defaultFn(() => "draft")'
$content = $content -replace 'text\(\'.+?\'\)\.default\("published"\)', 'text(`$1`).defaultFn(() => "published")'
$content = $content -replace 'text\(\'.+?\'\)\.default\(""\)', 'text(`$1`).defaultFn(() => "")'
$content = $content -replace 'text\(\'.+?\'\)\.default\(\[\]\)', 'text(`$1`).defaultFn(() => [])'
$content = $content -replace 'text\(\'.+?\'\)\.default\(\{\}\)', 'text(`$1`).defaultFn(() => ({)})'

# Also replace text("...").default() pattern
$content = $content -replace 'text\(".+?"\)\.default\("active"\)', 'text(`$1`).defaultFn(() => "active")'
$content = $content -replace 'text\(".+?"\)\.default\("pending"\)', 'text(`$1`).defaultFn(() => "pending")'
$content = $content -replace 'text\(".+?"\)\.default\("draft"\)', 'text(`$1`).defaultFn(() => "draft")'
$content = $content -replace 'text\(".+?"\)\.default\("published"\)', 'text(`$1`).defaultFn(() => "published")'
$content = $content -replace 'text\(".+?"\)\.default\(""\)', 'text(`$1`).defaultFn(() => "")'
$content = $content -replace 'text\(".+?"\)\.default\(\[\]\)', 'text(`$1`).defaultFn(() => [])'
$content = $content -replace 'text\(".+?"\)\.default\(\{\}\)', 'text(`$1`).defaultFn(() => ({)})'

[System.IO.File]::WriteAllText("D:\Dev Projects\halalneo\src\lib\server\db\schema.ts", $content, [System.Text.Encoding]::UTF8)
Write-Host "Fixed text default() calls to defaultFn()"
