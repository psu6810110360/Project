import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './src/modules/users/entities/user.entity';
import { Course } from './src/modules/courses/entities/course.entity';
import { Payment } from './src/modules/payments/entities/payment.entity';



const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',      // เพราะคุณ expose 5433
  port: 5433,
  username: 'myuser',
  password: 'mypassword',
  database: 'tutoring_db',
  entities: [User, Course, Payment],
  synchronize: false,     // ❗ สำคัญ: ไม่เปิด sync ใน seeder
});

async function seedAdmin() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  const adminEmail = 'admin@test.com';

  const exists = await userRepo.findOne({
    where: { email: adminEmail },
  });

  if (exists) {
    console.log('✅ Admin already exists');
    process.exit(0);
  }

  const admin = userRepo.create({
    email: adminEmail,
    password: await bcrypt.hash('admin1234', 10),
    role: 'admin',
  });

  await userRepo.save(admin);

  console.log('🎉 Admin created');
  console.log('Email:', adminEmail);
  console.log('Password: admin1234');

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});