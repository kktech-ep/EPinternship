import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  Award, 
  BookOpen, 
  Plus, 
  Trash2, 
  Clock, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Image as ImageIcon,
  Building2,
  RefreshCw,
  Edit3,
  Camera,
  Upload,
  X,
  Check,
  Info,
  Eye,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { AuthUser, Student, Form3SupervisionRecord, WeeklySubmission } from '../types';
import { WEEKS_1_TO_15, getCurrentWeekInfo, getWeekDates } from '../data/weeksData';
import { getAllLoginSheetTeachers } from '../services/sheetAuthService';
import { 
  getCoursesByTeacher, 
  getAllTeachersFromData, 
  DATA_SHEET_CONFIG,
  fetchDataSheetCourses,
  fetchPivotSheetCourses
} from '../services/courseDataService';

interface WorkplaceTeachingReportViewProps {
  currentUser?: AuthUser | null;
  students: Student[];
  form3List: Form3SupervisionRecord[];
  submissions: Record<string, WeeklySubmission[]>;
}

export interface TeachingCourseItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  teachDate: string; // YYYY-MM-DD
  teachTime: string; // e.g. "15.00-17.00"
}

export interface GalleryPhotoItem {
  id: string;
  url: string;
  caption: string;
  sourceType: 'supervision' | 'internship' | 'curated' | 'custom';
  sourceTitle: string;
  studentName?: string;
  companyName?: string;
  subjectCode?: string;
}

const POSITION_OPTIONS = [
  'ครูพิเศษสอน',
  'พนักงานราชการครู',
  'ครูผู้ช่วย',
  'ครู',
  'ครู วิทยฐานะครูชำนาญการ',
  'ครู วิทยฐานะครูชำนาญการพิเศษ',
  'ครู วิทยฐานะครูเชี่ยวชาญ'
];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

function formatThaiDateFull(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const month = THAI_MONTHS_FULL[d.getMonth()];
  const yearBE = d.getFullYear() + 543;
  return `${day} ${month} ${yearBE}`;
}

function formatThaiDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const yearBE = (d.getFullYear() + 543) % 100;
  return `${day} ${month} ${yearBE}`;
}

