
$files = @(
  "app\dashboard\schedule\page.tsx",
  "app\dashboard\messages\page.tsx",
  "app\dashboard\rooms\page.tsx"
)
foreach ($file in $files) {
  $content = Get-Content -Path $file -Raw
  if ($file -match "schedule") {
    $content = $content -replace "const initialSchedule: ScheduleEvent\[\] = \[\s*\{[\s\S]*?\}\s*\];", "const initialSchedule: ScheduleEvent[] = [];"
  }
  if ($file -match "messages") {
    $content = $content -replace "const defaultContacts: Contact\[\] = \[\s*\{[\s\S]*?\}\s*\];", "const defaultContacts: Contact[] = [];"
  }
  if ($file -match "rooms") {
    $content = $content -replace "const defaultRooms: Room\[\] = \[\s*\{[\s\S]*?\}\s*\];", "const defaultRooms: Room[] = [];"
  }
  Set-Content -Path $file -Value $content
}

