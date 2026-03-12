// =============================================
// DUMMY DATA - Nursery & Daycare Management System
// =============================================

export const nurseryInfo = {
  name: "Royal Kids Academy",
  logo: "🌸",
  address: "شارع الأمير محمد، الرياض",
};

export const currentChild = {
  id: 1,
  name: "يونس",
  age: 4,
  avatar: "👦",
  class: "KG1-A",
  parentName: "أحمد العمري",
};

export const todayReport = {
  date: "الخميس، 12 مارس 2026",
  attendance: {
    arrived: true,
    arrivalTime: "8:30 ص",
    departureTime: null,
  },
  mood: { emoji: "😄", label: "مبسوط" },
  academic: [
    { subject: "اللغة العربية", lesson: "حرف الباء", homework: "كتابة حرف الباء 5 مرات" },
    { subject: "الرياضيات", lesson: "الأرقام 1-10", homework: "تلوين الأرقام في الكتاب" },
    { subject: "اللغة الإنجليزية", lesson: "Colors", homework: "لا يوجد" },
    { subject: "التربية الإسلامية", lesson: "سورة الفاتحة", homework: "مراجعة السورة مع الأهل" },
  ],
  meals: {
    breakfast: { status: "full", label: "أكل الوجبة كاملة", percentage: 100 },
    lunch: { status: "half", label: "أكل نصها", percentage: 50 },
    snack: { status: "none", label: "لم يأكل", percentage: 0 },
  },
  potty: ["9:00 ص", "11:30 ص", "1:00 م", "3:30 م"],
  behavior: {
    withPeers: 4,
    withTeachers: 5,
    overall: "ممتاز",
  },
  teacherNote:
    "يونس اليوم كان رائعاً! شارك بفاعلية في الحصص وساعد زملاءه. نلاحظ تحسناً كبيراً في مهارات القراءة. نرجو مراجعة واجب الرياضيات معه في البيت 🌟",
};

export const announcements = [
  {
    id: 1,
    title: "رحلة علمية قادمة 🎒",
    body: "يوم السبت القادم سنزور متحف الطبيعة. الرجاء إرسال موافقة الولي.",
    date: "اليوم",
    color: "blue",
    target: "all",
  },
  {
    id: 2,
    title: "تطعيمات الصحة المدرسية 💉",
    body: "سيتم تطعيم الأطفال يوم الأحد. يرجى التأكد من السجل الصحي.",
    date: "أمس",
    color: "green",
    target: "all",
  },
  {
    id: 3,
    title: "احتفال اليوم الوطني 🇸🇦",
    body: "نحتفل هذا الأسبوع باليوم الوطني. يُرجى إرسال الطفل بالزي الوطني.",
    date: "منذ يومين",
    color: "yellow",
    target: "all",
  },
];

// =============================================
// TEACHERS DATA (expanded)
// =============================================
export const teacher = {
  name: "أ. فاطمة السعيد",
  avatar: "👩‍🏫",
  classes: ["KG1-A", "KG1-B", "KG2-A"],
  currentClass: "KG1-A",
};

export const teachers = [
  { id: 1, name: "أ. فاطمة السعيد", avatar: "👩‍🏫", phone: "0501234567", email: "fatima@rawdah.sa", assignedClasses: ["KG1-A"], specialization: "رياض أطفال", joinDate: "2022-09-01", active: true },
  { id: 2, name: "أ. نورة القحطاني", avatar: "👩‍🏫", phone: "0507654321", email: "noura@rawdah.sa", assignedClasses: ["KG1-B"], specialization: "تربية خاصة", joinDate: "2021-09-01", active: true },
  { id: 3, name: "أ. سارة المنصور", avatar: "👩‍🏫", phone: "0509876543", email: "sarah@rawdah.sa", assignedClasses: ["KG2-A"], specialization: "رياض أطفال", joinDate: "2023-01-15", active: true },
  { id: 4, name: "أ. هيا الشمري", avatar: "👩‍🏫", phone: "0501122334", email: "haya@rawdah.sa", assignedClasses: ["KG2-B"], specialization: "فنون وحرف", joinDate: "2023-09-01", active: true },
  { id: 5, name: "أ. ريم الزهراني", avatar: "👩‍🏫", phone: "0505544332", email: "reem@rawdah.sa", assignedClasses: [], specialization: "رياض أطفال", joinDate: "2024-02-01", active: false },
];

// =============================================
// CLASSES DATA
// =============================================
export const classes = [
  { id: "KG1-A", name: "KG1-A", gradeLevel: "روضة أولى", capacity: 20, teacherId: 1, studentIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], color: "blue" },
  { id: "KG1-B", name: "KG1-B", gradeLevel: "روضة أولى", capacity: 20, teacherId: 2, studentIds: [21,22,23,24,25,26,27,28], color: "green" },
  { id: "KG2-A", name: "KG2-A", gradeLevel: "روضة ثانية", capacity: 18, teacherId: 3, studentIds: [29,30,31,32,33,34], color: "purple" },
  { id: "KG2-B", name: "KG2-B", gradeLevel: "روضة ثانية", capacity: 18, teacherId: 4, studentIds: [35,36,37,38,39], color: "orange" },
];

