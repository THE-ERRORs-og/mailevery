import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import User from '@/models/User';

export async function GET(req) {
   const userId = req.headers.get("x-user-id");
   if (!userId) {
     return NextResponse.json(
       { error: "Unauthorized", success: false },
       { status: 401 }
     );
   }
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await EmailLog.countDocuments({ user: userId });

    // Get logs with pagination
    const logs = await EmailLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 