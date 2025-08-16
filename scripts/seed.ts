import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../backend/src/utils/prisma.js';

async function main(){
  const adminEmail = 'admin@example.com';
  const adminPass = 'admin123';
  const hash = await bcrypt.hash(adminPass, 10);
  await prisma.adminUser.upsert({ where: { email: adminEmail }, update: { password: hash }, create: { email: adminEmail, password: hash } });

  const platforms = [
    { name: 'OpenAI', url: 'https://openai.com', imageUrl: 'https://logo.clearbit.com/openai.com', description: 'Models, APIs, research', category: 'Research' },
    { name: 'Hugging Face', url: 'https://huggingface.co', imageUrl: 'https://logo.clearbit.com/huggingface.co', description: 'Models & datasets hub', category: 'Research' },
    { name: 'Replicate', url: 'https://replicate.com', imageUrl: 'https://logo.clearbit.com/replicate.com', description: 'Run ML models in the cloud', category: 'Deployment' },
    { name: 'Runway', url: 'https://runwayml.com', imageUrl: 'https://logo.clearbit.com/runwayml.com', description: 'Creative video AI', category: 'Creativity' },
    { name: 'LangChain', url: 'https://langchain.com', imageUrl: 'https://logo.clearbit.com/langchain.com', description: 'Framework for LLM apps', category: 'Framework' },
  ];

  await Promise.all(
    platforms.map(p =>
      prisma.platform.upsert({ where: { url: p.url }, update: {}, create: p })
    )
  );

  console.log('Seed complete. Admin user created.');

  // WARNING: Logging credentials is insecure for production environments.
  console.log('Seed complete. Admin: admin@example.com / admin123');
  console.log('Seed complete. Admin: admin@example.com / admin123');
}

main()
  .catch(e=>{ console.error(e); process.exitCode = 1; })
  .finally(async ()=>{ await prisma.$disconnect(); });