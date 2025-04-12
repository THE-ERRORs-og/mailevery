import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SmtpConfig from '@/models/SmtpConfig';
import User from '@/models/User';
import { verifySmtpConfig } from '@/lib/smtp-verification';

export async function POST(req) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    );
  }
  try {
    await connectDB();

    const { host, port, secure, username, password, provider } = await req.json();

    if (!host || !port || !username || !password || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      );
    }

    // Verify SMTP configuration
    const verificationResult = await verifySmtpConfig({
      host,
      port,
      secure,
      username,
      password,
    });

    if (!verificationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid SMTP configuration. Please check your credentials and try again.',
          success: false,
          details: verificationResult.error
        },
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

    // Create or update SMTP config
    let smtpConfig = await SmtpConfig.findOne({ user: userId });
    
    if (smtpConfig) {
      smtpConfig.host = host;
      smtpConfig.port = port;
      smtpConfig.secure = secure;
      smtpConfig.username = username;
      smtpConfig.password = password;
      smtpConfig.provider = provider;
      await smtpConfig.save();
    } else {
      smtpConfig = await SmtpConfig.create({
        user: userId,
        host,
        port,
        secure,
        username,
        password,
        provider,
      });
      
      // Update user's SMTP reference
      user.smtp = smtpConfig._id;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration verified and saved successfully',
      smtpConfig: {
        ...smtpConfig.toObject(),
        password: undefined // Don't send password back
      },
    });
  } catch (error) {
    console.error('Error saving SMTP config:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const smtpConfig = await SmtpConfig.findOne({ user: userId });
    
    if (!smtpConfig) {
      return NextResponse.json(
        { error: 'SMTP configuration not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      smtpConfig: {
        ...smtpConfig.toObject(),
        password: undefined // Don't send password back
      },
    });
  } catch (error) {
    console.error('Error fetching SMTP config:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
} 