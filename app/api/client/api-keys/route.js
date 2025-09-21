import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import User from '@/models/User';
import crypto from 'crypto';
import { validateDomains } from '@/lib/service_utils/domainValidator';

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user's API keys
    const apiKeys = await ApiKey.find({ user: userId })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      apiKeys,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    await connectDB();
    const { name, domains = [], allowLocalhost = false } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate domains if provided
    if (domains.length > 0) {
      const validation = validateDomains(domains);
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: validation.error,
            invalidDomains: validation.invalidDomains,
            success: false 
          },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate a new API key
    const key = crypto.randomBytes(32).toString('hex');
    const apiKey = await ApiKey.create({
      user: userId,
      key,
      name: name || `API Key ${new Date().toLocaleDateString()}`,
      domains,
      allowLocalhost
    });

    return NextResponse.json({
      success: true,
      apiKey,
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const apiKeyId = searchParams.get('id');

    if (!apiKeyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Delete the API key
    const result = await ApiKey.findOneAndDelete({
      _id: apiKeyId,
      user: userId,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const apiKeyId = searchParams.get('id');

    if (!apiKeyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const { domains, allowLocalhost } = await req.json();
    
    // Validate fields
    if (domains !== undefined && !Array.isArray(domains)) {
      return NextResponse.json(
        { error: 'Domains must be an array', success: false },
        { status: 400 }
      );
    }

    // Validate domains if provided
    if (domains && domains.length > 0) {
      const validation = validateDomains(domains);
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: validation.error,
            invalidDomains: validation.invalidDomains,
            success: false 
          },
          { status: 400 }
        );
      }
    }

    // Find and update the API key
    const updateData = {};
    if (domains !== undefined) updateData.domains = domains;
    if (allowLocalhost !== undefined) updateData.allowLocalhost = allowLocalhost;

    const apiKey = await ApiKey.findOneAndUpdate(
      { _id: apiKeyId, user: userId },
      updateData,
      { new: true }
    );

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      apiKey,
      message: 'API key updated successfully',
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}