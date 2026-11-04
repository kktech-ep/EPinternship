import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  ArrowRight, 
  Printer, 
  FileText, 
  Upload, 
  Camera, 
  Calendar, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Eye, 
  Smartphone, 
  HelpCircle, 
  Image as ImageIcon,
  Award,
  Bell,
  User,
  Navigation,
  Search,
  BarChart3,
  Home,
  GraduationCap,
  Send,
  History,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { Student, Company, WeeklySubmission } from '../types';
import { StudentAvatar } from '../components/StudentAvatar';

interface MobileSimViewProps {
  currentRole: 'student' | 'teacher';
  onChangeRole: (role: 'student' | 'teacher') => void;
  student: Student;
  companies: Company[];
  submissions: Record<string, WeeklySubmission[]>;
  onOpenForm1: () => void;
  onOpenForm2: () => void;
  onOpenForm3: (studentId?: string) => void;
  onNavigateA4: (studentId?: string) => void;
  onOpenSheetsModal: () => void;
  onOpenLookerModal: () => void;
}

export const MobileSimView: React.FC<MobileSimViewProps> = ({
  currentRole,
  onChangeRole,
  student,
  companies,
  submissions,
  onOpenForm1,
  onOpenForm2,
  onOpenForm3,
  onNavigateA4,
  onOpenSheetsModal,
  onOpenLookerModal,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'student' | 'form' | 'history' | 'help'>('home');
  const [activeTeacherFilter, setActiveTeacherFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const studentSubs = submissions[student.id] || [];

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6 print:hidden">
      {/* Role switch pill for mobile view */}
      <div className="mb-4 flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-xs">
        <span className="text-slate-500 font-medium">สลับมุมมองหน้าจอมือถือ:</span>
        <button
          onClick={() => onChangeRole('student')}
          className={`px-3 py-1 rounded-full font-bold transition ${
            currentRole === 'student' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          นักศึกษา (Screenshot 5)
        </button>
        <button
          onClick={() => onChangeRole('teacher')}
          className={`px-3 py-1 rounded-full font-bold transition ${
            currentRole === 'teacher' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ครูนิเทศก์ (Screenshot 6)
        </button>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div className="w-full max-w-[430px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 relative">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 mr-3"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
        </div>

        {/* Inner Phone Screen */}
        <div className="w-full bg-slate-50 rounded-[36px] overflow-hidden min-h-[820px] flex flex-col justify-between pt-7 relative border border-slate-200 text-slate-800">
          {/* Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 text-xs">
            {currentRole === 'student' ? (
              /* SCREENSHOT 5: STUDENT MOBILE VIEW */
              <>
                {/* Mobile Top Header */}
                <div className="flex items-center justify-between pt-1 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src="./assets/aistudio/unnamed_54baf6fc.jpg"
                        alt="KKTECH Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-xs leading-none text-slate-900">KKTECH ช่างไฟฟ้า</div>
                      <div className="text-[10px] text-slate-500">@kktech.ac.th</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Bell className="w-4 h-4 text-slate-500" />
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                      ธส
                    </div>
                  </div>
                </div>

                {/* Student Profile Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-3">
                    <StudentAvatar
                      student={student}
                      size="md"
                      showUploadButton={false}
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{student.name}</h3>
                      <div className="text-[10px] text-slate-500">
                        {student.level} • รหัสนักศึกษา: {student.studentCode} • ห้อง {student.room}
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <MapPin className="w-3 h-3 text-sky-600" />
                      <span>{student.companyName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>ครูนิเทศก์: {student.supervisorTeacher}</span>
                      <span className="text-emerald-700 font-semibold">• พิกัด GPS ตรวจยืนยันแล้ว</span>
                    </div>
                  </div>

                  {/* Hours Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-600" /> สะสมชั่วโมงฝึกงานวิชาชีพ
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {student.accumulatedHours} / {student.requiredHours} ชม.
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(student.accumulatedHours / student.requiredHours) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>ผ่านไปแล้ว 8 จาก 18 สัปดาห์</span>
                      <span className="text-emerald-700 font-semibold">สำเร็จ 80% (ตามเกณฑ์)</span>
                    </div>
                  </div>
                </div>

                {/* Current Urgent Task Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-md space-y-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                      ภารกิจปัจจุบัน • กำหนดส่ง 17:00 น. วันนี้
                    </span>
                    <span className="text-sky-300 font-mono">สัปดาห์ที่ {student.currentWeek}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white leading-tight">
                      ส่งบันทึกประจำสัปดาห์ & รูปถ่ายปฏิบัติงาน
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      งานติดตั้งตู้ Distribution Board (MDB) & Wiring Control สายวงจรไฟฟ้าโรงงาน
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">
                      📷 ภาพถ่ายหน้างาน (3 ภาพ)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">
                      🛡️ เครื่องมือ & อุปกรณ์ PPE
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">
                      ⏱️ ครบยอด 40 ชม./สัปดาห์
                    </span>
                  </div>

                  <button
                    onClick={onOpenForm2}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>เปิด Google Form #2 เพื่อส่งงาน</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-[10px] text-slate-400 text-center">
                    ระบบจำกัดสิทธิ์เฉพาะบัญชี @kktech.ac.th ข้อมูลลง Google Sheets วิทยาลัยอัตโนมัติ
                  </div>
                </div>

                {/* Company Info Card (Form #1) */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">ข้อมูลสถานประกอบการ</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      ส่งแล้ว
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">สัญญาการฝึกงานและข้อมูลครูพี่เลี้ยงภาคสนาม</p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                    <div>
                      <div className="text-slate-500 text-[10px]">อัปเดตล่าสุด: 15 พ.ค. 2567</div>
                      <div className="font-semibold text-slate-800">พี่เลี้ยง: ช่างเอกชัย พลอยงาม</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={onOpenForm1}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-[10px] transition cursor-pointer"
                      >
                        ดูข้อมูล / แก้ไข
                      </button>
                    </div>
                  </div>
                </div>

                {/* Photo Guidelines Preview Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sky-600" />
                      <span>ตัวอย่างภาพถ่ายหน้างานที่ถูกต้อง</span>
                    </span>
                    <span className="text-[10px] text-slate-400">เกณฑ์เทคนิคขอนแก่น</span>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[10px] text-amber-900">
                    💡 <strong>คำแนะนำ:</strong> ภาพถ่ายต้องเห็นใบหน้าชัดเจนขณะสวมหมวกนิรภัย (Safety Helmet) และแว่นตานิรภัย มองเห็นป้ายชื่อตู้ควบคุมหรือหม้อแปลงชัดเจน และหลีกเลี่ยงมุมถ่ายย้อนแสง
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80"
                        alt="ตัวอย่างภาพ"
                        className="w-full h-20 object-cover"
                      />
                      <div className="p-1 text-[9px] text-slate-700 font-medium">ตัวอย่าง: ตรวจสอบสาย (สวม PPE ครบถ้วน)</div>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"
                        alt="ตัวอย่างภาพ"
                        className="w-full h-20 object-cover"
                      />
                      <div className="p-1 text-[9px] text-slate-700 font-medium">ตัวอย่าง: รายละเอียดงาน (เห็นมิเตอร์และฉลาก)</div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons (2 items) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigateA4()}
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 text-left transition"
                  >
                    <FileText className="w-4 h-4 text-sky-600 mb-1" />
                    <div className="font-bold text-slate-900 text-xs">พรีวิวเล่มรายงาน</div>
                    <div className="text-[10px] text-slate-500">แบบฟอร์ม สอศ. ฉบับย่อ</div>
                  </button>

                  <a
                    href="tel:0891234567"
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 text-left transition"
                  >
                    <Phone className="w-4 h-4 text-emerald-600 mb-1" />
                    <div className="font-bold text-slate-900 text-xs">โทรหาครูนิเทศก์</div>
                    <div className="text-[10px] text-slate-500">อ.ทักษิณ (081-987-xxxx)</div>
                  </a>
                </div>

                {/* PEA Hotline Banner */}
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-900">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-rose-200 text-rose-700">
                      <Zap className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="font-bold text-[11px]">สายด่วนเหตุด่วนไฟฟ้า PEA</div>
                      <div className="text-[9px] text-rose-700">ศูนย์บริการ 24 ชม. กรณีเกิดอุบัติเหตุ</div>
                    </div>
                  </div>
                  <a
                    href="tel:1129"
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs"
                  >
                    โทร 1129
                  </a>
                </div>

                {/* Submission History */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">ประวัติการส่งงานล่าสุด</span>
                    <span className="text-[10px] text-slate-400">7 สัปดาห์ก่อนหน้า</span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    {studentSubs.slice(1, 4).map((sub) => (
                      <div
                        key={sub.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">สัปดาห์ที่ {sub.weekNumber}</div>
                          <div className="text-[10px] text-slate-500">{sub.taskTitle.slice(0, 32)}...</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {sub.teacherGrade}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onNavigateA4()}
                    className="w-full py-1.5 text-center text-sky-600 font-semibold text-[11px] hover:underline"
                  >
                    ดูบันทึกประวัติทั้งหมด (7 สัปดาห์) →
                  </button>
                </div>
              </>
            ) : (
              /* SCREENSHOT 6: TEACHER MOBILE VIEW */
              <>
                {/* Header */}
                <div className="flex items-center justify-between pt-1 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src="./assets/aistudio/unnamed_54baf6fc.jpg"
                        alt="KKTECH Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-xs leading-none text-slate-900">KKTECH • ไฟฟ้ากำลัง</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Sheets ซิงค์แล้ว</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <User className="w-4 h-4 text-slate-700" />
                  </div>
                </div>

                {/* Supervisor Badge */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">นายทักษิณ โสภาปิยะ</h3>
                      <span className="text-[10px] text-sky-700 font-medium">
                        ครูนิเทศก์ กลุ่ม ปวส.2 ช่างไฟฟ้ากำลัง (ทวิภาคี)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                      Auto-Sync 2.5 นาที
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 pt-1 text-center border-t border-slate-100">
                    <div className="p-1 rounded bg-slate-50">
                      <div className="font-bold text-slate-900 text-xs">42</div>
                      <div className="text-[9px] text-slate-400">นักศึกษา</div>
                    </div>
                    <div className="p-1 rounded bg-slate-50">
                      <div className="font-bold text-slate-900 text-xs">24</div>
                      <div className="text-[9px] text-slate-400">สถานที่</div>
                    </div>
                    <div className="p-1 rounded bg-slate-50">
                      <div className="font-bold text-emerald-600 text-xs">18</div>
                      <div className="text-[9px] text-emerald-600">เสร็จ (75%)</div>
                    </div>
                    <div className="p-1 rounded bg-slate-50">
                      <div className="font-bold text-amber-600 text-xs">6</div>
                      <div className="text-[9px] text-amber-600">รอสัปดาห์นี้</div>
                    </div>
                  </div>
                </div>

                {/* Form #3 Quick Action Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950 to-indigo-950 text-white shadow-md space-y-2.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-semibold uppercase tracking-wide">
                      Google Form #3 มาตรฐาน สอศ.
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">บันทึกผลการนิเทศหน้างาน & ประเมินสมรรถนะ</h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      พิกัด GPS อัตโนมัติ • ภาพหน้างาน 3-5 ภาพ • ประเมิน PPE & LOTO
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenForm3()}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>เปิดแบบฟอร์มนิเทศฝึกงาน (Google Form #3)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Field Inspection Schedule Today */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-sky-600" /> แผนลงพื้นที่วันนี้
                    </span>
                    <span className="text-[10px] text-slate-400">สัปดาห์ที่ 8 • โซน อ.เมือง</span>
                  </div>

                  {/* Target 1 */}
                  <div className="p-3 rounded-xl border border-sky-300 bg-sky-50/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">เป้าหมายที่ 1 (กำลังดำเนินการ)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        นัดหมาย 13:30 น.
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-xs">การไฟฟ้าส่วนภูมิภาค สาขาขอนแก่น...</div>
                      <div className="text-[10px] text-slate-500">ถ.ประชาสโมสร อ.เมือง จ.ขอนแก่น</div>
                    </div>
                    <div className="text-[10px] text-slate-600 space-y-0.5">
                      <div>นักศึกษา (2 คน): นายธนากร สุริยะแสง, นายกิตติศักดิ์ เจริญศรี</div>
                      <div>พี่เลี้ยง: นายชาญชัย มงคลศรี (วิศวกรไฟฟ้าชำนาญการ)</div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <a
                        href="https://maps.google.com/?q=16.4367,102.8415"
                        target="_blank"
                        rel="noreferrer"
                        className="py-1 px-2 rounded-lg bg-sky-600 text-white text-[10px] font-medium text-center flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> นำทาง
                      </a>
                      <a
                        href="tel:043221987"
                        className="py-1 px-2 rounded-lg border border-slate-300 text-slate-700 text-[10px] font-medium text-center flex items-center justify-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> โทรหา
                      </a>
                      <button
                        onClick={() => onOpenForm3('std-1')}
                        className="py-1 px-2 rounded-lg bg-slate-900 text-white text-[10px] font-medium text-center flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ประเมิน
                      </button>
                    </div>
                  </div>

                  {/* Target 2 */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400">เป้าหมายถัดไป (15:30 น.)</span>
                      <div className="font-semibold text-slate-800">บจก. ไทยเพาเวอร์ คอนโทรล ขอนแก่น</div>
                    </div>
                    <span className="text-sky-600 font-semibold text-[10px]">เส้นทาง 8.5 กม.</span>
                  </div>
                </div>

                {/* Student Evaluation List */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">ตรวจสมุดบันทึก & สมรรถนะ</span>
                    <span className="text-[10px] text-sky-700 font-semibold">อัปเดตสัปดาห์ 8</span>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 text-[10px]">
                    <button
                      onClick={() => setActiveTeacherFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        activeTeacherFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      ทั้งหมด (42)
                    </button>
                    <button
                      onClick={() => setActiveTeacherFilter('pending')}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        activeTeacherFilter === 'pending' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      รอตรวจคะแนน (6)
                    </button>
                    <button
                      onClick={() => setActiveTeacherFilter('completed')}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        activeTeacherFilter === 'completed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      ตรวจเสร็จแล้ว (36)
                    </button>
                  </div>

                  {/* Student cards in mobile view */}
                  <div className="space-y-2">
                    {/* Std 1 */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                            ธส
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">นายธนากร สุริยะแสง</div>
                            <div className="text-[9px] text-slate-400">รหัส 65301040018 • ปวส.2/1</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          รอประเมิน
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600">
                        <div>สถานที่: กฟภ. ขอนแก่น (PEA)</div>
                        <div>งาน: ติดตั้งตู้ MDB & Wiring (ครบ 40 ชม. + รูป 3 ภาพ)</div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => onOpenForm3('std-1')}
                          className="flex-1 py-1.5 rounded-lg bg-sky-600 text-white text-[10px] font-bold text-center"
                        >
                          ดูรูปหน้างาน & ให้คะแนน
                        </button>
                        <button
                          onClick={() => onNavigateA4('std-1')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-[10px]"
                        >
                          พิมพ์ A4
                        </button>
                      </div>
                    </div>

                    {/* Std 2 */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                            กศ
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">นายกิตติศักดิ์ เจริญศรี</div>
                            <div className="text-[9px] text-slate-400">รหัส 66301040012 • ปวส.2/1</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          ตรวจแล้ว 19.5/20
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safety Checklist */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>เกณฑ์ความปลอดภัยทางไฟฟ้า (Safety Checklist)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> หมวกนิรภัย (Hard Hat)
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ถุงมือฉนวนแรงสูง
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> รองเท้าเซฟตี้ ESD
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ขั้นตอน Lockout/Tagout
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Mobile Navigation Bar */}
          <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-medium text-slate-500 shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'home' ? 'text-sky-600 font-bold' : 'hover:text-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>หน้าแรก</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('student');
                onChangeRole('student');
              }}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'student' ? 'text-sky-600 font-bold' : 'hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>ส่วนนักศึกษา</span>
            </button>
            <button
              onClick={currentRole === 'student' ? onOpenForm2 : () => onOpenForm3()}
              className="flex flex-col items-center gap-0.5 text-white bg-slate-900 rounded-full p-2 -mt-4 shadow-md"
            >
              <Send className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => onNavigateA4()}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'history' ? 'text-sky-600 font-bold' : 'hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>ประวัติ/A4</span>
            </button>
            <button
              onClick={onOpenSheetsModal}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'help' ? 'text-sky-600 font-bold' : 'hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ชีตข้อมูล</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