// =============================================
// STUDENTS DATA (expanded)
// =============================================
export const students = [
  { id: 1,  name: "يونس العمري",      avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-A", parentName: "أحمد العمري",    phone: "0501111111", present: true,  mood: "😄", note: "", medication: false },
  { id: 2,  name: "لينا حسن",         avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-A", parentName: "حسن الغامدي",    phone: "0502222222", present: true,  mood: "😊", note: "", medication: false },
  { id: 3,  name: "محمد الأحمد",      avatar: "👦", gender: "ذكر",   age: 5, classId: "KG1-A", parentName: "خالد الأحمد",   phone: "0503333333", present: true,  mood: "😐", note: "يعاني من صداع", medication: true },
  { id: 4,  name: "سارة العلي",       avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-A", parentName: "علي الدوسري",    phone: "0504444444", present: false, mood: null, note: "", medication: false },
  { id: 5,  name: "عمر الرشيد",       avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-A", parentName: "فهد الرشيد",     phone: "0505555555", present: true,  mood: "😄", note: "", medication: false },
  { id: 6,  name: "نورة المنصور",     avatar: "👧", gender: "أنثى",  age: 5, classId: "KG1-A", parentName: "سعد المنصور",    phone: "0506666666", present: true,  mood: "😊", note: "", medication: false },
  { id: 7,  name: "فيصل الزهراني",    avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-A", parentName: "ماجد الزهراني", phone: "0507777777", present: true,  mood: "😄", note: "", medication: false },
  { id: 8,  name: "ريم السالم",       avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-A", parentName: "تركي السالم",    phone: "0508888888", present: true,  mood: "😊", note: "", medication: false },
  { id: 9,  name: "خالد العتيبي",     avatar: "👦", gender: "ذكر",   age: 5, classId: "KG1-A", parentName: "نواف العتيبي",   phone: "0509999999", present: false, mood: null, note: "", medication: false },
  { id: 10, name: "دانة الحربي",      avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-A", parentName: "بدر الحربي",     phone: "0501010101", present: true,  mood: "😄", note: "", medication: false },
  { id: 11, name: "سلطان المالكي",    avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-A", parentName: "عبدالله المالكي",phone: "0501020304", present: true,  mood: "😐", note: "", medication: false },
  { id: 12, name: "وفاء الشمري",      avatar: "👧", gender: "أنثى",  age: 5, classId: "KG1-A", parentName: "محمد الشمري",    phone: "0501030506", present: true,  mood: "😊", note: "", medication: false },
  { id: 13, name: "راشد القحطاني",    avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-A", parentName: "سالم القحطاني",  phone: "0501040708", present: true,  mood: "😄", note: "", medication: false },
  { id: 14, name: "جواهر الدوسري",    avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-A", parentName: "حمد الدوسري",    phone: "0501050910", present: true,  mood: "😊", note: "", medication: true },
  { id: 15, name: "ناصر البلوي",      avatar: "👦", gender: "ذكر",   age: 5, classId: "KG1-A", parentName: "عيسى البلوي",    phone: "0501061112", present: true,  mood: "😄", note: "", medication: false },
  { id: 16, name: "هيا الغامدي",      avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-A", parentName: "وليد الغامدي",   phone: "0501071314", present: true,  mood: "😊", note: "", medication: false },
  { id: 17, name: "بدر المطيري",      avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-A", parentName: "مطلق المطيري",   phone: "0501081516", present: true,  mood: "😄", note: "", medication: false },
  { id: 18, name: "تغريد السبيعي",    avatar: "👧", gender: "أنثى",  age: 5, classId: "KG1-A", parentName: "عادل السبيعي",   phone: "0501091718", present: false, mood: null, note: "", medication: false },
  { id: 19, name: "عبدالله النعيم",   avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-A", parentName: "حمزة النعيم",    phone: "0501101920", present: true,  mood: "😄", note: "", medication: false },
  { id: 20, name: "هند الزيد",        avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-A", parentName: "زيد الزيد",      phone: "0501112122", present: true,  mood: "😊", note: "", medication: false },
  // KG1-B
  { id: 21, name: "سلمى الحربي",      avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-B", parentName: "نايف الحربي",    phone: "0502010203", present: true,  mood: "😄", note: "", medication: false },
  { id: 22, name: "ركان المطيري",     avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-B", parentName: "خليل المطيري",   phone: "0502020304", present: true,  mood: "😊", note: "", medication: false },
  { id: 23, name: "جنى الشهري",       avatar: "👧", gender: "أنثى",  age: 5, classId: "KG1-B", parentName: "أحمد الشهري",    phone: "0502030405", present: false, mood: null, note: "", medication: false },
  { id: 24, name: "تركي الغامدي",     avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-B", parentName: "فهيد الغامدي",   phone: "0502040506", present: true,  mood: "😄", note: "", medication: true },
  { id: 25, name: "لمى الزهراني",     avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-B", parentName: "عصام الزهراني",  phone: "0502050607", present: true,  mood: "😊", note: "", medication: false },
  { id: 26, name: "يزيد القرني",      avatar: "👦", gender: "ذكر",   age: 5, classId: "KG1-B", parentName: "سعيد القرني",    phone: "0502060708", present: true,  mood: "😐", note: "", medication: false },
  { id: 27, name: "أميرة الدوسري",   avatar: "👧", gender: "أنثى",  age: 4, classId: "KG1-B", parentName: "منصور الدوسري",  phone: "0502070809", present: true,  mood: "😊", note: "", medication: false },
  { id: 28, name: "مشاري العتيبي",    avatar: "👦", gender: "ذكر",   age: 4, classId: "KG1-B", parentName: "وليد العتيبي",   phone: "0502080910", present: true,  mood: "😄", note: "", medication: false },
  // KG2-A
  { id: 29, name: "شيخة السالم",      avatar: "👧", gender: "أنثى",  age: 5, classId: "KG2-A", parentName: "عمر السالم",     phone: "0503010203", present: true,  mood: "😄", note: "", medication: false },
  { id: 30, name: "فراس الرشيد",      avatar: "👦", gender: "ذكر",   age: 6, classId: "KG2-A", parentName: "ماهر الرشيد",    phone: "0503020304", present: true,  mood: "😊", note: "", medication: false },
  { id: 31, name: "بسمة المنصور",     avatar: "👧", gender: "أنثى",  age: 5, classId: "KG2-A", parentName: "رضا المنصور",    phone: "0503030405", present: false, mood: null, note: "", medication: true },
  { id: 32, name: "عبدالرحمن البلوي", avatar: "👦", gender: "ذكر",   age: 5, classId: "KG2-A", parentName: "ياسر البلوي",    phone: "0503040506", present: true,  mood: "😊", note: "", medication: false },
  { id: 33, name: "نوف الشمري",       avatar: "👧", gender: "أنثى",  age: 6, classId: "KG2-A", parentName: "طارق الشمري",    phone: "0503050607", present: true,  mood: "😄", note: "", medication: false },
  { id: 34, name: "أنس القحطاني",     avatar: "👦", gender: "ذكر",   age: 5, classId: "KG2-A", parentName: "بلال القحطاني",  phone: "0503060708", present: true,  mood: "😐", note: "", medication: false },
  // KG2-B
  { id: 35, name: "غدير المالكي",     avatar: "👧", gender: "أنثى",  age: 5, classId: "KG2-B", parentName: "حاتم المالكي",   phone: "0504010203", present: true,  mood: "😊", note: "", medication: false },
  { id: 36, name: "معاذ الزهراني",    avatar: "👦", gender: "ذكر",   age: 6, classId: "KG2-B", parentName: "جابر الزهراني",  phone: "0504020304", present: true,  mood: "😄", note: "", medication: false },
  { id: 37, name: "صفاء الحربي",      avatar: "👧", gender: "أنثى",  age: 5, classId: "KG2-B", parentName: "نادر الحربي",    phone: "0504030405", present: false, mood: null, note: "", medication: false },
  { id: 38, name: "حمد العمري",       avatar: "👦", gender: "ذكر",   age: 5, classId: "KG2-B", parentName: "ابراهيم العمري", phone: "0504040506", present: true,  mood: "😄", note: "", medication: true },
  { id: 39, name: "ريان الغامدي",     avatar: "👦", gender: "ذكر",   age: 6, classId: "KG2-B", parentName: "حمود الغامدي",   phone: "0504050607", present: true,  mood: "😊", note: "", medication: false },
];

export const moodOptions = [
  { emoji: "😄", label: "سعيد جداً" },
  { emoji: "😊", label: "سعيد" },
  { emoji: "😐", label: "عادي" },
  { emoji: "😢", label: "حزين" },
  { emoji: "😴", label: "نعسان" },
];

// =============================================
// MANAGER DATA
// =============================================
export const manager = {
  name: "م. عبدالله الفيصل",
  avatar: "👨‍💼",
  role: "مدير الحضانه",
};

export const activityLog = [
  { id: 1, icon: "👦", text: "تم تسجيل طالب جديد: يونس العمري في KG1-A", time: "منذ 5 دقائق", type: "student" },
  { id: 2, icon: "👩‍🏫", text: "تم تعيين أ. فاطمة السعيد لفصل KG1-A", time: "منذ 20 دقيقة", type: "teacher" },
  { id: 3, icon: "📢", text: "تم نشر إعلان: رحلة علمية قادمة", time: "منذ ساعة", type: "announcement" },
  { id: 4, icon: "🏫", text: "تم إنشاء فصل جديد: KG2-B", time: "منذ 3 ساعات", type: "class" },
  { id: 5, icon: "✏️", text: "تم تعديل بيانات الطالب: سارة العلي", time: "أمس", type: "student" },
  { id: 6, icon: "👩‍🏫", text: "تم إضافة معلمة جديدة: أ. ريم الزهراني", time: "أمس", type: "teacher" },
  { id: 7, icon: "📢", text: "تم نشر إعلان: تطعيمات الصحة المدرسية", time: "منذ يومين", type: "announcement" },
];
