
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://svlckcjwsbxqwdlqydbt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bGNrY2p3c2J4cXdkbHF5ZGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2MzEwNywiZXhwIjoyMDk1MDM5MTA3fQ.qgAxcarnWgKhKkLCWwB6-1CdzmUDBFXn_bfhXL-amrg'
);
async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
run();

