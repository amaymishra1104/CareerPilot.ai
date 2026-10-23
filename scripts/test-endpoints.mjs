const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function run() {
  console.log('--- STARTING COMPLETE LIFECYCLE AUDIT ---');

  // Step 1: Reject Sarah Jenkins
  console.log('Step 1: Rejecting Sarah Jenkins...');
  const rejectRes = await fetch(`${BASE_URL}/api/approvals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      leadId: 'lead-sarah-02',
      action: 'REJECT',
      reviewerNotes: 'Too few units in sweet-spot',
      rejectionReason: 'Outside current ICP store count sweet-spot'
    })
  });
  console.log('   Rejection status:', rejectRes.status);
  const rejectData = await rejectRes.json();
  console.log('   Lead status now:', rejectData.contact?.approval_status);

  // Step 2: Attempt sequence generation on rejected Sarah Jenkins (Must fail 403)
  console.log('Step 2: Testing sequence generation on rejected lead...');
  const seqFailRes = await fetch(`${BASE_URL}/api/sequences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId: 'lead-sarah-02' })
  });
  console.log('   Rejected lead sequence generation HTTP status:', seqFailRes.status);
  if (seqFailRes.status !== 403) throw new Error('Expected 403 for rejected lead!');

  // Step 3: Attempt draft creation on rejected Sarah Jenkins (Must fail 403)
  console.log('Step 3: Testing draft creation on rejected lead...');
  const draftFailRes = await fetch(`${BASE_URL}/api/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId: 'lead-sarah-02' })
  });
  console.log('   Rejected lead draft creation HTTP status:', draftFailRes.status);
  if (draftFailRes.status !== 403) throw new Error('Expected 403 for rejected lead drafts!');

  // Step 4: Approve Marcus Vance
  console.log('Step 4: Approving Marcus Vance...');
  const approveRes = await fetch(`${BASE_URL}/api/approvals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      leadId: 'lead-marcus-01',
      action: 'APPROVE',
      reviewerNotes: 'Strong ICP match with 48 Firehouse units in Carolinas'
    })
  });
  console.log('   Approval status:', approveRes.status);
  const approveData = await approveRes.json();
  console.log('   Lead status now:', approveData.contact?.approval_status);

  // Step 5: Generate sequence for approved Marcus Vance (Must succeed 200 with 4 emails)
  console.log('Step 5: Generating sequence for approved lead...');
  const seqRes = await fetch(`${BASE_URL}/api/sequences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId: 'lead-marcus-01' })
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

  // Step 6: Create drafts for approved Marcus Vance
  console.log('Step 6: Creating drafts for approved lead sequence...');
  const draftRes = await fetch(`${BASE_URL}/api/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId: 'lead-marcus-01' })
  });
  console.log('   Draft creation HTTP status:', draftRes.status);
  const draftData = await draftRes.json();
  console.log('   Drafts created count:', draftData.draftsCreated);
  if (draftData.draftsCreated !== 4) throw new Error('Expected 4 drafts created!');

  // Step 7: Verify draft queue endpoint
  console.log('Step 7: Verifying Draft Queue records...');
  const getDraftsRes = await fetch(`${BASE_URL}/api/drafts?leadId=lead-marcus-01`);
  const draftsList = await getDraftsRes.json();
  console.log('   Fetched drafts count for Marcus:', draftsList.length);

  // Verify Sarah has 0 drafts
  const sarahDraftsRes = await fetch(`${BASE_URL}/api/drafts?leadId=lead-sarah-02`);
  const sarahDrafts = await sarahDraftsRes.json();
  console.log('   Fetched drafts count for rejected Sarah:', sarahDrafts.length);
  if (sarahDrafts.length !== 0) throw new Error('Rejected lead must have ZERO drafts!');
  if (sarahDrafts.length !== 0) throw new Error('Rejected lead must have ZERO drafts!');

  console.log('--- ALL LIFECYCLE AUDITS PASSED WITH ZERO ERRORS ---');
}

run().catch(err => {
  console.error('FATAL AUDIT FAILURE:', err);
  process.exit(1);
});
