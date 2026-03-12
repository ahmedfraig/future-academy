/**
 * Future Academy - Database Setup & Seed Script
 * Run once: node database/seed.js
 * - Creates all tables (runs schema.sql automatically)
 * - Populates all demo data
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');
const fs       = require('fs');
const path     = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connected to Supabase PostgreSQL\n');

    // ── STEP 1: RUN SCHEMA ────────────────────────────────────
    console.log('📐 Creating tables (running schema.sql)...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Tables ready\n');

    // ── STEP 2: SEED DATA ─────────────────────────────────────
    console.log('🌱 Seeding demo data...\n');
    await client.query('BEGIN');

    // 1. TEACHERS
    console.log('📚 Seeding teachers...');
    await client.query(`
      INSERT INTO teachers (id, name, avatar, phone, email, assigned_classes, specialization, join_date, active) VALUES
        (1, 'أ. فاطمة السعيد',  '👩‍🏫', '0501234567', 'teacher1@rawdah.sa', ARRAY['KG1-A'], 'رياض أطفال', '2022-09-01', true),
        (2, 'أ. نورة القحطاني', '👩‍🏫', '0507654321', 'teacher2@rawdah.sa', ARRAY['KG1-B'], 'تربية خاصة', '2021-09-01', true),
        (3, 'أ. سارة المنصور',  '👩‍🏫', '0509876543', 'sarah@rawdah.sa',    ARRAY['KG2-A'], 'رياض أطفال', '2023-01-15', true),
        (4, 'أ. هيا الشمري',    '👩‍🏫', '0501122334', 'haya@rawdah.sa',     ARRAY['KG2-B'], 'فنون وحرف',  '2023-09-01', true),
        (5, 'أ. ريم الزهراني',  '👩‍🏫', '0505544332', 'reem@rawdah.sa',     ARRAY[]::text[], 'رياض أطفال', '2024-02-01', false)
      ON CONFLICT (id) DO NOTHING;
    `);
    await client.query(`SELECT setval('teachers_id_seq', (SELECT MAX(id) FROM teachers));`);

    // 2. CLASSES
    console.log('🏫 Seeding classes...');
    await client.query(`
      INSERT INTO classes (id, name, grade_level, capacity, teacher_id, color) VALUES
        ('KG1-A', 'KG1-A', 'روضة أولى',  20, 1, 'blue'),
        ('KG1-B', 'KG1-B', 'روضة أولى',  20, 2, 'green'),
        ('KG2-A', 'KG2-A', 'روضة ثانية', 18, 3, 'purple'),
        ('KG2-B', 'KG2-B', 'روضة ثانية', 18, 4, 'orange')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. STUDENTS
    console.log('👦 Seeding students...');
    await client.query(`
      INSERT INTO students (id, name, avatar, gender, age, class_id, parent_name, phone, medication) VALUES
        (1,  'يونس العمري',      '👦', 'ذكر',  4, 'KG1-A', 'أحمد العمري',     '0501111111', false),
        (2,  'لينا حسن',         '👧', 'أنثى', 4, 'KG1-A', 'حسن الغامدي',     '0502222222', false),
        (3,  'محمد الأحمد',      '👦', 'ذكر',  5, 'KG1-A', 'خالد الأحمد',     '0503333333', true),
        (4,  'سارة العلي',       '👧', 'أنثى', 4, 'KG1-A', 'علي الدوسري',     '0504444444', false),
        (5,  'عمر الرشيد',       '👦', 'ذكر',  4, 'KG1-A', 'فهد الرشيد',      '0505555555', false),
        (6,  'نورة المنصور',     '👧', 'أنثى', 5, 'KG1-A', 'سعد المنصور',     '0506666666', false),
        (7,  'فيصل الزهراني',    '👦', 'ذكر',  4, 'KG1-A', 'ماجد الزهراني',   '0507777777', false),
        (8,  'ريم السالم',       '👧', 'أنثى', 4, 'KG1-A', 'تركي السالم',     '0508888888', false),
        (9,  'خالد العتيبي',     '👦', 'ذكر',  5, 'KG1-A', 'نواف العتيبي',    '0509999999', false),
        (10, 'دانة الحربي',      '👧', 'أنثى', 4, 'KG1-A', 'بدر الحربي',      '0501010101', false),
        (11, 'سلطان المالكي',    '👦', 'ذكر',  4, 'KG1-A', 'عبدالله المالكي', '0501020304', false),
        (12, 'وفاء الشمري',      '👧', 'أنثى', 5, 'KG1-A', 'محمد الشمري',     '0501030506', false),
        (13, 'راشد القحطاني',    '👦', 'ذكر',  4, 'KG1-A', 'سالم القحطاني',   '0501040708', false),
        (14, 'جواهر الدوسري',    '👧', 'أنثى', 4, 'KG1-A', 'حمد الدوسري',     '0501050910', true),
        (15, 'ناصر البلوي',      '👦', 'ذكر',  5, 'KG1-A', 'عيسى البلوي',     '0501061112', false),
        (16, 'هيا الغامدي',      '👧', 'أنثى', 4, 'KG1-A', 'وليد الغامدي',    '0501071314', false),
        (17, 'بدر المطيري',      '👦', 'ذكر',  4, 'KG1-A', 'مطلق المطيري',    '0501081516', false),
        (18, 'تغريد السبيعي',    '👧', 'أنثى', 5, 'KG1-A', 'عادل السبيعي',    '0501091718', false),
        (19, 'عبدالله النعيم',   '👦', 'ذكر',  4, 'KG1-A', 'حمزة النعيم',     '0501101920', false),
        (20, 'هند الزيد',        '👧', 'أنثى', 4, 'KG1-A', 'زيد الزيد',       '0501112122', false),
        (21, 'سلمى الحربي',      '👧', 'أنثى', 4, 'KG1-B', 'نايف الحربي',     '0502010203', false),
        (22, 'ركان المطيري',     '👦', 'ذكر',  4, 'KG1-B', 'خليل المطيري',    '0502020304', false),
        (23, 'جنى الشهري',       '👧', 'أنثى', 5, 'KG1-B', 'أحمد الشهري',     '0502030405', false),
        (24, 'تركي الغامدي',     '👦', 'ذكر',  4, 'KG1-B', 'فهيد الغامدي',    '0502040506', true),
        (25, 'لمى الزهراني',     '👧', 'أنثى', 4, 'KG1-B', 'عصام الزهراني',   '0502050607', false),
        (26, 'يزيد القرني',      '👦', 'ذكر',  5, 'KG1-B', 'سعيد القرني',     '0502060708', false),
        (27, 'أميرة الدوسري',   '👧', 'أنثى', 4, 'KG1-B', 'منصور الدوسري',   '0502070809', false),
        (28, 'مشاري العتيبي',    '👦', 'ذكر',  4, 'KG1-B', 'وليد العتيبي',    '0502080910', false),
        (29, 'شيخة السالم',      '👧', 'أنثى', 5, 'KG2-A', 'عمر السالم',      '0503010203', false),
        (30, 'فراس الرشيد',      '👦', 'ذكر',  6, 'KG2-A', 'ماهر الرشيد',     '0503020304', false),
        (31, 'بسمة المنصور',     '👧', 'أنثى', 5, 'KG2-A', 'رضا المنصور',     '0503030405', true),
        (32, 'عبدالرحمن البلوي', '👦', 'ذكر',  5, 'KG2-A', 'ياسر البلوي',     '0503040506', false),
        (33, 'نوف الشمري',       '👧', 'أنثى', 6, 'KG2-A', 'طارق الشمري',     '0503050607', false),
        (34, 'أنس القحطاني',     '👦', 'ذكر',  5, 'KG2-A', 'بلال القحطاني',   '0503060708', false),
        (35, 'غدير المالكي',     '👧', 'أنثى', 5, 'KG2-B', 'حاتم المالكي',    '0504010203', false),
        (36, 'معاذ الزهراني',    '👦', 'ذكر',  6, 'KG2-B', 'جابر الزهراني',   '0504020304', false),
        (37, 'صفاء الحربي',      '👧', 'أنثى', 5, 'KG2-B', 'نادر الحربي',     '0504030405', false),
        (38, 'حمد العمري',       '👦', 'ذكر',  5, 'KG2-B', 'ابراهيم العمري',  '0504040506', true),
        (39, 'ريان الغامدي',     '👦', 'ذكر',  6, 'KG2-B', 'حمود الغامدي',    '0504050607', false)
      ON CONFLICT (id) DO NOTHING;
    `);
    await client.query(`SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));`);

    // 4. USERS
    console.log('👤 Seeding users (hashing passwords — this takes a moment)...');
    const managerPw = bcrypt.hashSync('manager123', 10);
    const teacherPw = bcrypt.hashSync('teacher123', 10);
    const parentPw  = bcrypt.hashSync('parent123',  10);
    await client.query(`
      INSERT INTO users (id, name, email, password, role, avatar, class_id, teacher_id, child_id) VALUES
        ('u1', 'م. عبدالله الفيصل', 'manager@rawdah.sa',  $1, 'manager', '👨‍💼', NULL,    NULL, NULL),
        ('u2', 'أ. فاطمة السعيد',   'teacher1@rawdah.sa', $2, 'teacher', '👩‍🏫', 'KG1-A', 1,    NULL),
        ('u3', 'أ. نورة القحطاني',  'teacher2@rawdah.sa', $2, 'teacher', '👩‍🏫', 'KG1-B', 2,    NULL),
        ('u4', 'أحمد العمري',        'parent1@rawdah.sa',  $3, 'parent',  '👨',  NULL,    NULL, 1),
        ('u5', 'حسن الغامدي',        'parent2@rawdah.sa',  $3, 'parent',  '👨',  NULL,    NULL, 2)
      ON CONFLICT (id) DO NOTHING;
    `, [managerPw, teacherPw, parentPw]);

    // 5. DAILY REPORTS (today's demo data)
    console.log('📋 Seeding today\'s daily reports...');
    const today = new Date().toISOString().split('T')[0];
    await client.query(`
      INSERT INTO daily_reports (student_id, report_date, present, arrival_time, mood, behavior, meals, potty, note) VALUES
        (1,  $1, true,  '7:45 ص', '😄', 'ممتاز',    '{"breakfast":"full","lunch":"half","snack":"none"}', ARRAY['9:00 ص','11:30 ص'], ''),
        (2,  $1, true,  '8:00 ص', '😊', 'جيد جداً', '{"breakfast":"full","lunch":"full","snack":"half"}', ARRAY['10:00 ص'],          ''),
        (3,  $1, true,  '8:15 ص', '😐', 'جيد',      '{"breakfast":"half","lunch":"none","snack":"none"}', ARRAY[]::text[],           'يعاني من صداع'),
        (4,  $1, false, NULL,      NULL,  NULL,        '{}',                                                ARRAY[]::text[],           ''),
        (5,  $1, true,  '7:50 ص', '😄', 'ممتاز',    '{"breakfast":"full","lunch":"full","snack":"full"}', ARRAY['9:30 ص','1:00 م'], ''),
        (6,  $1, true,  '8:05 ص', '😊', 'جيد جداً', '{"breakfast":"full","lunch":"half","snack":"none"}', ARRAY['10:30 ص'],          ''),
        (7,  $1, true,  '7:55 ص', '😄', 'ممتاز',    '{"breakfast":"full","lunch":"full","snack":"half"}', ARRAY[]::text[],           ''),
        (8,  $1, true,  '8:10 ص', '😊', 'جيد',      '{"breakfast":"full","lunch":"full","snack":"full"}', ARRAY['11:00 ص'],          ''),
        (9,  $1, false, NULL,      NULL,  NULL,        '{}',                                                ARRAY[]::text[],           ''),
        (10, $1, true,  '8:00 ص', '😄', 'ممتاز',    '{"breakfast":"full","lunch":"full","snack":"none"}', ARRAY['9:00 ص'],           '')
      ON CONFLICT (student_id, report_date) DO NOTHING;
    `, [today]);

    // 6. ANNOUNCEMENTS
    console.log('📢 Seeding announcements...');
    await client.query(`
      INSERT INTO announcements (id, title, body, color, target, created_at) VALUES
        ('a1', 'رحلة علمية قادمة 🎒',       'يوم السبت القادم سنزور متحف الطبيعة. الرجاء إرسال موافقة الولي.',    'blue',   'all', now() - interval '1 hour'),
        ('a2', 'تطعيمات الصحة المدرسية 💉', 'سيتم تطعيم الأطفال يوم الأحد. يرجى التأكد من السجل الصحي.',           'green',  'all', now() - interval '1 day'),
        ('a3', 'احتفال اليوم الوطني 🇸🇦',    'نحتفل هذا الأسبوع باليوم الوطني. يُرجى إرسال الطفل بالزي الوطني.', 'yellow', 'all', now() - interval '2 days')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 7. NOTES
    console.log('📝 Seeding notes...');
    await client.query(`
      INSERT INTO notes (id, student_id, from_role, from_name, text, created_at) VALUES
        ('n1', 1, 'teacher', 'أ. فاطمة السعيد', 'يونس اليوم كان رائعاً! شارك بفاعلية في الحصص. نرجو مراجعة واجب الرياضيات 🌟', now())
      ON CONFLICT (id) DO NOTHING;
    `);

    // 8. ACTIVITY LOG
    console.log('📊 Seeding activity log...');
    await client.query(`
      INSERT INTO activity_log (icon, text, type, created_at) VALUES
        ('👦',  'تم تسجيل طالب جديد: يونس العمري في KG1-A', 'student',      now() - interval '5 minutes'),
        ('👩‍🏫', 'تم تعيين أ. فاطمة السعيد لفصل KG1-A',      'teacher',      now() - interval '20 minutes'),
        ('📢',  'تم نشر إعلان: رحلة علمية قادمة',           'announcement', now() - interval '1 hour'),
        ('🏫',  'تم إنشاء فصل جديد: KG2-B',                 'class',        now() - interval '3 hours');
    `);

    await client.query('COMMIT');

    console.log('\n✅ Database setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Demo Credentials:');
    console.log('   Manager  → manager@rawdah.sa  / manager123');
    console.log('   Teacher  → teacher1@rawdah.sa / teacher123');
    console.log('   Parent   → parent1@rawdah.sa  / parent123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 Now run: npm run dev\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Setup failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
