import { NextResponse } from 'next/server';
import { Store } from '@/lib/storage';
import { ResumeParserService } from '@/lib/career/resume-parser';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || undefined;
  const resumes = Store.getResumes(userId);
  return NextResponse.json(resumes);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId = 'user-amay-01', 
      fileName = 'uploaded_resume.txt', 
      fileType = 'txt', 
      content,
      profileType,
      title
    } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Resume content is required.' }, { status: 400 });
    }

    const record = ResumeParserService.createResumeRecord(
      userId,
      fileName,
      fileType,
      content,
      profileType,
      title
    );

    Store.saveResume(record);
    return NextResponse.json(record, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required.' }, { status: 400 });
    }

    const deleted = Store.deleteResume(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
