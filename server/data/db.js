const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// =============================================
// IN-MEMORY DATABASE
// Pre-seeded with demo data
// =============================================

// --- USERS ---
const rawPassword_manager = bcrypt.hashSync('manager123', 10);
const rawPassword_teacher = bcrypt.hashSync('teacher123', 10);
const rawPassword_parent  = bcrypt.hashSync('parent123', 10);

const users = [
  { id: 'u1', name: 'م. عبدالله الفيصل', email: 'manager@rawdah.sa',  password: rawPassword_manager, role: 'manager',  avatar: '👨‍💼' },
  { id: 'u2', name: 'أ. فاطمة السعيد',   email: 'teacher1@rawdah.sa', password: rawPassword_teacher, role: 'teacher',  avatar: '👩‍🏫', classId: 'KG1-A', teacherId: 1 },
  { id: 'u3', name: 'أ. نورة القحطاني', email: 'teacher2@rawdah.sa', password: rawPassword_teacher, role: 'teacher',  avatar: '👩‍🏫', classId: 'KG1-B', teacherId: 2 },
  { id: 'u4', name: 'أحمد العمري',       email: 'parent1@rawdah.sa',  password: rawPassword_parent,  role: 'parent',   avatar: '👨', childId: 1 },
  { id: 'u5', name: 'حسن الغامدي',       email: 'parent2@rawdah.sa',  password: rawPassword_parent,  role: 'parent',   avatar: '👨', childId: 2 },
];

// --- TEACHERS ---
const teachers = [
  { id: 1, name: 'أ. فاطمة السعيد',  avatar: '👩‍🏫', phone: '0501234567', email: 'teacher1@rawdah.sa', assignedClasses: ['KG1-A'], specialization: 'رياض أطفال', joinDate: '2022-09-01', active: true },
  { id: 2, name: 'أ. نورة القحطاني',avatar: '👩‍🏫', phone: '0507654321', email: 'teacher2@rawdah.sa', assignedClasses: ['KG1-B'], specialization: 'تربية خاصة', joinDate: '2021-09-01', active: true },
  { id: 3, name: 'أ. سارة المنصور', avatar: '👩‍🏫', phone: '0509876543', email: 'sarah@rawdah.sa',    assignedClasses: ['KG2-A'], specialization: 'رياض أطفال', joinDate: '2023-01-15', active: true },
  { id: 4, name: 'أ. هيا الشمري',   avatar: '👩‍🏫', phone: '0501122334', email: 'haya@rawdah.sa',     assignedClasses: ['KG2-B'], specialization: 'فنون وحرف',  joinDate: '2023-09-01', active: true },
  { id: 5, name: 'أ. ريم الزهراني', avatar: '👩‍🏫', phone: '0505544332', email: 'reem@rawdah.sa',     assignedClasses: [],         specialization: 'رياض أطفال', joinDate: '2024-02-01', active: false },
];

// --- CLASSES ---
const classes = [
  { id: 'KG1-A', name: 'KG1-A', gradeLevel: 'روضة أولى',  capacity: 20, teacherId: 1, color: 'blue'   },
  { id: 'KG1-B', name: 'KG1-B', gradeLevel: 'روضة أولى',  capacity: 20, teacherId: 2, color: 'green'  },
  { id: 'KG2-A', name: 'KG2-A', gradeLevel: 'روضة ثانية', capacity: 18, teacherId: 3, color: 'purple' },
  { id: 'KG2-B', name: 'KG2-B', gradeLevel: 'روضة ثانية', capacity: 18, teacherId: 4, color: 'orange' },
];