export const WorkplaceTeachingReportView: React.FC<WorkplaceTeachingReportViewProps> = ({
  currentUser,
  students,
  form3List,
  submissions
}) => {
  // 1. Teacher selection (default to logged-in user or "นายทักษิณ โสภาปิยะ")
  const allTeachers = useMemo(() => {
    const list = getAllLoginSheetTeachers();
    const sheetTeacherNames = getAllTeachersFromData();
    const map = new Map<string, string>();
    list.forEach(t => map.set(t.name.trim(), t.name.trim()));
    sheetTeacherNames.forEach(name => {
      const clean = name.trim();
      if (clean && !clean.includes('สุพรรณี')) {
        map.set(clean, clean);
      }
    });
    // Ensure "นายทักษิณ โสภาปิยะ" is present
    if (!map.has('นายทักษิณ โสภาปิยะ')) {
      map.set('นายทักษิณ โสภาปิยะ', 'นายทักษิณ โสภาปิยะ');
    }
    return Array.from(map.values()).sort();
  }, []);

  const defaultTeacher = useMemo(() => {
    if (currentUser?.name && !currentUser.name.includes('นักศึกษา')) {
      const match = allTeachers.find(t => t.includes(currentUser.name) || currentUser.name.includes(t));
      if (match) return match;
    }
    return 'นายทักษิณ โสภาปิยะ';
  }, [currentUser, allTeachers]);

  const [reporterName, setReporterName] = useState<string>(defaultTeacher);
  const [position, setPosition] = useState<string>('ครู วิทยฐานะครูชำนาญการพิเศษ');
  const [specialDuty, setSpecialDuty] = useState<string>('-');
  const [reportDate, setReportDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  const currentWeekCalculated = useMemo(() => {
    return getCurrentWeekInfo().weekNumber || 1;
  }, []);

  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeekCalculated);

  // Generate weeks 1-18 with exact dates
  const weeksList = useMemo(() => {
    return Array.from({ length: 18 }, (_, idx) => {
      const w = idx + 1;
      const dates = getWeekDates(w);
      const start = dates[0];
      const end = dates[4];
      return {
        weekNumber: w,
        label: `สัปดาห์ที่ ${w} (${start.dateStr} - ${end.dateStr})`,
        startDate: start.fullDate,
        endDate: end.fullDate,
        startDay: start.dateStr.split(' ')[0],
        endDay: end.dateStr.split(' ')[0],
        monthStr: start.dateStr.split(' ')[1],
        yearBE: 2569
      };
    });
  }, []);

  const currentWeekMeta = useMemo(() => {
    return weeksList.find(w => w.weekNumber === selectedWeek) || weeksList[0];
  }, [weeksList, selectedWeek]);

  // Course list state - dynamically loaded by teacher
  const [courses, setCourses] = useState<TeachingCourseItem[]>([]);

  // Reload teacher courses whenever selected teacher changes
  useEffect(() => {
    const rawCourses = getCoursesByTeacher(reporterName);
    const defaultDate = new Date().toISOString().slice(0, 10);
    
    if (rawCourses && rawCourses.length > 0) {
      // Group unique subject codes and aggregate rooms
      const map = new Map<string, { code: string; name: string; rooms: Set<string> }>();
      rawCourses.forEach(c => {
        const key = c.subjectCode.trim();
        if (!map.has(key)) {
          map.set(key, { code: key, name: c.subjectName.trim(), rooms: new Set() });
        }
        if (c.room) map.get(key)!.rooms.add(c.room.trim());
      });

      const items: TeachingCourseItem[] = Array.from(map.values()).map((c, idx) => ({
        id: `crs-${idx + 1}-${c.code}`,
        subjectCode: c.code,
        subjectName: c.name,
        room: Array.from(c.rooms).sort().join(', ') || 'สอฟ.2/5, สอฟ.2/6',
        teachDate: defaultDate,
        teachTime: idx === 0 ? '15.00-17.00' : '14.00-19.00'
      }));

      setCourses(items);
    } else {
      // Fallback default courses for นายทักษิณ โสภาปิยะ
      setCourses([
        {
          id: 'crs-1',
          subjectCode: '30000-2005',
          subjectName: 'กิจกรรมในสถานประกอบการ 1',
          room: 'สอฟ.2/7, สอฟ.2/8',
          teachDate: defaultDate,
          teachTime: '15.00-17.00'
        },
        {
          id: 'crs-2',
          subjectCode: '30104-2028',
          subjectName: 'ระบบปรับอากาศในงานอุตสาหกรรม',
          room: 'สอฟ.2/5, สอฟ.2/6',
          teachDate: defaultDate,
          teachTime: '14.00-19.00'
        }
      ]);
    }
  }, [reporterName]);

  const [isSyncingCourses, setIsSyncingCourses] = useState(false);
  const [courseSyncMsg, setCourseSyncMsg] = useState<string | null>(null);

  const handleSyncCoursesFromSheets = async () => {
    setIsSyncingCourses(true);
    try {
      const refreshed = await fetchDataSheetCourses(true);
      const rawCourses = getCoursesByTeacher(reporterName, refreshed);
      if (rawCourses && rawCourses.length > 0) {
        const map = new Map<string, { code: string; name: string; rooms: Set<string> }>();
        rawCourses.forEach(c => {
          const key = c.subjectCode.trim();
          if (!map.has(key)) {
            map.set(key, { code: key, name: c.subjectName.trim(), rooms: new Set() });
          }
          if (c.room) map.get(key)!.rooms.add(c.room.trim());
        });

        const items: TeachingCourseItem[] = Array.from(map.values()).map((c, idx) => ({
          id: `crs-${idx + 1}-${c.code}`,
          subjectCode: c.code,
          subjectName: c.name,
          room: Array.from(c.rooms).sort().join(', ') || 'สอฟ.2/5, สอฟ.2/6',
          teachDate: reportDate,
          teachTime: idx === 0 ? '15.00-17.00' : '14.00-19.00'
        }));
        setCourses(items);
      }
      setCourseSyncMsg('อัปเดตและซิงค์ข้อมูลรายวิชาจาก Google Sheets (data & ตาราง Pivot 1) เรียบร้อย');
      setTimeout(() => setCourseSyncMsg(null), 5000);
    } catch (e: any) {
      setCourseSyncMsg('ซิงค์ข้อมูลไม่สำเร็จ: ' + (e.message || String(e)));
      setTimeout(() => setCourseSyncMsg(null), 5000);
    } finally {
      setIsSyncingCourses(false);
    }
  };

  const handleAddCourse = () => {
    const newId = `crs-${Date.now()}`;
    setCourses(prev => [
      ...prev,
      {
        id: newId,
        subjectCode: '30104-2011',
        subjectName: 'การประมาณการระบบไฟฟ้า',
        room: 'สอฟ.2/5',
        teachDate: reportDate,
        teachTime: '13.00-16.00'
      }
    ]);
  };

  const handleRemoveCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateCourse = (id: string, field: keyof TeachingCourseItem, value: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // 2. Learning Outcomes / ผลที่เกิดจากการจัดการเรียนรู้
  // Max 6 lines, pulled from student daily logs or supervision notes
  const [learningOutcome, setLearningOutcome] = useState<string>(
    'มีความรู้เกี่ยวกับกิจกรรมในสถานประกอบการตามหลักการและกระบวนการ'
  );

  // Auto-summarize from database whenever selected week or teacher changes
  useEffect(() => {
    // 1. Check if Form 3 records exist for this week
    const weekRecords = form3List.filter(r => {
      if (!r.teacherName?.includes(reporterName.replace(/^(นาย|นางสาว|นาง)\s*/, ''))) {
        return false;
      }
      return true;
    });

    const f3WithComments = weekRecords.find(r => r.teacherComment && r.teacherComment.length > 10);

    if (f3WithComments && f3WithComments.teacherComment) {
      const trimmed = f3WithComments.teacherComment.trim();
      setLearningOutcome(`นักศึกษาปฏิบัติงานได้อย่างถูกต้อง ปลอดภัย มีความรู้ความเข้าใจในกระบวนการทำงาน ${trimmed}`);
      return;
    }

    // 2. Check submissions for that week
    const allSubs = Object.values(submissions).flat();
    const weekSubs = allSubs.filter(s => s.weekNumber === selectedWeek);
    if (weekSubs.length > 0 && weekSubs[0].dailyLogs && weekSubs[0].dailyLogs.length > 0) {
      const topLog = weekSubs[0].dailyLogs[0].taskDescription;
      setLearningOutcome(`นักศึกษามีความรู้และทักษะเกี่ยวกับ ${topLog.slice(0, 70)} ตามมาตรฐานวิชาชีพ`);
      return;
    }

    // 3. Week meta default
    const meta = WEEKS_1_TO_15.find(w => w.weekNumber === selectedWeek);
    if (meta) {
      setLearningOutcome(`มีความรู้เกี่ยวกับ${meta.title}ในสถานประกอบการตามหลักการและกระบวนการ`);
    } else {
      setLearningOutcome('มีความรู้เกี่ยวกับกิจกรรมในสถานประกอบการตามหลักการและกระบวนการ');
    }
  }, [selectedWeek, reporterName, form3List, submissions]);

  // -------------------------------------------------------------
  // Dynamic Photo Generator for Page 2 (2x3 Grid)
  // Extracts photos from:
  // 1. Teacher Supervision records (Form 3) matching teacher & students
  // 2. Student Weekly Internship practice submissions for selectedWeek & courses
  // 3. Fallback high-fidelity vocational photos with dynamic course captions
  // -------------------------------------------------------------
  const generateDynamicWeekPhotos = (
    weekNum: number,
    tName: string,
    teacherCourses: TeachingCourseItem[],
    f3Records: Form3SupervisionRecord[],
    allSubmissions: Record<string, WeeklySubmission[]>,
    allStudentsList: Student[]
  ): GalleryPhotoItem[] => {
    const cleanTeacher = (tName || '').replace(/^(นาย|นางสาว|นาง|ดร\.)\s*/, '').trim();

    // Primary & secondary teaching courses
    const c1 = teacherCourses[0] || {
      id: 'crs-1',
      subjectCode: '30000-2005',
      subjectName: 'กิจกรรมในสถานประกอบการ 1',
      room: 'สอฟ.2/7, สอฟ.2/8'
    };
    const c2 = teacherCourses[1] || teacherCourses[0] || {
      id: 'crs-2',
      subjectCode: '30104-2028',
      subjectName: 'ระบบปรับอากาศในงานอุตสาหกรรม',
      room: 'สอฟ.2/5, สอฟ.2/6'
    };

    // Rooms taught by this teacher
    const courseRooms = new Set<string>();
    teacherCourses.forEach(c => {
      if (c.room) {
        c.room.split(/[,/]/).forEach(r => {
          const trimmed = r.trim();
          if (trimmed) courseRooms.add(trimmed);
        });
      }
    });

    // Students related to this teacher (by supervisorTeacher or room)
    let matchedStudents = allStudentsList.filter(s => {
      if (s.supervisorTeacher && s.supervisorTeacher.includes(cleanTeacher)) return true;
      if (s.room) {
        for (const cr of courseRooms) {
          if (s.room.includes(cr) || cr.includes(s.room)) return true;
        }
      }
      return false;
    });

    // If teacher filter returned no direct student matches, fallback to all students to ensure active presentation
    if (matchedStudents.length === 0) {
      matchedStudents = allStudentsList;
    }

    const matchedStudentIds = new Set(matchedStudents.map(s => s.id));
    const matchedStudentCodes = new Set(matchedStudents.map(s => s.studentCode).filter(Boolean));

    // 1. Supervision Photos (form3List)
    const supervisionPhotos: GalleryPhotoItem[] = [];
    const relevantF3 = f3Records.filter(f => {
      if (!f) return false;
      const fTeacherClean = (f.teacherName || '').replace(/^(นาย|นางสาว|นาง|ดร\.)\s*/, '').trim();
      if (fTeacherClean && (fTeacherClean.includes(cleanTeacher) || cleanTeacher.includes(fTeacherClean))) {
        return true;
      }
      if (f.studentId && matchedStudentIds.has(f.studentId)) return true;
      if (f.studentCode && matchedStudentCodes.has(f.studentCode)) return true;
      return false;
    });

    relevantF3.forEach((f3, idx) => {
      if (f3.photos && f3.photos.length > 0) {
        f3.photos.forEach((p, pIdx) => {
          if (p.url && !supervisionPhotos.some(x => x.url === p.url)) {
            const course = idx % 2 === 0 ? c1 : c2;
            const studentPart = f3.studentName ? ` (${f3.studentName})` : '';
            const companyPart = f3.companyName ? ` ณ ${f3.companyName}` : '';
            const caption = p.caption || `ภาพการนิเทศก์การจัดการเรียนรู้บูรณาการ วิชา ${course.subjectCode} ${course.subjectName}${companyPart}${studentPart}`;

            supervisionPhotos.push({
              id: `f3-${f3.id}-${pIdx}`,
              url: p.url,
              caption,
              sourceType: 'supervision',
              sourceTitle: `การนิเทศก์: ${f3.companyName || 'สถานประกอบการ'}`,
              studentName: f3.studentName,
              companyName: f3.companyName,
              subjectCode: course.subjectCode
            });
          }
        });
      }
    });

    // 2. Student Weekly Practice Submissions (submissions)
    const currentWeekInternshipPhotos: GalleryPhotoItem[] = [];
    const otherWeekInternshipPhotos: GalleryPhotoItem[] = [];

    matchedStudents.forEach(st => {
      const studentSubs = allSubmissions[st.id] || [];
      studentSubs.forEach(sub => {
        if (sub.photos && sub.photos.length > 0) {
          sub.photos.forEach((p, pIdx) => {
            if (!p.url) return;
            const targetCourse = currentWeekInternshipPhotos.length % 2 === 0 ? c1 : c2;
            const compName = st.companyName || 'สถานประกอบการ';
            const defaultCaption = p.caption || p.title || `การปฏิบัติงานบูรณาการวิชาชีพ วิชา ${targetCourse.subjectCode} โดย ${st.name} (${compName})`;

            const item: GalleryPhotoItem = {
              id: `sub-${sub.id}-${pIdx}`,
              url: p.url,
              caption: defaultCaption,
              sourceType: 'internship',
              sourceTitle: `บันทึกฝึกงาน สัปดาห์ที่ ${sub.weekNumber}: ${st.name}`,
              studentName: st.name,
              companyName: compName,
              subjectCode: targetCourse.subjectCode
            };

            if (sub.weekNumber === weekNum) {
              if (!currentWeekInternshipPhotos.some(x => x.url === p.url)) {
                currentWeekInternshipPhotos.push(item);
              }
            } else {
              if (!otherWeekInternshipPhotos.some(x => x.url === p.url)) {
                otherWeekInternshipPhotos.push(item);
              }
            }
          });
        }
      });
    });

    // 3. Assemble balanced 6 photos
    const result: GalleryPhotoItem[] = [];
    let sIdx = 0;
    let iIdx = 0;

    // Alternate between supervision and student internship photos
    while (result.length < 6 && (sIdx < supervisionPhotos.length || iIdx < currentWeekInternshipPhotos.length)) {
      if (sIdx < supervisionPhotos.length && result.length < 6) {
        result.push(supervisionPhotos[sIdx++]);
      }
      if (iIdx < currentWeekInternshipPhotos.length && result.length < 6) {
        result.push(currentWeekInternshipPhotos[iIdx++]);
      }
    }

    // If still < 6, supplement from other weeks of these same students
    let oIdx = 0;
    while (result.length < 6 && oIdx < otherWeekInternshipPhotos.length) {
      const candidate = otherWeekInternshipPhotos[oIdx++];
      if (!result.some(x => x.url === candidate.url)) {
        result.push(candidate);
      }
    }

    // 4. Curated high-fidelity contextual engineering fallbacks with dynamic teacher & course captions
    const samplePool: { url: string; captionTemplate: (w: number, c1: any, c2: any, t: string) => string }[] = [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        captionTemplate: (w, c1, _c2, t) => `การนิเทศก์และติดตามการจัดการเรียนรู้ รายวิชา ${c1.subjectName} (${c1.subjectCode}) โดยครูนิเทศก์ ${t}`
      },
      {
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        captionTemplate: (w, _c1, c2, _t) => `นักศึกษาฝึกทักษะการตรวจสอบและซ่อมบำรุงระบบไฟฟ้า รายวิชา ${c2.subjectName} (${c2.subjectCode}) สัปดาห์ที่ ${w}`
      },
      {
        url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
        captionTemplate: (w, _c1, _c2, t) => `ครูนิเทศก์ (${t}) ตรวจประเมินมาตรฐานความปลอดภัยและการใช้อุปกรณ์ PPE ประจำสัปดาห์ที่ ${w}`
      },
      {
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        captionTemplate: (_w, c1, _c2, _t) => `การวัดค่าความเป็นฉนวนและทดสอบทางวิศวกรรมไฟฟ้าตามแผนการสอนบูรณาการ รายวิชา ${c1.subjectCode}`
      },
      {
        url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        captionTemplate: (_w, _c1, c2, _t) => `การสรุปบันทึกการเรียนรู้และการแก้ปัญหาหน้างานจริงร่วมกับครูฝึกสถานประกอบการ รายวิชา ${c2.subjectCode}`
      },
      {
        url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
        captionTemplate: (w, _c1, _c2, _t) => `การประเมินผลสัมฤทธิ์ทางการเรียนและการจัดการเรียนการสอนบูรณาการในสถานประกอบการ สัปดาห์ที่ ${w}`
      }
    ];

    let sampleIdx = 0;
    while (result.length < 6) {
      const s = samplePool[sampleIdx % samplePool.length];
      result.push({
        id: `curated-${sampleIdx}`,
        url: s.url,
        caption: s.captionTemplate(weekNum, c1, c2, cleanTeacher || 'ครูนิเทศก์'),
        sourceType: 'curated',
        sourceTitle: 'ภาพการเรียนการสอนบูรณาการวิชาชีพ',
        subjectCode: sampleIdx % 2 === 0 ? c1.subjectCode : c2.subjectCode
      });
      sampleIdx++;
    }

    return result.slice(0, 6);
  };

  // State holding the active 6 photos for Document 2 Page 2
  const [weekPhotos, setWeekPhotos] = useState<GalleryPhotoItem[]>([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingPhotoIdx, setEditingPhotoIdx] = useState<number | null>(null);
  const [photoSyncNotice, setPhotoSyncNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-populate when selectedWeek, reporterName, courses, or data change
  useEffect(() => {
    const list = generateDynamicWeekPhotos(
      selectedWeek,
      reporterName,
      courses,
      form3List,
      submissions,
      students
    );
    setWeekPhotos(list);
  }, [selectedWeek, reporterName, courses, form3List, submissions, students]);

  // Photo source statistics summary
  const photoStats = useMemo(() => {
    const stats = { supervision: 0, internship: 0, curated: 0, custom: 0 };
    weekPhotos.forEach(p => {
      if (p.sourceType === 'supervision') stats.supervision++;
      else if (p.sourceType === 'internship') stats.internship++;
      else if (p.sourceType === 'custom') stats.custom++;
      else stats.curated++;
    });
    return stats;
  }, [weekPhotos]);

  // Handler to manually re-sync photos from database
  const handleAutoPopulatePhotos = () => {
    const list = generateDynamicWeekPhotos(
      selectedWeek,
      reporterName,
      courses,
      form3List,
      submissions,
      students
    );
    setWeekPhotos(list);
    setPhotoSyncNotice(`ดึงรูปภาพจากฐานข้อมูลสำหรับ สัปดาห์ที่ ${selectedWeek} เรียบร้อยแล้ว`);
    setTimeout(() => setPhotoSyncNotice(null), 4000);
  };

  // Handler to update photo caption
  const handleUpdateCaption = (index: number, newCaption: string) => {
    setWeekPhotos(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], caption: newCaption };
      }
      return next;
    });
  };

  // Handler to update photo URL directly
  const handleUpdatePhotoUrl = (index: number, newUrl: string) => {
    setWeekPhotos(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          url: newUrl,
          sourceType: 'custom',
          sourceTitle: 'รูปภาพที่กำหนดเอง'
        };
      }
      return next;
    });
  };

  // Handler for uploading local image file as Data URL
  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleUpdatePhotoUrl(index, result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Loading states for PDF buttons & Preview modal
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'all' | 'doc1' | 'doc2_1' | 'doc2_2'>('all');
  const [previewZoom, setPreviewZoom] = useState<number>(0.85);

  const handleOpenPrintPreview = (tab: 'all' | 'doc1' | 'doc2_1' | 'doc2_2' = 'all') => {
    setPreviewTab(tab);
    setIsPrintPreviewOpen(true);
  };

  // Printable dates formatted in Thai
  const thaiReportDateStr = useMemo(() => formatThaiDateFull(reportDate), [reportDate]);
  const currentWeekDates = useMemo(() => getWeekDates(selectedWeek), [selectedWeek]);
  const startDayFull = currentWeekDates[0]?.fullDate || '19 ตุลาคม 2569';
  const endDayFull = currentWeekDates[4]?.fullDate || '23 ตุลาคม 2569';
  const startDayNum = currentWeekDates[0]?.dateStr.split(' ')[0] || '19';
  const endDayNum = currentWeekDates[4]?.dateStr.split(' ')[0] || '23';
  const monthFull = THAI_MONTHS_FULL[9]; // ตุลาคม or derived from dates

  // BUTTON 1: "พิมพ์บันทึกข้อความรายงานการจัดการเรียนรู้" (1-Page A4 PDF)
  const handlePrintMemoPDF = async () => {
    const el = document.getElementById('memo-printable-page');
    if (!el) {
      window.print();
      return;
    }

    setIsGeneratingMemo(true);
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));

      const fileName = `บันทึกข้อความ_รายงานการสอนบูรณาการ_${reporterName}_สัปดาห์ที่${selectedWeek}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.warn('PDF memo print notice:', err);
      window.print();
    } finally {
      setIsGeneratingMemo(false);
    }
  };

  // BUTTON 2: "พิมพ์รายงานการจัดการเรียนรู้รายสัปดาห์" (2-Page A4 PDF in a single file)
  const handlePrintWeeklyReportPDF = async () => {
    const page1El = document.getElementById('weekly-report-page-1');
    const page2El = document.getElementById('weekly-report-page-2');

    if (!page1El || !page2El) {
      window.print();
      return;
    }

    setIsGeneratingReport(true);
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const maxPdfHeight = pdf.internal.pageSize.getHeight();

      // Render Page 1
      const canvas1 = await html2canvas(page1El, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);
      const height1 = (canvas1.height * pdfWidth) / canvas1.width;
      pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, Math.min(height1, maxPdfHeight));

      // Add Page 2
      pdf.addPage();

      // Render Page 2
      const canvas2 = await html2canvas(page2El, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);
      const height2 = (canvas2.height * pdfWidth) / canvas2.width;
      pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, Math.min(height2, maxPdfHeight));

      const fileName = `รายงานการจัดการเรียนรู้รายสัปดาห์_${reporterName}_สัปดาห์ที่${selectedWeek}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.warn('PDF weekly report print notice:', err);
      window.print();
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // BUTTON 3: "พิมพ์เอกสารทั้งหมด (ครบ 3 หน้า)" (Combined 3-Page A4 PDF in a single file)
  const handlePrintAllDocsPDF = async () => {
    const memoEl = document.getElementById('memo-printable-page');
    const page1El = document.getElementById('weekly-report-page-1');
    const page2El = document.getElementById('weekly-report-page-2');

    if (!memoEl || !page1El || !page2El) {
      window.print();
      return;
    }

    setIsGeneratingAll(true);
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const maxPdfHeight = pdf.internal.pageSize.getHeight();

      // Page 1: Memo
      const canvasMemo = await html2canvas(memoEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgDataMemo = canvasMemo.toDataURL('image/jpeg', 0.98);
      const heightMemo = (canvasMemo.height * pdfWidth) / canvasMemo.width;
      pdf.addImage(imgDataMemo, 'JPEG', 0, 0, pdfWidth, Math.min(heightMemo, maxPdfHeight));

      // Page 2: Weekly Report 1/2
      pdf.addPage();
      const canvas1 = await html2canvas(page1El, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);
      const height1 = (canvas1.height * pdfWidth) / canvas1.width;
      pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, Math.min(height1, maxPdfHeight));

      // Page 3: Weekly Report 2/2 Photos
      pdf.addPage();
      const canvas2 = await html2canvas(page2El, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);
      const height2 = (canvas2.height * pdfWidth) / canvas2.width;
      pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, Math.min(height2, maxPdfHeight));

      const fileName = `เอกสารรายงานการสอนบูรณาการ_ครบชุด3หน้า_${reporterName}_สัปดาห์ที่${selectedWeek}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.warn('PDF combined print notice:', err);
      window.print();
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Helper renderer: Document 1 Memo Page
  const renderMemoContent = (isModal: boolean = false) => (
    <div
      id={isModal ? undefined : "memo-printable-page"}
      className="bg-white text-black font-serif"
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '10mm 20mm 15mm 20mm',
        boxSizing: 'border-box',
        fontFamily: "'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif",
        color: '#000000'
      }}
    >
      {/* Top row: Garuda & Title Center, Receipt Stamp Box Right */}
      <div className="relative mb-2">
        {/* Receipt stamp box on top right - shifted right 1cm (-10mm) */}
        <div 
          className="absolute top-0 border border-black p-2 text-left"
          style={{ 
            right: '-10mm',
            width: '62mm', 
            fontFamily: "'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif",
            fontSize: '13pt', 
            lineHeight: 1.3 
          }}
        >
          <div className="font-bold text-center">ฝ่ายวิชาการ วิทยาลัยเทคนิคขอนแก่น</div>
          <div>เลขรับภายใน...........................................</div>
          <div>วันที่.................................................</div>
          <div>เวลา..................................................</div>
        </div>

        {/* Garuda Emblem + บันทึกข้อความ */}
        <div className="flex flex-col items-start pt-0">
          <img 
            src="/assets/aistudio/pic1_206a0c1e.jpg" 
            alt="ตราครุฑ" 
            className="h-auto object-contain mb-1" 
            style={{ width: '14.4mm' }}
          />
        </div>

        <div className="text-center font-bold text-[28pt] tracking-wide -mt-8 mb-2">
          บันทึกข้อความ
        </div>
      </div>

      {/* Official memo body */}
      <div
        style={{
          fontFamily: "'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif",
          fontSize: '15pt',
          lineHeight: 1.38
        }}
      >
        {/* Header fields */}
        <div className="space-y-1 pt-1">
          <div className="flex items-baseline">
            <span className="font-bold mr-2 whitespace-nowrap">ส่วนราชการ</span>
            <span>ฝ่ายวิชาการ วิทยาลัยเทคนิคขอนแก่น</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline flex-1">
              <span className="font-bold mr-2 whitespace-nowrap">ที่</span>
              <span>แผนกวิชาช่างไฟฟ้ากำลัง</span>
            </div>
            <div className="flex items-baseline mr-10">
              <span className="font-bold mr-2 whitespace-nowrap">วันที่</span>
              <span>{thaiReportDateStr}</span>
            </div>
          </div>

          <div className="flex items-baseline pb-1 border-b border-black">
            <span className="font-bold mr-2 whitespace-nowrap">เรื่อง</span>
            <span>รายงานการจัดการเรียนการสอนบูรณาการในสถานประกอบการ ประจำภาคเรียนที่ 2/2569 (สัปดาห์ที่ {selectedWeek})</span>
          </div>

          <div className="flex items-baseline pt-1">
            <span className="font-bold mr-3 whitespace-nowrap">เรียน</span>
            <span>ผู้อำนวยการวิทยาลัยเทคนิคขอนแก่น</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline">
              <span className="font-bold mr-3 whitespace-nowrap">สิ่งที่ส่งมาด้วย</span>
              <span>รายงานการจัดการเรียนการสอนในสถานประกอบการแบบบูรณาการ</span>
            </div>
            <div className="mr-14">
              <span>จำนวน 1 ชุด</span>
            </div>
          </div>
        </div>

        {/* Paragraph 1 */}
        <div className="mt-3 text-justify indent-[2.5cm] leading-relaxed">
          ตามที่วิทยาลัยเทคนิคขอนแก่น ได้กำหนดแนวปฏิบัติในการจัดตารางเรียน ตารางสอน ปีการศึกษา 2569 โดยรายวิชาฝึกประสบการณ์วิชาชีพ (หลักสูตร 2567) จัดให้มีครูผู้สอนรับผิดชอบรายวิชาให้ครบตามแผนการเรียนที่นำไปจัดสอนและฝึกประสบการณ์อาชีพหรือฝึกงานในสถานประกอบการหรือจัดสอนนอกสถานศึกษา ตามแนวทางของสำนักงานคณะกรรมการการอาชีวศึกษา ให้เป็นชั่วโมงสอนที่ครูผู้สอนได้ทำการสอนทั้งการจัดการเรียนการสอนในรูปแบบออนไลน์ เช่น Google Meet, Google Classroom, Zoom Meeting หรือชั่วโมงการนิเทศผ่านระบบสารสนเทศ
        </div>

        {/* Paragraph 2 & Assigned courses */}
        <div className="mt-2.5 text-justify leading-relaxed">
          <div className="indent-[2.5cm]">
            ข้าพเจ้า <span className="font-bold">{reporterName}</span> ได้รับมอบหมายให้รับผิดชอบสอน
          </div>

          <div className="my-1 pl-[1.5cm] space-y-0.5">
            {courses.map((c, i) => (
              <div key={c.id}>
                {i + 1}. รหัสวิชา <span className="font-bold">{c.subjectCode}</span> รายวิชา <span className="font-bold">{c.subjectName}</span>
              </div>
            ))}
          </div>

          <div>
            ในสถานประกอบการตามแผนการเรียน ปีการศึกษา 2569 ขออนุญาตรายงานการจัดการเรียนการสอนตามแนวปฏิบัติในการจัดตารางเรียน ตารางสอน ประจำภาคเรียนที่ 2/2569 ตามเอกสารที่แนบมาพร้อมนี้
          </div>
        </div>

        {/* Closing */}
        <div className="mt-3 indent-[2.5cm]">
          จึงเรียนมาเพื่อโปรดพิจารณา
        </div>

        {/* Signature Box */}
        <div className="mt-3 flex justify-end">
          <div className="text-center w-[75mm] space-y-0.5">
            <div>ลงชื่อ............................................................</div>
            <div className="font-bold">({reporterName})</div>
            <div>ตำแหน่ง {position}</div>
          </div>
        </div>

        {/* 2 Opinion Boxes (Head of Dept & Head of Curriculum) */}
        <div className="mt-4 grid grid-cols-2 gap-3" style={{ fontSize: '14pt' }}>
          {/* Box 1 */}
          <div className="border border-black p-2 flex flex-col justify-between min-h-[30mm]">
            <div className="space-y-0.5">
              <div className="font-bold text-center border-b border-black pb-0.5">ความเห็นของหัวหน้าแผนกวิชา</div>
              <div className="pt-0.5">( &nbsp; ) เพื่อโปรดพิจารณา</div>
              <div>( &nbsp; ) อื่น ๆ....................................................................</div>
            </div>
            <div className="text-center pt-2">
              <div>(นายกิตติศักดิ์ ทิพบุญชู)</div>
            </div>
          </div>

          {/* Box 2 */}
          <div className="border border-black p-2 flex flex-col justify-between min-h-[30mm]">
            <div className="space-y-0.5">
              <div className="font-bold text-center border-b border-black pb-0.5">ความเห็นของหัวหน้างานพัฒนาหลักสูตรและการจัดการเรียนรู้</div>
              <div className="pt-0.5">( &nbsp; ) เพื่อโปรดพิจารณาทราบ</div>
              <div>( &nbsp; ) อื่น ๆ....................................................................</div>
            </div>
            <div className="text-center pt-2">
              <div>(นายเอกสิทธิ์ ด้วงนิล)</div>
            </div>
          </div>
        </div>

        {/* Deputy Director Box */}
        <div className="mt-2.5 space-y-0.5" style={{ fontSize: '14pt' }}>
          <div className="font-bold underline">ความคิดเห็นของรองผู้อำนวยการฝ่ายวิชาการ</div>
          <div className="flex items-center gap-6 pt-0.5">
            <span>( &nbsp; ) ทราบ</span>
            <span>( &nbsp; ) ปรับปรุง/ข้อเสนอแนะ</span>
            <span>( &nbsp; ) อื่น ๆ ........................................</span>
          </div>

          <div className="pt-2 text-center ml-auto w-[90mm] space-y-0.5">
            <div>ว่าที่ร้อยตรี</div>
            <div>(ไชยา ทับวิธร)</div>
            <div>รองผู้อำนวยการฝ่ายวิชาการ ปฏิบัติหน้าที่แทน</div>
            <div>ผู้อำนวยการวิทยาลัยเทคนิคขอนแก่น</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper renderer: Document 2 Page 1 (Weekly Report Table & Outcomes)
  const renderReportPage1Content = (isModal: boolean = false) => (
    <div
      id={isModal ? undefined : "weekly-report-page-1"}
      className="bg-white text-black p-[18mm] relative"
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        fontFamily: "'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif",
        fontSize: '15pt',
        lineHeight: 1.35,
        color: '#000000'
      }}
    >
      {/* Top Page number */}
      <div className="text-right text-[12pt] text-slate-400 mb-1">
        2
      </div>

      {/* Header Box with College Logo */}
      <div className="border border-black p-3 mb-4 flex items-center gap-4">
        <div className="w-[28mm] flex-shrink-0 flex items-center justify-center border-r border-black pr-3">
          <img 
            src="/assets/aistudio/LogoKKTech_f25116a9.jpg" 
            alt="ตราวิทยาลัยเทคนิคขอนแก่น" 
            className="w-[24mm] h-auto object-contain"
          />
        </div>

        <div className="flex-1 text-center space-y-0.5">
          <div className="font-bold text-[18pt]">วิทยาลัยเทคนิคขอนแก่น</div>
          <div className="font-bold text-[16pt]">รายงานการจัดการเรียนการสอนบูรณาการในสถานประกอบการ</div>
          <div className="font-bold text-[15pt]">ประจำภาคเรียนที่ 2 ปีการศึกษา 2569</div>
          <div className="font-bold text-[14pt]">
            สัปดาห์ที่ {selectedWeek} ระหว่างวันที่ {startDayFull} ถึงวันที่ {endDayFull}
          </div>
        </div>
      </div>

      {/* Teacher info lines */}
      <div className="grid grid-cols-12 gap-y-2 text-[15pt] mb-4">
        <div className="col-span-6 flex items-baseline gap-3">
          <span className="w-24 shrink-0 text-black">ชื่อครูผู้สอน</span>
          <span className="text-black">{reporterName}</span>
        </div>
        <div className="col-span-6 flex items-baseline gap-3">
          <span className="w-20 shrink-0 text-black">ตำแหน่ง</span>
          <span className="text-black">{position}</span>
        </div>

        <div className="col-span-6 flex items-baseline gap-3">
          <span className="w-24 shrink-0 text-black">แผนกวิชา</span>
          <span className="text-black">ช่างไฟฟ้ากำลัง</span>
        </div>
        <div className="col-span-6 flex items-baseline gap-3">
          <span className="w-20 shrink-0 text-black">หน้าที่พิเศษ</span>
          <span className="text-black">{specialDuty || '-'}</span>
        </div>
      </div>

      {/* Table 1: Courses & Teaching Applications */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-black text-center text-[14pt]">
          <thead>
            <tr className="bg-slate-50 font-bold">
              <th className="border border-black p-1.5 w-[12mm]">ลำดับ</th>
              <th className="border border-black p-1.5 w-[25mm]">รหัสวิชา</th>
              <th className="border border-black p-1.5">รายวิชา</th>
              <th className="border border-black p-1.5 w-[28mm]">ห้อง</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, idx) => (
              <tr key={c.id}>
                <td className="border border-black p-1.5">{idx + 1}</td>
                <td className="border border-black p-1.5 font-bold">{c.subjectCode}</td>
                <td className="border border-black p-1.5 text-left px-2">{c.subjectName}</td>
                <td className="border border-black p-1.5">{c.room}</td>
              </tr>
            ))}
            <tr>
              <td className="border border-black p-2 font-bold align-top" colSpan={2}>
                โปรแกรม หรือ Application<br />ที่ใช้ในการสอน
              </td>
              <td className="border border-black p-2 text-left" colSpan={2}>
                <div>1. Google Classroom (ใช้ในการสอน/มอบหมายงาน/ส่งงาน)</div>
                <div>2. Google Meet (ใช้ในการสอนกลุ่มออนไลน์ และนำเสนองาน)</div>
                <div>3. Line (ใช้ในการประสานงาน/แนะนำ)</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Subheader: สัปดาห์ที่ X */}
      <div className="font-bold text-center text-[16pt] my-3">
        สัปดาห์ที่ {selectedWeek}
      </div>

      {/* Table 2: Teaching Schedule */}
      <div className="mb-5">
        <table className="w-full border-collapse border border-black text-center text-[14pt]">
          <thead>
            <tr className="bg-slate-50 font-bold">
              <th className="border border-black p-1.5 w-[28mm]">วัน/เดือน/ปี</th>
              <th className="border border-black p-1.5 w-[26mm]">เวลา</th>
              <th className="border border-black p-1.5 w-[28mm]">รหัสวิชา</th>
              <th className="border border-black p-1.5">กิจกรรมการเรียนการสอน</th>
              <th className="border border-black p-1.5 w-[35mm]">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={`sched-${c.id}`}>
                <td className="border border-black p-1.5">{formatThaiDateShort(c.teachDate)}</td>
                <td className="border border-black p-1.5">{c.teachTime}</td>
                <td className="border border-black p-1.5 font-bold">{c.subjectCode}</td>
                <td className="border border-black p-1.5 text-left px-2">{c.subjectName}</td>
                <td className="border border-black p-1.5">{c.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results / Outcomes */}
      <div className="mt-6 space-y-3">
        <div className="font-bold text-[15pt]">
          ผลที่เกิดจากการจัดการเรียนรู้ (โปรดระบุ)
        </div>
        <div className="indent-[1.5cm] leading-relaxed text-justify px-2 text-[15pt]">
          {learningOutcome}
        </div>
      </div>
    </div>
  );

  // Helper renderer: Document 2 Page 2 (Photo Gallery)
  const renderReportPage2Content = (isModal: boolean = false) => (
    <div
      id={isModal ? undefined : "weekly-report-page-2"}
      className="bg-white text-black p-[18mm] relative"
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        fontFamily: "'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif",
        fontSize: '15pt',
        lineHeight: 1.35,
        color: '#000000'
      }}
    >
      {/* Top Page number */}
      <div className="text-right text-[12pt] text-slate-400 mb-2">
        3
      </div>

      {/* Page Title */}
      <div className="text-center space-y-1 mb-5">
        <div className="font-bold text-[16pt]">
          ประมวลภาพการรายงานการจัดการเรียนการสอนบูรณาการในสถานประกอบการ
        </div>
        <div className="font-bold text-[15pt]">
          ประจำภาคเรียนที่ 2 ปีการศึกษา 2569
        </div>
        <div className="font-bold text-[14pt]">
          สัปดาห์ที่ {selectedWeek} ระหว่างวันที่ {startDayNum} - {endDayNum} {monthFull} พ.ศ. 2569
        </div>
        <div className="text-[13pt] text-slate-800 pt-0.5">
          ครูนิเทศก์: <strong>{reporterName}</strong> &bull; รายวิชาบูรณาการ: {courses.map(c => `${c.subjectCode} ${c.subjectName}`).join(' / ') || 'กิจกรรมในสถานประกอบการ 1'}
        </div>
      </div>

      {/* 2 x 3 Photos Grid */}
      <div 
        className="grid grid-cols-2 border-t border-l border-black" 
        style={{ width: '100%' }}
      >
        {weekPhotos.map((photo, pIdx) => (
          <div 
            key={photo.id || pIdx} 
            className="group relative border-r border-b border-black p-2 flex flex-col items-center justify-between text-center"
            style={{ height: '68mm' }}
          >
            {/* Photo container */}
            <div className="w-full h-[52mm] bg-slate-50 flex items-center justify-center overflow-hidden rounded-xs relative">
              {photo.url ? (
                <img 
                  src={photo.url} 
                  alt={`ภาพที่ ${pIdx + 1}`} 
                  className="w-full h-full object-cover" 
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="p-3 text-[13pt] text-slate-600 leading-tight">
                  รูปภาพจากฐานข้อมูล บันทึกรายงานการนิเทศ<br />หรือ<br />รูปภาพจากฐานข้อมูล ส่งบันทึกปฏิบัติงานประจำสัปดาห์
                </div>
              )}

              {/* Source Badge (Hidden when printing or in modal preview) */}
              {!isModal && (
                <div className="absolute bottom-1 right-1 print:hidden opacity-0 group-hover:opacity-100 transition duration-150">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shadow-sm font-sans font-medium text-white ${
                    photo.sourceType === 'supervision' ? 'bg-purple-600/90' :
                    photo.sourceType === 'internship' ? 'bg-blue-600/90' :
                    photo.sourceType === 'custom' ? 'bg-amber-600/90' :
                    'bg-slate-700/90'
                  }`}>
                    {photo.sourceTitle || (photo.sourceType === 'supervision' ? 'ภาพจากการนิเทศ' : 'ภาพฝึกงาน')}
                  </span>
                </div>
              )}

              {/* Quick Edit Overlay Button (Hidden in Print or Modal) */}
              {!isModal && (
                <div className="absolute top-1 right-1 print:hidden opacity-0 group-hover:opacity-100 transition duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPhotoIdx(pIdx);
                      setIsPhotoModalOpen(true);
                    }}
                    className="p-1 bg-white/90 hover:bg-white text-slate-800 rounded shadow-xs text-[10px] font-sans flex items-center gap-1 cursor-pointer"
                    title="แก้ไขรูปภาพหรือคำอธิบาย"
                  >
                    <Edit3 className="w-3 h-3 text-indigo-600" />
                    <span>แก้ไข</span>
                  </button>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="mt-1 text-[12.5pt] leading-tight text-slate-800 line-clamp-2 w-full px-1 font-normal">
              {photo.caption || `ภาพที่ ${pIdx + 1}: การจัดการเรียนการสอนบูรณาการ`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Control Configuration Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-5 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                รายงานการจัดการเรียนการสอนบูรณาการในสถานประกอบการ (A4 Formatter)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              สัดส่วนมาตรฐานกระดาษราชการ A4 (210mm x 297mm) • แผนกวิชาช่างไฟฟ้ากำลัง วิทยาลัยเทคนิคขอนแก่น
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenPrintPreview('all')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
              title="เปิดภาพตัวอย่างก่อนพิมพ์ของเอกสารที่ 1 และ 2 ทั้งหมด (ครบ 3 หน้า A4) พร้อมสั่งพิมพ์หรือดาวน์โหลด PDF"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>สั่งพิมพ์หรือดาวน์โหลด เอกสาร</span>
            </button>

            <button
              onClick={handlePrintMemoPDF}
              disabled={isGeneratingMemo}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-semibold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
              title="พิมพ์บันทึกข้อความรายงานการจัดการเรียนรู้ แปลงเป็นไฟล์ PDF 1 หน้ากระดาษ A4"
            >
              {isGeneratingMemo ? (
                <>
                  <Loader2 className="w-4 h-4 text-sky-300 animate-spin" />
                  <span>กำลังสร้างบันทึกข้อความ PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-sky-300" />
                  <span>ดาวน์โหลด PDF เอกสารที่ 1</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintWeeklyReportPDF}
              disabled={isGeneratingReport}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
              title="พิมพ์รายงานการจัดการเรียนรู้รายสัปดาห์ แปลงเป็นไฟล์ PDF ไฟล์เดียวกัน 2 หน้ากระดาษ A4"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="w-4 h-4 text-emerald-200 animate-spin" />
                  <span>กำลังสร้างรายงาน 2 หน้า PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>ดาวน์โหลด PDF เอกสารที่ 2</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inputs Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1 text-xs">
          {/* 1. ชื่อผู้รายงาน */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>ชื่อผู้รายงาน:</span>
            </label>
            <select
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {allTeachers.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 2. ตำแหน่ง */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>ตำแหน่ง:</span>
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {POSITION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 3. หน้าที่พิเศษ */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>หน้าที่พิเศษ:</span>
            </label>
            <input
              type="text"
              value={specialDuty}
              onChange={(e) => setSpecialDuty(e.target.value)}
              placeholder="เช่น - หรือ หัวหน้างาน..."
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 4. วันที่รายงาน */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>วันที่รายงาน:</span>
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 5. สัปดาห์ที่รายงาน */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>สัปดาห์ที่รายงาน:</span>
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {weeksList.map(w => (
                <option key={w.weekNumber} value={w.weekNumber}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course dynamic table */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>ข้อมูลรายวิชาสอนในสถานประกอบการ (ซิงค์จากตารางสอน Google Sheets: data & ตาราง Pivot 1):</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncCoursesFromSheets}
                disabled={isSyncingCourses}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition disabled:opacity-60 cursor-pointer"
                title="ซิงค์และอัปเดตรายวิชาจาก Google Sheets (data และ ตาราง Pivot 1) ให้เป็นปัจจุบัน"
              >
                <RefreshCw className={`w-3 h-3 text-emerald-700 ${isSyncingCourses ? 'animate-spin' : ''}`} />
                <span>{isSyncingCourses ? 'กำลังซิงค์ชีต...' : 'ซิงค์ชีตตารางสอน'}</span>
              </button>
              <button
                onClick={handleAddCourse}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>เพิ่มรายวิชา</span>
              </button>
            </div>
          </div>

          {/* Sync notification */}
          {courseSyncMsg && (
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{courseSyncMsg}</span>
            </div>
          )}

          <div className="space-y-2.5 overflow-x-auto">
            {/* Desktop column headers (Strictly aligned with input columns) */}
            <div className="hidden md:grid md:grid-cols-[28px_110px_minmax(160px,1fr)_260px_135px_126px_32px] gap-2.5 px-3 py-1 text-[11px] font-bold text-slate-500 items-center md:min-w-[880px]">
              <span className="text-center">#</span>
              <span>รหัสวิชา</span>
              <span>ชื่อรายวิชา</span>
              <span>กลุ่มเรียน</span>
              <span>วันที่สอน</span>
              <span>ช่วงเวลาสอน</span>
              <span></span>
            </div>

            {courses.map((course, idx) => (
              <div 
                key={course.id} 
                className="flex flex-col md:grid md:grid-cols-[28px_110px_minmax(160px,1fr)_260px_135px_126px_32px] gap-2.5 p-3 bg-slate-50/90 rounded-xl border border-slate-200 text-xs shadow-2xs items-center md:min-w-[880px]"
              >
                {/* 1. # */}
                <div className="flex items-center justify-between md:justify-center">
                  <span className="md:hidden text-[10px] font-semibold text-slate-500">ลำดับ</span>
                  <span className="font-bold text-slate-600 text-center">#{idx + 1}</span>
                </div>

                {/* 2. รหัสวิชา */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 md:hidden">รหัสวิชา</label>
                  <input
                    type="text"
                    value={course.subjectCode}
                    onChange={(e) => handleUpdateCourse(course.id, 'subjectCode', e.target.value)}
                    placeholder="รหัสวิชา"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 3. ชื่อรายวิชา */}
                <div className="min-w-0">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 md:hidden">ชื่อรายวิชา</label>
                  <input
                    type="text"
                    value={course.subjectName}
                    onChange={(e) => handleUpdateCourse(course.id, 'subjectName', e.target.value)}
                    placeholder="ชื่อรายวิชา"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 truncate"
                  />
                </div>

                {/* 4. กลุ่มเรียน */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 md:hidden">กลุ่มเรียน</label>
                  <input
                    type="text"
                    value={course.room}
                    onChange={(e) => handleUpdateCourse(course.id, 'room', e.target.value)}
                    placeholder="กลุ่มเรียน เช่น สอฟ.2/5"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 5. วันที่สอน */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 md:hidden">วันที่สอน</label>
                  <input
                    type="date"
                    value={course.teachDate}
                    onChange={(e) => handleUpdateCourse(course.id, 'teachDate', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 6. ช่วงเวลาสอน: ปรับเป็น 3/4 จาก 168px เหลือ 126px */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 md:hidden">ช่วงเวลาสอน</label>
                  <input
                    type="text"
                    value={course.teachTime}
                    onChange={(e) => handleUpdateCourse(course.id, 'teachTime', e.target.value)}
                    placeholder="เช่น 15.00-17.00 น."
                    title="ช่วงเวลาสอน (เช่น 15.00-17.00 น.)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 7. Action Button */}
                <div className="flex items-center justify-end md:justify-center">
                  {courses.length > 1 ? (
                    <button
                      onClick={() => handleRemoveCourse(course.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                      title="ลบรายวิชา"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="w-4 h-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning outcomes text editor */}
        <div className="pt-2 border-t border-slate-100">
          <label className="font-semibold text-slate-700 text-xs block mb-1">
            ผลที่เกิดจากการจัดการเรียนรู้:
          </label>
          <textarea
            rows={2}
            value={learningOutcome}
            onChange={(e) => setLearningOutcome(e.target.value)}
            className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* DOCUMENT PREVIEWS CONTAINER */}
      <div className="space-y-10 flex flex-col items-center">

        {/* ------------------------------------------------------------- */}
        {/* DOCUMENT 1: MEMORANDUM PAGE (1-PAGE A4)                       */}
        {/* Exact match to Screenshot 2026-11-03 154437                  */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full max-w-[210mm] shadow-lg rounded-sm overflow-hidden bg-white border border-slate-300">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between print:hidden">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>เอกสารที่ 1: บันทึกข้อความรายงานการจัดการเรียนรู้ (1 หน้ากระดาษ A4)</span>
            </span>
            <button
              onClick={() => handleOpenPrintPreview('all')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>สั่งพิมพ์หรือดาวน์โหลด เอกสาร</span>
            </button>
          </div>

          {renderMemoContent(false)}
        </div>


        {/* ------------------------------------------------------------- */}
        {/* DOCUMENT 2: WEEKLY REPORT PAGE 1 (A4)                         */}
        {/* Exact match to Screenshot 2026-11-03 162344                  */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full max-w-[210mm] shadow-lg rounded-sm overflow-hidden bg-white border border-slate-300">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between print:hidden">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>เอกสารที่ 2 (หน้าที่ 1/2): รายงานการจัดการเรียนการสอนบูรณาการในสถานประกอบการ</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">หน้า 1/2</span>
              <button
                onClick={() => handleOpenPrintPreview('all')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>สั่งพิมพ์หรือดาวน์โหลด เอกสาร</span>
              </button>
            </div>
          </div>

          <div
            id="weekly-report-page-1"
            className="bg-white text-black p-[18mm] relative"
            style={{
              width: '210mm',
              minHeight: '297mm',
              margin: '0 auto',
              boxSizing: 'border-box',
              fontFamily: "'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif",
              fontSize: '15pt',
              lineHeight: 1.35,
              color: '#000000'
            }}
          >
            {/* Top Page number */}
            <div className="text-right text-[12pt] text-slate-400 mb-1">
              2
            </div>

            {/* Header Box with College Logo */}
            <div className="border border-black p-3 mb-4 flex items-center gap-4">
              <div className="w-[28mm] flex-shrink-0 flex items-center justify-center border-r border-black pr-3">
                <img 
                  src="/assets/aistudio/LogoKKTech_f25116a9.jpg" 
                  alt="ตราวิทยาลัยเทคนิคขอนแก่น" 
                  className="w-[24mm] h-auto object-contain"
                />
              </div>

              <div className="flex-1 text-center space-y-0.5">
                <div className="font-bold text-[18pt]">วิทยาลัยเทคนิคขอนแก่น</div>
                <div className="font-bold text-[16pt]">รายงานการจัดการเรียนการสอนบูรณาการในสถานประกอบการ</div>
                <div className="font-bold text-[15pt]">ประจำภาคเรียนที่ 2 ปีการศึกษา 2569</div>
                <div className="font-bold text-[14pt]">
                  สัปดาห์ที่ {selectedWeek} ระหว่างวันที่ {startDayFull} ถึงวันที่ {endDayFull}
                </div>
              </div>
            </div>

            {/* Teacher info lines */}
            <div className="grid grid-cols-12 gap-y-2 text-[15pt] mb-4">
              <div className="col-span-6 flex items-baseline gap-3">
                <span className="w-24 shrink-0 text-black">ชื่อครูผู้สอน</span>
                <span className="text-black">{reporterName}</span>
              </div>
              <div className="col-span-6 flex items-baseline gap-3">
                <span className="w-20 shrink-0 text-black">ตำแหน่ง</span>
                <span className="text-black">{position}</span>
              </div>

              <div className="col-span-6 flex items-baseline gap-3">
                <span className="w-24 shrink-0 text-black">แผนกวิชา</span>
                <span className="text-black">ช่างไฟฟ้ากำลัง</span>
              </div>
              <div className="col-span-6 flex items-baseline gap-3">
                <span className="w-20 shrink-0 text-black">หน้าที่พิเศษ</span>
                <span className="text-black">{specialDuty || '-'}</span>
              </div>
            </div>

            {/* Table 1: Courses & Teaching Applications */}
            <div className="mb-4">
              <table className="w-full border-collapse border border-black text-center text-[14pt]">
                <thead>
                  <tr className="bg-slate-50 font-bold">
                    <th className="border border-black p-1.5 w-[12mm]">ลำดับ</th>
                    <th className="border border-black p-1.5 w-[30mm]">รหัสวิชา</th>
                    <th className="border border-black p-1.5">ชื่อวิชา</th>
                    <th className="border border-black p-1.5 w-[42mm]">กลุ่มเรียน</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, idx) => (
                    <tr key={c.id}>
                      <td className="border border-black p-1.5">{idx + 1}</td>
                      <td className="border border-black p-1.5 font-bold">{c.subjectCode}</td>
                      <td className="border border-black p-1.5 text-left px-2">{c.subjectName}</td>
                      <td className="border border-black p-1.5">{c.room}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-black p-2 font-bold align-top" colSpan={2}>
                      โปรแกรม หรือ Application<br />ที่ใช้ในการสอน
                    </td>
                    <td className="border border-black p-2 text-left" colSpan={2}>
                      <div>1. Google Classroom (ใช้ในการสอน/มอบหมายงาน/ส่งงาน)</div>
                      <div>2. Google Meet (ใช้ในการสอนกลุ่มออนไลน์ และนำเสนองาน)</div>
                      <div>3. Line (ใช้ในการประสานงาน/แนะนำ)</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Subheader: สัปดาห์ที่ X */}
            <div className="font-bold text-center text-[16pt] my-3">
              สัปดาห์ที่ {selectedWeek}
            </div>

            {/* Table 2: Teaching Schedule */}
            <div className="mb-5">
              <table className="w-full border-collapse border border-black text-center text-[14pt]">
                <thead>
                  <tr className="bg-slate-50 font-bold">
                    <th className="border border-black p-1.5 w-[28mm]">วัน/เดือน/ปี</th>
                    <th className="border border-black p-1.5 w-[26mm]">เวลา</th>
                    <th className="border border-black p-1.5 w-[28mm]">รหัสวิชา</th>
                    <th className="border border-black p-1.5">กิจกรรมการเรียนการสอน</th>
                    <th className="border border-black p-1.5 w-[35mm]">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={`sched-${c.id}`}>
                      <td className="border border-black p-1.5">{formatThaiDateShort(c.teachDate)}</td>
                      <td className="border border-black p-1.5">{c.teachTime}</td>
                      <td className="border border-black p-1.5 font-bold">{c.subjectCode}</td>
                      <td className="border border-black p-1.5 text-left px-2">{c.subjectName}</td>
                      <td className="border border-black p-1.5">{c.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Results / Outcomes */}
            <div className="mt-6 space-y-3">
              <div className="font-bold text-[15pt]">
                ผลที่เกิดจากการจัดการเรียนรู้ (โปรดระบุ)
              </div>
              <div className="indent-[1.5cm] leading-relaxed text-justify px-2 text-[15pt]">
                {learningOutcome}
              </div>
            </div>
          </div>
        </div>


        {/* ------------------------------------------------------------- */}
        {/* DOCUMENT 2: WEEKLY REPORT PAGE 2 (A4 PHOTO GALLERY)           */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full max-w-[210mm] shadow-lg rounded-sm overflow-hidden bg-white border border-slate-300">
          {/* Header Bar with Quick Stats & Actions */}
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:hidden">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>เอกสารที่ 2 (หน้าที่ 2/2): ประมวลภาพการจัดการเรียนการสอนบูรณาการในสถานประกอบการ</span>
              </span>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                  📸 ภาพการนิเทศ: <strong>{photoStats.supervision}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  🛠️ บันทึกฝึกงาน: <strong>{photoStats.internship}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  📚 บูรณาการวิชาชีพ: <strong>{photoStats.curated}</strong>
                </span>
                {photoStats.custom > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                    ✏️ กำหนดเอง: <strong>{photoStats.custom}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleOpenPrintPreview('all')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>สั่งพิมพ์หรือดาวน์โหลด เอกสาร</span>
              </button>

              <button
                type="button"
                onClick={handleAutoPopulatePhotos}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs transition cursor-pointer"
                title="ดึงรูปภาพล่าสุดจากการนิเทศและบันทึกฝึกงานประจำสัปดาห์นี้จากฐานข้อมูล"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                <span>ดึงรูปอัตโนมัติ</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>จัดการ 6 ภาพ</span>
              </button>
            </div>
          </div>

          {/* Sync Notice Alert */}
          {photoSyncNotice && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center justify-between print:hidden">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {photoSyncNotice}
              </span>
              <button 
                onClick={() => setPhotoSyncNotice(null)} 
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hidden File Input for Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (editingPhotoIdx !== null && e.target.files && e.target.files[0]) {
                handleFileUpload(editingPhotoIdx, e.target.files[0]);
                e.target.value = '';
              }
            }}
          />

          {/* A4 Printable Gallery Page */}
          <div
            id="weekly-report-page-2"
            className="bg-white text-black p-[18mm] relative"
            style={{
              width: '210mm',
              minHeight: '297mm',
              margin: '0 auto',
              boxSizing: 'border-box',
              fontFamily: "'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif",
              fontSize: '15pt',
              lineHeight: 1.35,
              color: '#000000'
            }}
          >
            {/* Top Page number */}
            <div className="text-right text-[12pt] text-slate-400 mb-2">
              3
            </div>

            {/* Page Title */}
            <div className="text-center space-y-1 mb-5">
              <div className="font-bold text-[16pt]">
                ประมวลภาพการรายงานการจัดการเรียนการสอนบูรณาการในสถานประกอบการ
              </div>
              <div className="font-bold text-[15pt]">
                ประจำภาคเรียนที่ 2 ปีการศึกษา 2569
              </div>
              <div className="font-bold text-[14pt]">
                สัปดาห์ที่ {selectedWeek} ระหว่างวันที่ {startDayNum} - {endDayNum} {monthFull} พ.ศ. 2569
              </div>
              <div className="text-[13pt] text-slate-800 pt-0.5">
                ครูนิเทศก์: <strong>{reporterName}</strong> &bull; รายวิชาบูรณาการ: {courses.map(c => `${c.subjectCode} ${c.subjectName}`).join(' / ') || 'กิจกรรมในสถานประกอบการ 1'}
              </div>
            </div>

            {/* 2 x 3 Photos Grid */}
            <div 
              className="grid grid-cols-2 border-t border-l border-black" 
              style={{ width: '100%' }}
            >
              {weekPhotos.map((photo, pIdx) => (
                <div 
                  key={photo.id || pIdx} 
                  className="group relative border-r border-b border-black p-2 flex flex-col items-center justify-between text-center"
                  style={{ height: '68mm' }}
                >
                  {/* Photo container */}
                  <div className="w-full h-[52mm] bg-slate-50 flex items-center justify-center overflow-hidden rounded-xs relative">
                    {photo.url ? (
                      <img 
                        src={photo.url} 
                        alt={`ภาพที่ ${pIdx + 1}`} 
                        className="w-full h-full object-cover" 
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="p-3 text-[13pt] text-slate-600 leading-tight">
                        รูปภาพจากฐานข้อมูล บันทึกรายงานการนิเทศ<br />หรือ<br />รูปภาพจากฐานข้อมูล ส่งบันทึกปฏิบัติงานประจำสัปดาห์
                      </div>
                    )}

                    {/* Source Badge (Hidden when printing/saving PDF) */}
                    <div className="absolute bottom-1 right-1 print:hidden opacity-0 group-hover:opacity-100 transition duration-150">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shadow-sm font-sans font-medium text-white ${
                        photo.sourceType === 'supervision' ? 'bg-purple-600/90' :
                        photo.sourceType === 'internship' ? 'bg-blue-600/90' :
                        photo.sourceType === 'custom' ? 'bg-amber-600/90' :
                        'bg-slate-700/90'
                      }`}>
                        {photo.sourceTitle || (photo.sourceType === 'supervision' ? 'ภาพจากการนิเทศ' : 'ภาพฝึกงาน')}
                      </span>
                    </div>

                    {/* Quick Edit Overlay Button (Hidden in Print) */}
                    <div className="absolute top-1 right-1 print:hidden opacity-0 group-hover:opacity-100 transition duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhotoIdx(pIdx);
                          setIsPhotoModalOpen(true);
                        }}
                        className="p-1 bg-white/90 hover:bg-white text-slate-800 rounded shadow-xs text-[10px] font-sans flex items-center gap-1 cursor-pointer"
                        title="แก้ไขรูปภาพหรือคำอธิบาย"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-600" />
                        <span>แก้ไข</span>
                      </button>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="mt-1 text-[12.5pt] leading-tight text-slate-800 line-clamp-2 w-full px-1 font-normal">
                    {photo.caption || `ภาพที่ ${pIdx + 1}: การจัดการเรียนการสอนบูรณาการ`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PHOTO EDIT & MANAGEMENT MODAL                                 */}
        {/* ------------------------------------------------------------- */}
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 print:hidden">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      จัดการรูปภาพและคำอธิบายประมวลภาพ (6 รูป)
                    </h3>
                    <p className="text-xs text-slate-500">
                      สัปดาห์ที่ {selectedWeek} &bull; ครูนิเทศก์: {reporterName} &bull; วิชา: {courses.map(c => c.subjectCode).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoPopulatePhotos}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs transition cursor-pointer"
                    title="ดึงรูปภาพจากฐานข้อมูลใหม่ตามสัปดาห์"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                    <span>ดึงรูปอัตโนมัติ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhotoModalOpen(false);
                      setEditingPhotoIdx(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: 6 Photo Cards */}
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weekPhotos.map((photo, idx) => (
                    <div 
                      key={photo.id || idx}
                      className={`border rounded-xl p-3.5 transition ${
                        editingPhotoIdx === idx 
                          ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span>ภาพที่ {idx + 1}</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          photo.sourceType === 'supervision' ? 'bg-purple-100 text-purple-700' :
                          photo.sourceType === 'internship' ? 'bg-blue-100 text-blue-700' :
                          photo.sourceType === 'custom' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {photo.sourceTitle || 'ภาพบูรณาการวิชาชีพ'}
                        </span>
                      </div>

                      <div className="flex gap-3 items-start">
                        {/* Thumbnail */}
                        <div className="w-24 h-20 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative group">
                          {photo.url ? (
                            <img 
                              src={photo.url} 
                              alt={`ภาพที่ ${idx + 1}`} 
                              className="w-full h-full object-cover" 
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              ไม่มีรูปภาพ
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPhotoIdx(idx);
                                fileInputRef.current?.click();
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>อัปโหลดรูปภาพ</span>
                            </button>
                            <span className="text-[11px] text-slate-400">หรือวางลิงก์ URL</span>
                          </div>

                          <input
                            type="text"
                            value={photo.url}
                            onChange={(e) => handleUpdatePhotoUrl(idx, e.target.value)}
                            placeholder="URL รูปภาพ (https://...)"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-700"
                          />
                        </div>
                      </div>

                      {/* Caption Input */}
                      <div className="mt-2.5">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          คำอธิบายใต้ภาพ (แสดงในเอกสารหน้าที่ 2):
                        </label>
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => handleUpdateCaption(idx, e.target.value)}
                          placeholder={`คำอธิบายภาพที่ ${idx + 1}...`}
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  รูปภาพและคำอธิบายจะถูกบันทึกเพื่อใช้พิมพ์รายงานและส่งออกเป็น PDF ทันที
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPhotoModalOpen(false);
                    setEditingPhotoIdx(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>บันทึกและปิดหน้าต่าง</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PRINT PREVIEW MODAL (เอกสารที่ 1 และ 2 ครบชุด รวม 3 หน้า A4)    */}
        {/* ------------------------------------------------------------- */}
        {isPrintPreviewOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col print:hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <span>ภาพตัวอย่างก่อนพิมพ์ (Print Preview)</span>
                    <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700">
                      เอกสารที่ 1 และ 2 (ครบ 3 หน้า A4)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    สัปดาห์ที่ {selectedWeek} &bull; ผู้รายงาน: {reporterName} &bull; สัดส่วนกระดาษราชการ A4 (210 &times; 297 mm)
                  </p>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setPreviewTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    previewTab === 'all'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  📑 ทั้งหมด (3 หน้า)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('doc1')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    previewTab === 'doc1'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  📄 หน้า 1: บันทึกข้อความ
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('doc2_1')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    previewTab === 'doc2_1'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  📄 หน้า 2: ตารางสอน (1/2)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('doc2_2')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    previewTab === 'doc2_2'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🖼️ หน้า 3: ประมวลภาพ (2/2)
                </button>
              </div>

              {/* Action Buttons & Zoom */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(prev => Math.max(0.5, Number((prev - 0.1).toFixed(2))))}
                    className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                    title="ย่อขนาด"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-slate-300 font-mono text-[11px] min-w-[38px] text-center">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(prev => Math.min(1.2, Number((prev + 0.1).toFixed(2))))}
                    className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                    title="ขยายขนาด"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(0.85)}
                    className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700 hover:bg-slate-600 rounded text-slate-300 cursor-pointer"
                    title="รีเซ็ตขนาดพอดี"
                  >
                    พอดี
                  </button>
                </div>

                {/* Print button */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  title="สั่งพิมพ์เอกสารทั้งหมด (ครบทั้ง 3 หน้า A4)"
                >
                  <Printer className="w-4 h-4" />
                  <span>สั่งพิมพ์ (Print)</span>
                </button>

                {/* Download combined 3 pages */}
                <button
                  type="button"
                  onClick={handlePrintAllDocsPDF}
                  disabled={isGeneratingAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-60"
                  title="ดาวน์โหลด PDF รวมเอกสารที่ 1 และ 2 ทั้งหมด (3 หน้าในไฟล์เดียว)"
                >
                  {isGeneratingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>กำลังสร้าง PDF 3 หน้า...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-emerald-200" />
                      <span>ดาวน์โหลด PDF รวม (3 หน้า)</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer ml-1"
                  title="ปิดหน้าต่างตัวอย่างก่อนพิมพ์"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Secondary Download Sub-bar */}
            <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">ดาวน์โหลดแยกส่วน:</span>
                <button
                  type="button"
                  onClick={handlePrintMemoPDF}
                  disabled={isGeneratingMemo}
                  className="hover:text-sky-300 underline font-medium cursor-pointer"
                >
                  ดาวน์โหลด PDF เอกสารที่ 1 (บันทึกข้อความ 1 หน้า)
                </button>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={handlePrintWeeklyReportPDF}
                  disabled={isGeneratingReport}
                  className="hover:text-emerald-300 underline font-medium cursor-pointer"
                >
                  ดาวน์โหลด PDF เอกสารที่ 2 (แบบรายงาน 2 หน้า)
                </button>
              </div>
              <span className="text-slate-400 hidden sm:inline">
                สัดส่วนมาตรฐานกระดาษราชการ A4 (210mm &times; 297mm)
              </span>
            </div>

            {/* Preview Body with Scaled Document Pages */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-6 flex flex-col items-center gap-8">
              {/* Page 1 (Memo) */}
              {(previewTab === 'all' || previewTab === 'doc1') && (
                <div className="flex flex-col items-center">
                  <div className="mb-2 text-xs font-bold text-slate-300 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2 shadow-sm">
                    <span className="text-indigo-400">📄 หน้าที่ 1 จาก 3:</span>
                    <span className="text-white">เอกสารที่ 1 - บันทึกข้อความ ขออนุมัติรายงานผลการจัดการเรียนการสอนบูรณาการ</span>
                  </div>
                  <div
                    className="bg-white shadow-2xl rounded-xs overflow-hidden"
                    style={{
                      width: `${210 * previewZoom}mm`,
                      height: `${297 * previewZoom}mm`,
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '210mm',
                        minHeight: '297mm',
                        transform: `scale(${previewZoom})`,
                        transformOrigin: 'top left'
                      }}
                    >
                      {renderMemoContent(true)}
                    </div>
                  </div>
                </div>
              )}

              {/* Page 2 (Weekly Report 1/2) */}
              {(previewTab === 'all' || previewTab === 'doc2_1') && (
                <div className="flex flex-col items-center">
                  <div className="mb-2 text-xs font-bold text-slate-300 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2 shadow-sm">
                    <span className="text-emerald-400">📄 หน้าที่ 2 จาก 3:</span>
                    <span className="text-white">เอกสารที่ 2 (หน้าที่ 1/2) - ตารางสอนและผลการจัดการเรียนรู้บูรณาการ</span>
                  </div>
                  <div
                    className="bg-white shadow-2xl rounded-xs overflow-hidden"
                    style={{
                      width: `${210 * previewZoom}mm`,
                      height: `${297 * previewZoom}mm`,
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '210mm',
                        minHeight: '297mm',
                        transform: `scale(${previewZoom})`,
                        transformOrigin: 'top left'
                      }}
                    >
                      {renderReportPage1Content(true)}
                    </div>
                  </div>
                </div>
              )}

              {/* Page 3 (Weekly Report 2/2 Photos) */}
              {(previewTab === 'all' || previewTab === 'doc2_2') && (
                <div className="flex flex-col items-center">
                  <div className="mb-2 text-xs font-bold text-slate-300 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2 shadow-sm">
                    <span className="text-sky-400">🖼️ หน้าที่ 3 จาก 3:</span>
                    <span className="text-white">เอกสารที่ 2 (หน้าที่ 2/2) - ประมวลภาพการจัดการเรียนการสอนบูรณาการในสถานประกอบการ</span>
                  </div>
                  <div
                    className="bg-white shadow-2xl rounded-xs overflow-hidden"
                    style={{
                      width: `${210 * previewZoom}mm`,
                      height: `${297 * previewZoom}mm`,
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '210mm',
                        minHeight: '297mm',
                        transform: `scale(${previewZoom})`,
                        transformOrigin: 'top left'
                      }}
                    >
                      {renderReportPage2Content(true)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
