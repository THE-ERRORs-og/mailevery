import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();

    // Get user ID from middleware headers
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const { name, subject, body, type } = await req.json();

    if (!name || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Check if template with same name already exists for this user
    const existingTemplate = await EmailTemplate.findOne({ 
      user: userId, 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingTemplate) {
      // Update existing template
      existingTemplate.subject = subject;
      existingTemplate.body = body;
      existingTemplate.type = type || 'static';
      await existingTemplate.save();
    }

    // Create new template
    const template = await EmailTemplate.create({
      user: userId,
      name,
      subject,
      body,
      type: type || 'static',
    });

    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      template: {
        ...template.toObject(),
        user: undefined // Don't send user info back
      },
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    // Get user ID from middleware headers
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const templates = await EmailTemplate.find({ user: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .select('-user'); // Don't include user field
    
    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    // Get user ID from middleware headers
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required', success: false },
        { status: 400 }
      );
    }

    // Verify template belongs to user
    const template = await EmailTemplate.findOne({ _id: templateId, user: userId });
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or unauthorized', success: false },
        { status: 404 }
      );
    }

    await EmailTemplate.findByIdAndDelete(templateId);
    
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
} 