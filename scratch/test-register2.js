
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://svlckcjwsbxqwdlqydbt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bGNrY2p3c2J4cXdkbHF5ZGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2MzEwNywiZXhwIjoyMDk1MDM5MTA3fQ.qgAxcarnWgKhKkLCWwB6-1CdzmUDBFXn_bfhXL-amrg'
);
async function run() {
  const email = 'newtest' + Date.now() + '@example.com';
  console.log('Creating user:', email);
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'teacher', full_name: 'Test Teacher' }
  });
  if (createError) {
    console.log('Create Error:', createError);
    return;
  }
  console.log('User created:', user.user.id);
  // Wait 1 second for trigger
  await new Promise(r => setTimeout(r, 1000));
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.user.id).single();
  console.log('Profile:', profile);
  console.log('Profile Error:', profileError);
}
run();

