import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import Plan from '@/models/Plan';
import { parseRequest } from '@/lib/service_utils/parseRequest';

export async function POST(req) {
  try {
    await connectDB();
    console.log('request arrived for signup');
    const { name, email, password } = await parseRequest(req);

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    console.log('object', { name, email, password });
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Try to find the free plan
    let freePlan = await Plan.findOne({ name: 'Free' });

    // If free plan doesn't exist, create it
    if (!freePlan) {
      freePlan = await Plan.create({
        name: 'Free',
        description: 'Basic plan with limited features',
        price: 0,
        maxEmailsPerDay: 100,
        features: [
          '100 emails per month',
          'Basic email templates',
          'Email logs for 30 days',
          'Single SMTP configuration'
        ],
        isActive: true
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      plan: freePlan._id,
      apiKey,
    });

    return NextResponse.json(
      { 
        id: user._id, 
        name: user.name,
        email: user.email,
        apiKey: user.apiKey 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 