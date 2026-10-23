import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { WorkflowRunner } from '@/lib/workflow/runner';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const executionId = searchParams.get('executionId') || undefined;

    const executions = Store.getWorkflowExecutions();
    const latest = Store.getLatestWorkflowExecution();
    const logs = Store.getWorkflowLogs(executionId);

    return NextResponse.json({
      latest,
      executions,
      logs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, executionId } = body;

    let execution;
    if (action === 'resume') {
      const activeId = executionId || Store.getLatestWorkflowExecution()?.id || `exec-${Date.now()}`;
      execution = await WorkflowRunner.resumeAfterApproval(activeId);
    } else {
      execution = await WorkflowRunner.runPipeline(executionId);
    }

    return NextResponse.json({
      success: true,
      execution,
      logs: Store.getWorkflowLogs(execution.id)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
