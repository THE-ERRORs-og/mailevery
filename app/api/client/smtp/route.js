import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SmtpConfig from '@/models/SmtpConfig';
import User from '@/models/User';
import { verifySmtpConfig } from '@/lib/smtp-verification';

// GET existing SMTP configuration
export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    await connectDB();
    const smtpConfig = await SmtpConfig.findOne({ user: userId });

    if (!smtpConfig) {
      return NextResponse.json({ smtpConfig: null ,success:true});
    }

    return NextResponse.json({
      smtpConfig: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.username,
        provider: smtpConfig.provider,
      }
      ,success:true
    });
  } catch (error) {
    console.error('Error fetching SMTP config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMTP configuration',success:false },
      { status: 500 }
    );
  }
}

// POST create or update SMTP configuration
export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const { host, port, secure, username, password, provider } = await request.json();

    if (!host || !port || !username || !password || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' ,success:false},
        { status: 400 }
      );
    }

    await connectDB();

    // Check if SMTP config already exists
    let smtpConfig = await SmtpConfig.findOne({ user: userId });

    if (smtpConfig) {
      // Update existing config
      smtpConfig.host = host;
      smtpConfig.port = port;
      smtpConfig.secure = secure;
      smtpConfig.username = username;
      smtpConfig.password = password;
      smtpConfig.provider = provider;
      await smtpConfig.save();
    } else {
      // Create new config
      smtpConfig = await SmtpConfig.create({
        user: session.user.id,
        host,
        port,
        secure,
        username,
        password,
        provider,
      });
    }

    return NextResponse.json({
      smtpConfig: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.username,
        provider: smtpConfig.provider,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error saving SMTP config:", error);
    return NextResponse.json(
      { error: 'Failed to save SMTP configuration' ,success:false},
      { status: 500 }
    );
  }
} 