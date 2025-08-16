import 'dotenv/config';
import { prisma } from '../backend/src/utils/prisma.js';
import bcrypt from 'bcryptjs';

async function main(){
  const adminEmail = 'admin@example.com';
  const adminPass = 'admin123';
  const hash = await bcrypt.hash(adminPass, 10);
  await prisma.adminUser.upsert({ where: { email: adminEmail }, update: {}, create: { email: adminEmail, password: hash } });

  const platforms = [
    { name: 'OpenAI', url: 'https://openai.com', imageUrl: 'https://logo.clearbit.com/openai.com', description: 'Models, APIs, research', category: 'Research' },
    { name: 'Hugging Face', url: 'https://huggingface.co', imageUrl: 'https://logo.clearbit.com/huggingface.co', description: 'Models & datasets hub', category: 'Research' },
    { name: 'Replicate', url: 'https://replicate.com', imageUrl: 'https://logo.clearbit.com/replicate.com', description: 'Run ML models in the cloud', category: 'Deployment' },
    { name: 'Runway', url: 'https://runwayml.com', imageUrl: 'https://logo.clearbit.com/runwayml.com', description: 'Creative video AI', category: 'Creativity' },
    { name: 'LangChain', url: 'https://langchain.com', imageUrl: 'https://logo.clearbit.com/langchain.com', description: 'Framework for LLM apps', category: 'Framework' },
  ];

  for (const p of platforms){
    await prisma.platform.upsert({ where: { url: p.url }, update: {}, create: p });
  }

  console.log('Seed complete. Admin: admin@example.com / admin123');
}

main()
  .catch(e=>{ console.error(e); process.exitCode = 1; })
  .finally(async ()=>{ await prisma.$disconnect(); });