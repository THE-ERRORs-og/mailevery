import { connectDB } from '@/lib/mongodb';
import Plan from '@/models/Plan';

async function createFreePlan() {
  try {
    await connectDB();
    
    const freePlan = await Plan.findOne({ name: 'Free' });
    
    if (!freePlan) {
      await Plan.create({
        name: 'Free',
        description: 'Basic plan with limited features',
        price: 0,
        features: [
          '100 emails per month',
          'Basic email templates',
          'Email logs for 30 days',
          'Single SMTP configuration'
        ],
        isActive: true
      });
      console.log('Free plan created successfully');
    } else {
      console.log('Free plan already exists');
    }
  } catch (error) {
    console.error('Error creating free plan:', error);
  } finally {
    process.exit();
  }
}

createFreePlan(); 