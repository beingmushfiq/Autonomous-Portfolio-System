const axios = require('axios');

async function testWebhook() {
  const payload = {
    repository: {
      name: 'autonomous-portfolio-system',
      html_url: 'https://github.com/beingmushfiq/autonomous-portfolio-system',
      owner: {
        login: 'beingmushfiq'
      }
    },
    commits: [
      { message: 'Initial commit: setting up 3D graphics and landing page' },
      { message: 'Integrate Prisma and Supabase' }
    ]
  };

  try {
    console.log('Sending mock push event to webhook endpoint...');
    const response = await axios.post('http://localhost:4000/api/webhooks/github', payload, {
      headers: {
        'x-github-event': 'push'
      }
    });
    console.log('Response:', response.data);
    console.log('Webhook test initiated successfully.');
  } catch (error) {
    console.error('Error sending webhook:', error.message);
  }
}

testWebhook();
