$content = Get-Content "D:\Dev Projects\halalneo\src\lib\server\db\schema.ts" -Raw

# Replace all .default() patterns with .defaultFn(() => value)
$replacements = @(
    @{ Pattern = '\.default\("active"\)'; Replacement = '.defaultFn(() => "active")' },
    @{ Pattern = '\.default\("pending"\)'; Replacement = '.defaultFn(() => "pending")' },
    @{ Pattern = '\.default\("draft"\)'; Replacement = '.defaultFn(() => "draft")' },
    @{ Pattern = '\.default\("published"\)'; Replacement = '.defaultFn(() => "published")' },
    @{ Pattern = '\.default\(0\)'; Replacement = '.defaultFn(() => 0)' },
    @{ Pattern = '\.default\(false\)'; Replacement = '.defaultFn(() => false)' },
    @{ Pattern = '\.default\(""\)'; Replacement = '.defaultFn(() => "")' },
    @{ Pattern = '\.default\(\{\}\)'; Replacement = '.defaultFn(() => ({}))' },
    @{ Pattern = '\.default\(\[\]\)'; Replacement = '.defaultFn(() => [])' },
    @{ Pattern = '\.default\(\[\]\)\.\$type'; Replacement = '.defaultFn(() => []).$type' }
)

foreach ($rep in $replacements) {
    $content = $content -replace $rep.Pattern, $rep.Replacement
}

[System.IO.File]::WriteAllText("D:\Dev Projects\halalneo\src\lib\server\db\schema.ts", $content, [System.Text.Encoding]::UTF8)
Write-Host "Fixed all default() calls to defaultFn()"
