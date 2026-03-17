// src/utils/supabase-upload.util.ts
import { createClient } from '@supabase/supabase-js';
import { extname } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export const uploadToSupabase = async (file: Express.Multer.File, folder: string) => {

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new Error('ไม่พบข้อมูล SUPABASE_URL หรือ SUPABASE_KEY ในไฟล์ .env');
    }
  // เชื่อมต่อกับ Supabase
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  
  // ตั้งชื่อไฟล์ใหม่ไม่ให้ซ้ำกัน
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  const fileName = `${folder}/file-${uniqueSuffix}${ext}`;

  // อัปโหลดขึ้น Bucket ที่ชื่อว่า 'uploads'
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  // ขอ URL ออนไลน์กลับมาใช้งาน
  const { data: publicUrlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};