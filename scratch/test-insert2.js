
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://svlckcjwsbxqwdlqydbt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bGNrY2p3c2J4cXdkbHF5ZGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2MzEwNywiZXhwIjoyMDk1MDM5MTA3fQ.qgAxcarnWgKhKkLCWwB6-1CdzmUDBFXn_bfhXL-amrg'
);
async function run() {
  const { error } = await supabase.from('profiles').insert({
    id: '11111111-1111-1111-1111-111111111111',
    role: 'teacher',
    profile_code: 'TCH-9999',
    full_name: 'Test Name 2',
    city: 'Istanbul',
    email: 'test999@example.com'
  });
  console.log('Insert error 2:', error);
}
run();

