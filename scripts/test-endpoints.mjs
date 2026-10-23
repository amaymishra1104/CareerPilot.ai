// scripts/test-endpoints.mjs
// Real HTTP lifecycle test against active dev server

const BASE_URL = process.env.BASE_URL || (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3000');

async function run() {
  console.log('--- STARTING COMPLETE LIFECYCLE AUDIT (REAL CURATED LEADS) ---');

  // Ensure fresh seed baseline first
  await fetch(`${BASE_URL}/api/demo/seed`, { method: 'POST' });

  // Step 1: Reject Lance Juhas (Piada)
  console.log('Step 1: Rejecting Lance Juhas...');
  const rejectRes = await fetch(`${BASE_URL}/api/approvals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      leadId: 'lead-lance-02',
      action: 'REJECT',
      reviewerNotes: 'Out of target sweet-spot this quarter',
      rejectionReason: 'Unit concentration outside focus territory'
    })
  });
  console.log('   Rejection status:', rejectRes.status);
  const rejectData = await rejectRes.json();
  console.log('   Lead status now:', rejectData.contact?.approval_status);

  // Step 2: Attempt sequence generation on rejected Lance Juhas (Must fail 403)
  console.log('Step 2: Testing sequence generation on rejected lead...');
  const seqFailRes = await fetch(`${BASE_URL}/api/sequences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId: 'lead-lance-02' })
  });
  console.log('   Rejected lead sequence generation HTTP status:', seqFailRes.status);
  if (seqFailRes.status !== 403) throw new Error('Expected 403 for rejected lead!');

  // Step 3: Attempt draft creation on rejected Lance Juhas (Must fail 403)
  console.log('Step 3: Testing draft creation on rejected lead...');
  const draftFailRes = await fetch(`${BASE_URL}/api/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId: 'lead-lance-02' })
  });
  console.log('   Rejected lead draft creation HTTP status:', draftFailRes.status);
  if (draftFailRes.status !== 403) throw new Error('Expected 403 for rejected lead drafts!');

  // Step 4: Approve John Ishmael (Taziki's)
  console.log('Step 4: Approving John Ishmael...');
  const approveRes = await fetch(`${BASE_URL}/api/approvals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      leadId: 'lead-john-01',
      action: 'APPROVE',
      reviewerNotes: 'Verified ~100 Taziki locations and active catering surge.'
    })
  });
  console.log('   Approval status:', approveRes.status);
  const approveData = await approveRes.json();
  console.log('   Lead status now:', approveData.contact?.approval_status);

  // Step 5: Generate sequence for approved John Ishmael (Must succeed 200 with 4 emails)
  console.log('Step 5: Generating sequence for approved lead...');
  const seqRes = await fetch(`${BASE_URL}/api/sequences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId: 'lead-john-01' })
  });
  console.log('   Approved lead sequence HTTP status:', seqRes.status);
  const seqData = await seqRes.json();
  console.log('   Emails generated count:', seqData.sequence?.emails?.length);
  if (seqData.sequence?.emails?.length !== 4) throw new Error('Expected exactly 4 emails!');

  // Verify days
  const days = seqData.sequence.emails.map(e => e.day_offset);
  console.log('   Sequence scheduled day offsets:', days);
  if (JSON.stringify(days) !== JSON.stringify([1, 4, 8, 13])) {
    throw new Error('Expected days [1, 4, 8, 13]!');
  }

  // Step 6: Create drafts for approved John Ishmael
  console.log('Step 6: Creating drafts for approved lead sequence...');
  const draftRes = await fetch(`${BASE_URL}/api/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId: 'lead-john-01' })
  });
  console.log('   Draft creation HTTP status:', draftRes.status);
  const draftData = await draftRes.json();
  console.log('   Drafts created count:', draftData.draftsCreated);
  if (draftData.draftsCreated !== 4) throw new Error('Expected 4 drafts created!');

  // Step 7: Verify draft queue endpoint
  console.log('Step 7: Verifying Draft Queue records...');
  const getDraftsRes = await fetch(`${BASE_URL}/api/drafts?leadId=lead-john-01`);
  const draftsList = await getDraftsRes.json();
  console.log('   Fetched drafts count for John Ishmael:', draftsList.length);

  // Verify Lance has 0 drafts
  const lanceDraftsRes = await fetch(`${BASE_URL}/api/drafts?leadId=lead-lance-02`);
  const lanceDrafts = await lanceDraftsRes.json();
  console.log('   Fetched drafts count for rejected Lance:', lanceDrafts.length);
  if (lanceDrafts.length !== 0) throw new Error('Rejected lead must have ZERO drafts!');

  console.log('--- LIFECYCLE AUDIT COMPLETED SUCCESSFULLY WITH 100% PASS ---');
}

run().catch((err) => {
  console.error('LIFECYCLE AUDIT FAILED:', err);
  process.exit(1);
});
