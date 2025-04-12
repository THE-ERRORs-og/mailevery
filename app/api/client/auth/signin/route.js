import { signIn } from "@/lib/auth/auth";
import User from "@/models/User";

export async function POST(req) {
  const { email, password } = await req.json();
  if(!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if(!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  try{
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  return NextResponse.json({ message: 'Login successful' }, { status: 200 });
}

