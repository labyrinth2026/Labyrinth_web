const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) envVars[k.trim()] = v.join('=').trim();
});

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function seed() {
  const slug = 'codeshift-registration';
  
  const { data: existingForm, error: fetchErr } = await supabase
    .from('forms')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
  }

  let formId;
  if (existingForm) {
    console.log('Form already exists in Supabase with ID:', existingForm.id);
    formId = existingForm.id;
    await supabase.from('form_fields').delete().eq('form_id', formId);
    const { error: updateErr } = await supabase.from('forms').update({
      title: 'CODE//SHIFT — Registration Form',
      description: 'Official registration form for CODE//SHIFT. Please ensure all team details and participant information are accurate.',
      status: 'published',
      updated_at: new Date().toISOString()
    }).eq('id', formId);
    if (updateErr) console.error('Update form error:', updateErr);
  } else {
    formId = crypto.randomUUID();
    console.log('Creating new form in Supabase with ID:', formId);
    const { error: insertErr } = await supabase.from('forms').insert({
      id: formId,
      title: 'CODE//SHIFT — Registration Form',
      description: 'Official registration form for CODE//SHIFT. Please ensure all team details and participant information are accurate.',
      slug: slug,
      status: 'published',
      start_date: new Date().toISOString(),
      end_date: '2026-12-31T23:59:59.000Z',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (insertErr) {
      console.error('Insert form error:', insertErr);
      return;
    }
  }

  const fields = [
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'section_divider',
      label: '1. Team Details',
      description: 'Enter basic information about your team and institution.',
      required: false,
      options: null,
      order_num: 0
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'short_text',
      label: 'Team Name',
      placeholder: 'Enter your team name',
      required: true,
      options: null,
      order_num: 1
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'short_text',
      label: 'College / Institution',
      placeholder: 'e.g. Christ University',
      required: true,
      options: null,
      order_num: 2
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'section_divider',
      label: '2. Participant 1',
      description: 'Details of the first team member.',
      required: false,
      options: null,
      order_num: 3
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'short_text',
      label: 'Name',
      placeholder: 'Full name of Participant 1',
      required: true,
      options: null,
      order_num: 4
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'email',
      label: 'Email',
      placeholder: 'participant1@christuniversity.in',
      required: true,
      options: null,
      order_num: 5
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'phone_number',
      label: 'Phone Number',
      placeholder: '+91 98765 43210',
      required: true,
      options: null,
      order_num: 6
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'section_divider',
      label: '3. Participant 2',
      description: 'Details of the second team member.',
      required: false,
      options: null,
      order_num: 7
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'short_text',
      label: 'Name',
      placeholder: 'Full name of Participant 2',
      required: true,
      options: null,
      order_num: 8
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'email',
      label: 'Email',
      placeholder: 'participant2@christuniversity.in',
      required: true,
      options: null,
      order_num: 9
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'phone_number',
      label: 'Phone Number',
      placeholder: '+91 98765 43210',
      required: true,
      options: null,
      order_num: 10
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'section_divider',
      label: '4. Confirmation',
      description: 'Review and accept event rules before submitting.',
      required: false,
      options: null,
      order_num: 11
    },
    {
      id: crypto.randomUUID(),
      form_id: formId,
      field_type: 'checkboxes',
      label: 'I agree to the CODE//SHIFT rules',
      description: 'Please check all items to confirm your team\'s compliance with event regulations.',
      required: true,
      options: [
        "I understand that Round 1 is without AI",
        "I understand that Round 2 allows AI",
        "I confirm that my team has exactly 2 participants"
      ],
      order_num: 12
    }
  ];

  const { error: fieldsErr } = await supabase.from('form_fields').insert(fields);
  if (fieldsErr) {
    console.error('Insert fields error:', fieldsErr);
  } else {
    console.log('SUCCESSFULLY_SEEDED_SUPABASE_FORMS');
  }
}

seed();