// --- STUDENTS ---
const students = [
  { id: 1,  name: 'يونس العمري',      avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-A', parentName: 'أحمد العمري',    phone: '0501111111', present: true,  mood: '😄', note: '', medication: false, meals: { breakfast: 'full', lunch: 'half', snack: 'none' }, potty: ['9:00 ص', '11:30 ص'] },
  { id: 2,  name: 'لينا حسن',         avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-A', parentName: 'حسن الغامدي',    phone: '0502222222', present: true,  mood: '😊', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'half' }, potty: ['10:00 ص'] },
  { id: 3,  name: 'محمد الأحمد',      avatar: '👦', gender: 'ذكر',  age: 5, classId: 'KG1-A', parentName: 'خالد الأحمد',   phone: '0503333333', present: true,  mood: '😐', note: 'يعاني من صداع', medication: true, meals: { breakfast: 'half', lunch: 'none', snack: 'none' }, potty: [] },
  { id: 4,  name: 'سارة العلي',       avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-A', parentName: 'علي الدوسري',    phone: '0504444444', present: false, mood: null, note: '', medication: false, meals: {}, potty: [] },
  { id: 5,  name: 'عمر الرشيد',       avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-A', parentName: 'فهد الرشيد',     phone: '0505555555', present: true,  mood: '😄', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'full' }, potty: ['9:30 ص', '1:00 م'] },
  { id: 6,  name: 'نورة المنصور',     avatar: '👧', gender: 'أنثى', age: 5, classId: 'KG1-A', parentName: 'سعد المنصور',    phone: '0506666666', present: true,  mood: '😊', note: '', medication: false, meals: { breakfast: 'full', lunch: 'half', snack: 'none' }, potty: ['10:30 ص'] },
  { id: 7,  name: 'فيصل الزهراني',    avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-A', parentName: 'ماجد الزهراني', phone: '0507777777', present: true,  mood: '😄', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'half' }, potty: [] },
  { id: 8,  name: 'ريم السالم',       avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-A', parentName: 'تركي السالم',    phone: '0508888888', present: true,  mood: '😊', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'full' }, potty: ['11:00 ص'] },
  { id: 9,  name: 'خالد العتيبي',     avatar: '👦', gender: 'ذكر',  age: 5, classId: 'KG1-A', parentName: 'نواف العتيبي',   phone: '0509999999', present: false, mood: null, note: '', medication: false, meals: {}, potty: [] },
  { id: 10, name: 'دانة الحربي',      avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-A', parentName: 'بدر الحربي',     phone: '0501010101', present: true,  mood: '😄', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'none' }, potty: ['9:00 ص'] },
  { id: 11, name: 'سلطان المالكي',    avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-A', parentName: 'عبدالله المالكي', phone: '0501020304', present: true, mood: '😐', note: '', medication: false, meals: { breakfast: 'half', lunch: 'half', snack: 'none' }, potty: [] },
  { id: 12, name: 'وفاء الشمري',      avatar: '👧', gender: 'أنثى', age: 5, classId: 'KG1-A', parentName: 'محمد الشمري',    phone: '0501030506', present: true, mood: '😊', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'half' }, potty: ['10:00 ص'] },
  { id: 13, name: 'راشد القحطاني',    avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-A', parentName: 'سالم القحطاني',  phone: '0501040708', present: true, mood: '😄', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'full' }, potty: [] },
  { id: 14, name: 'جواهر الدوسري',    avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-A', parentName: 'حمد الدوسري',    phone: '0501050910', present: true, mood: '😊', note: '', medication: true, meals: { breakfast: 'full', lunch: 'half', snack: 'none' }, potty: ['9:30 ص'] },
  { id: 15, name: 'ناصر البلوي',      avatar: '👦', gender: 'ذكر',  age: 5, classId: 'KG1-A', parentName: 'عيسى البلوي',    phone: '0501061112', present: true, mood: '😄', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'half' }, potty: [] },
  { id: 16, name: 'هيا الغامدي',      avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-A', parentName: 'وليد الغامدي',   phone: '0501071314', present: true, mood: '😊', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'full' }, potty: ['10:30 ص'] },
  { id: 17, name: 'بدر المطيري',      avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-A', parentName: 'مطلق المطيري',   phone: '0501081516', present: true, mood: '😄', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'none' }, potty: [] },
  { id: 18, name: 'تغريد السبيعي',    avatar: '👧', gender: 'أنثى', age: 5, classId: 'KG1-A', parentName: 'عادل السبيعي',   phone: '0501091718', present: false, mood: null, note: '', medication: false, meals: {}, potty: [] },
  { id: 19, name: 'عبدالله النعيم',   avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-A', parentName: 'حمزة النعيم',    phone: '0501101920', present: true, mood: '😄', note: '', medication: false, meals: { breakfast: 'full', lunch: 'full', snack: 'full' }, potty: ['11:00 ص'] },
  { id: 20, name: 'هند الزيد',        avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-A', parentName: 'زيد الزيد',      phone: '0501112122', present: true, mood: '😊', note: '', medication: false, meals: { breakfast: 'full', lunch: 'half', snack: 'none' }, potty: [] },
  // KG1-B
  { id: 21, name: 'سلمى الحربي',      avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-B', parentName: 'نايف الحربي',   phone: '0502010203', present: true,  mood: '😄', note: '', medication: false, meals: {}, potty: [] },
  { id: 22, name: 'ركان المطيري',     avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-B', parentName: 'خليل المطيري',  phone: '0502020304', present: true,  mood: '😊', note: '', medication: false, meals: {}, potty: [] },
  { id: 23, name: 'جنى الشهري',       avatar: '👧', gender: 'أنثى', age: 5, classId: 'KG1-B', parentName: 'أحمد الشهري',   phone: '0502030405', present: false, mood: null, note: '', medication: false, meals: {}, potty: [] },
  { id: 24, name: 'تركي الغامدي',     avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-B', parentName: 'فهيد الغامدي',  phone: '0502040506', present: true,  mood: '😄', note: '', medication: true, meals: {}, potty: [] },
  { id: 25, name: 'لمى الزهراني',     avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-B', parentName: 'عصام الزهراني', phone: '0502050607', present: true,  mood: '😊', note: '', medication: false, meals: {}, potty: [] },
  { id: 26, name: 'يزيد القرني',      avatar: '👦', gender: 'ذكر',  age: 5, classId: 'KG1-B', parentName: 'سعيد القرني',   phone: '0502060708', present: true,  mood: '😐', note: '', medication: false, meals: {}, potty: [] },
  { id: 27, name: 'أميرة الدوسري',   avatar: '👧', gender: 'أنثى', age: 4, classId: 'KG1-B', parentName: 'منصور الدوسري', phone: '0502070809', present: true,  mood: '😊', note: '', medication: false, meals: {}, potty: [] },
  { id: 28, name: 'مشاري العتيبي',    avatar: '👦', gender: 'ذكر',  age: 4, classId: 'KG1-B', parentName: 'وليد العتيبي',  phone: '0502080910', present: true,  mood: '😄', note: '', medication: false, meals: {}, potty: [] },
  // KG2-A
  { id: 29, name: 'شيخة السالم',      avatar: '👧', gender: 'أنثى', age: 5, classId: 'KG2-A', parentName: 'عمر السالم',     phone: '0503010203', present: true,  mood: '😄', note: '', medication: false, meals: {}, potty: [] },
  { id: 30, name: 'فراس الرشيد',      avatar: '👦', gender: 'ذكر',  age: 6, classId: 'KG2-A', parentName: 'ماهر الرشيد',    phone: '0503020304', present: true,  mood: '😊', note: '', medication: false, meals: {}, potty: [] },
  { id: 31, name: 'بسمة المنصور',     avatar: '👧', gender: 'أنثى', age: 5, classId: 'KG2-A', parentName: 'رضا المنصور',    phone: '0503030405', present: false, mood: null, note: '', medication: true, meals: {}, potty: [] },
  { id: 32, name: 'عبدالرحمن البلوي', avatar: '👦', gender: 'ذكر',  age: 5, classId: 'KG2-A', parentName: 'ياسر البلوي',    phone: '0503040506', present: true,  mood: '😊', note: '', medication: false, meals: {}, potty: [] },
  { id: 33, name: 'نوف الشمري',       avatar: '👧', gender: 'أنثى', age: 6, classId: 'KG2-A', parentName: 'طارق الشمري',    phone: '0503050607', present: true,  mood: '😄', note: '', medication: false, meals: {}, potty: [] },
  { id: 34, name: 'أنس القحطاني',     avatar: '👦', gender: 'ذكر',  age: 5, classId: 'KG2-A', parentName: 'بلال القحطاني',  phone: '0503060708', present: true,  mood: '😐', note: '', medication: false, meals: {}, potty: [] },
  // KG2-B
  { id: 35, name: 'غدير المالكي',     avatar: '👧', gender: 'أنثى', age: 5, classId: 'KG2-B', parentName: 'حاتم المالكي',   phone: '0504010203', present: true,  mood: '😊', note: '', medication: false, meals: {}, potty: [] },
  { id: 36, name: 'معاذ الزهراني',    avatar: '👦', gender: 'ذكر',  age: 6, classId: 'KG2-B', parentName: 'جابر الزهراني',  phone: '0504020304', present: true,  mood: '😄', note: '', medication: false, meals: {}, potty: [] },
  { id: 37, name: 'صفاء الحربي',      avatar: '👧', gender: 'أنثى', age: 5, classId: 'KG2-B', parentName: 'نادر الحربي',    phone: '0504030405', present: false, mood: null, note: '', medication: false, meals: {}, potty: [] },
  { id: 38, name: 'حمد العمري',       avatar: '👦', gender: 'ذكر',  age: 5, classId: 'KG2-B', parentName: 'ابراهيم العمري', phone: '0504040506', present: true,  mood: '😄', note: '', medication: true, meals: {}, potty: [] },
  { id: 39, name: 'ريان الغامدي',     avatar: '👦', gender: 'ذكر',  age: 6, classId: 'KG2-B', parentName: 'حمود الغامدي',   phone: '0504050607', present: true,  mood: '😊', note: '', medication: false, meals: {}, potty: [] },
];

// --- ANNOUNCEMENTS ---
const announcements = [
  { id: 'a1', title: 'رحلة علمية قادمة 🎒', body: 'يوم السبت القادم سنزور متحف الطبيعة. الرجاء إرسال موافقة الولي.', date: 'اليوم', color: 'blue',   target: 'all' },
  { id: 'a2', title: 'تطعيمات الصحة المدرسية 💉', body: 'سيتم تطعيم الأطفال يوم الأحد. يرجى التأكد من السجل الصحي.', date: 'أمس',   color: 'green',  target: 'all' },
  { id: 'a3', title: 'احتفال اليوم الوطني 🇸🇦', body: 'نحتفل هذا الأسبوع باليوم الوطني. يُرجى إرسال الطفل بالزي الوطني.', date: 'منذ يومين', color: 'yellow', target: 'all' },
];

// --- NOTES (student → parent messages) ---
const notes = [
  { id: 'n1', studentId: 1, fromRole: 'teacher', fromName: 'أ. فاطمة السعيد', text: 'يونس اليوم كان رائعاً! شارك بفاعلية في الحصص. نرجو مراجعة واجب الرياضيات 🌟', date: 'اليوم' },
];

// --- ACTIVITY LOG ---
const activityLog = [
  { id: 1, icon: '👦', text: 'تم تسجيل طالب جديد: يونس العمري في KG1-A', time: 'منذ 5 دقائق', type: 'student' },
  { id: 2, icon: '👩‍🏫', text: 'تم تعيين أ. فاطمة السعيد لفصل KG1-A',  time: 'منذ 20 دقيقة', type: 'teacher' },
  { id: 3, icon: '📢', text: 'تم نشر إعلان: رحلة علمية قادمة',         time: 'منذ ساعة',      type: 'announcement' },
  { id: 4, icon: '🏫', text: 'تم إنشاء فصل جديد: KG2-B',              time: 'منذ 3 ساعات',   type: 'class' },
];

module.exports = { users, teachers, classes, students, announcements, notes, activityLog };
