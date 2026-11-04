import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  BarChart3, 
  ExternalLink, 
  Upload, 
  Users, 
  Key, 
  Settings, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  Lock,
  Layers,
  Download,
  Server,
  HardDrive,
  FolderArchive,
  FileCode
} from 'lucide-react';
import { Student, Company } from '../types';
import { getCurrentWeekInfo } from '../data/weeksData';
import { 
  wipeAndReplaceFirebaseWithSheetData, 
  syncAllLoginSheetRowsToFirebase,
  getLastSyncInfo
} from '../services/sheetFirebaseSyncService';

interface AdminViewProps {
  students: Student[];
  companies: Company[];
  onOpenSheetsModal: () => void;
  onOpenLookerModal: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  students,
  companies,
  onOpenSheetsModal,
  onOpenLookerModal,
}) => {
  const [syncStatus, setSyncStatus] = useState<string>('เชื่อมต่อสมบูรณ์ (Real-time)');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isWipingAndReplacing, setIsWipingAndReplacing] = useState<boolean>(false);
  const [syncAlert, setSyncAlert] = useState<{ type: 'success' | 'error'; message: string; details?: string } | null>(null);
  const currentWeekInfo = getCurrentWeekInfo();

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncAlert(null);
    try {
      const res = await syncAllLoginSheetRowsToFirebase();
      setSyncStatus(`ซิงค์ข้อมูลล่าสุดเมื่อ ${new Date().toLocaleTimeString('th-TH')}`);
      setSyncAlert({
        type: res.success ? 'success' : 'error',
        message: res.message,
        details: `อัปเดตแล้ว ${res.totalSynced} รายการ (${res.studentsCount} นักศึกษา)`
      });
    } catch (err) {
      setSyncAlert({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล: ' + (err instanceof Error ? err.message : String(err))
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleWipeAndReplace = async () => {
    if (!window.confirm('คุณต้องการลบข้อมูล User ครูนิเทศ และ นักศึกษา ใน Firebase (internship2-2569) เดิมทั้งหมด แล้วนำเข้าจาก Google Sheets แผ่นงาน Login (152 บัญชี) ใช่หรือไม่?')) {
      return;
    }
    setIsWipingAndReplacing(true);
    setSyncAlert(null);
    try {
      const res = await wipeAndReplaceFirebaseWithSheetData();
      setSyncStatus(`อัปเดตสมบูรณ์เมื่อ ${new Date().toLocaleTimeString('th-TH')}`);
      setSyncAlert({
        type: res.success ? 'success' : 'error',
        message: res.message,
        details: `ลบข้อมูลเก่า: ${res.deletedCount} รายการ | นำเข้านักศึกษาใหม่: ${res.insertedStudents} คน | ครูนิเทศก์: ${res.insertedTeachers} ท่าน | ผู้ใช้งาน: ${res.insertedUsers} บัญชี`
      });
    } catch (err) {
      setSyncAlert({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการล้างและนำเข้าข้อมูล: ' + (err instanceof Error ? err.message : String(err))
      });
    } finally {
      setIsWipingAndReplacing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 flex items-center justify-center text-rose-400 font-bold shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">แผงควบคุมระบบ & หัวหน้าแผนกวิชาช่างไฟฟ้า</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                จัดการฐานข้อมูล Google Sheets, มอบหมายครูนิเทศก์, จัดการสิทธิ์ความปลอดภัย และวิเคราะห์สถิติภาพรวม
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="./appserv_publish.zip"
              download="kktech_internship_web_server.zip"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              title="ดาวน์โหลดไฟล์เว็บเพื่อนำไปติดตั้งบน Server จริง (AppServ / Apache)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดเว็บลง Server (.zip)</span>
            </a>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
              <span>{isSyncing ? 'กำลังดึงข้อมูล Sheets...' : 'รีเฟรชข้อมูลคลาวด์'}</span>
            </button>
            <button
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>เปิด Google Sheet หลัก</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Server Publishing & Download Package Section */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1">
                <Server className="w-3 h-3 text-emerald-400" />
                Production Deployment
              </span>
              <span className="text-xs text-slate-400">• สำหรับผู้ดูแลระบบนำไปแสดงผลบน Server จริง</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              ดาวน์โหลดไฟล์เว็บเพจสำหรับนำไปติดตั้งบน Server จริง
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              ดาวน์โหลดแพ็กเกจไฟล์เว็บแบบสมบูรณ์ (.zip) เพื่อนำไปวางใน Web Server ของวิทยาลัย (เช่น AppServ, XAMPP, Apache หรือ IIS) ได้ทันที โดยระบบยังคงเชื่อมต่อฐานข้อมูล Google Cloud Firebase และรองรับระบบล็อกอินอย่างสมบูรณ์
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <FolderArchive className="w-4 h-4 text-amber-400" />
                <span>ไฟล์: <strong className="text-white">appserv_publish.zip</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>ขนาด: <strong className="text-white">~4.6 MB</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span>มีไฟล์ .htaccess & index.html ครบถ้วน</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2">
            <a
              href="./appserv_publish.zip"
              download="kktech_internship_web_server.zip"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์เว็บทั้งหมด (.zip)</span>
            </a>
            <p className="text-[10px] text-slate-400 text-center">
              คลิกเพื่อเริ่มดาวน์โหลดทันที
            </p>
          </div>
        </div>

        {/* 3 Steps instructions inside the card */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="font-bold text-sky-300 text-xs mb-1">ขั้นตอนที่ 1: แตกไฟล์</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              แตกไฟล์ .zip แล้วนำไฟล์ทั้งหมดไปวางในโฟลเดอร์ <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-amber-300">C:\AppServ\www\</code> หรือ <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-amber-300">C:\xampp\htdocs\</code>
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="font-bold text-emerald-300 text-xs mb-1">ขั้นตอนที่ 2: เริ่มการทำงาน</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              เปิดบราวเซอร์แล้วเข้าใช้งานผ่าน <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-emerald-300">http://localhost/</code> หรือ IP เครื่องเซิร์ฟเวอร์ในเครือข่ายวิทยาลัย
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="font-bold text-amber-300 text-xs mb-1">ขั้นตอนที่ 3: ออนไลน์อัตโนมัติ</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ระบบเชื่อมต่อกับ Cloud Firestore แบบเรียลไทม์อัตโนมัติ สามารถบันทึกข้อมูลและส่งรายงานได้ทันที
            </p>
          </div>
        </div>
      </div>

      {/* Sync Alert Banner if triggered */}
      {syncAlert && (
        <div className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 transition ${
          syncAlert.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-start gap-2.5">
            {syncAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">{syncAlert.message}</div>
              {syncAlert.details && (
                <div className="text-[11px] mt-0.5 opacity-90">{syncAlert.details}</div>
              )}
            </div>
          </div>
          <button
            onClick={() => setSyncAlert(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
          >
            ✕ ปิด
          </button>
        </div>
      )}

      {/* Unified Cloud Database Management Card */}
      <div className="bg-white rounded-2xl border border-amber-300 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-700" />
                Firebase Firestore: internship2-2569
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-emerald-700" />
                Google Sheet: login
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                สถานะ: {syncStatus}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              ฐานข้อมูลผู้ใช้งาน (User & Pass) เชื่อมโยงตรงจาก Google Sheets สู่ Firebase Firestore
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              ข้อมูลเก่าถูกล้างออกจาก Firebase (internship2-2569) ทั้งหมดแล้ว และทดแทนด้วยข้อมูลผู้ใช้จริงจาก Google Sheets แผ่นงาน Login: 
              <strong className="text-slate-900"> นักศึกษา 123 คน</strong> (คอลเลกชัน <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">/students</code>) และ 
              <strong className="text-slate-900"> ครูนิเทศก์/ประจำวิชา 37 ท่าน</strong> (คอลเลกชัน <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">/teachers</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">/users</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">/login_sheet</code>)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleWipeAndReplace}
              disabled={isWipingAndReplacing || isSyncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
              title="ลบฐานข้อมูลผู้ใช้เก่าทั้งหมดใน Firebase แล้วนำเข้าใหม่ 152 บัญชีจาก Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isWipingAndReplacing ? 'animate-spin' : ''}`} />
              <span>{isWipingAndReplacing ? 'กำลังล้าง & อัปเดตข้อมูล...' : 'ลบข้อมูลเก่า & นำเข้าใหม่จาก Sheet'}</span>
            </button>
            <button
              onClick={handleManualSync}
              disabled={isSyncing || isWipingAndReplacing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
              <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูล (Real-time)'}</span>
            </button>
          </div>
        </div>

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200">
            <div className="text-[10px] text-amber-800 font-semibold">นักศึกษาในระบบ</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">123 <span className="text-xs font-normal text-slate-500">คน</span></div>
            <div className="text-[10px] text-slate-500">/students collection</div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-200">
            <div className="text-[10px] text-sky-800 font-semibold">ครูนิเทศก์ / ประจำวิชา</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">37 <span className="text-xs font-normal text-slate-500">ท่าน</span></div>
            <div className="text-[10px] text-slate-500">/teachers collection</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="text-[10px] text-emerald-800 font-semibold">ผู้ใช้งานทั้งหมด (Sheet)</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">152 <span className="text-xs font-normal text-slate-500">บัญชี</span></div>
            <div className="text-[10px] text-slate-500">/users & /login_sheet</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200">
            <div className="text-[10px] text-indigo-800 font-semibold">สถานะ Firestore DB</div>
            <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
              <span>เชื่อมต่อสมบูรณ์</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate" title="ai-studio-kktechpowerporta-615d1fa9-e2f4-479e-9581-f8f2f219ee18">
              Database: ai-studio-kktech...
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Systems Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Firebase Firestore Cloud Card */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              Firebase Firestore
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
              Synced Live
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 truncate">internship2-2569</div>
          <p className="text-[11px] text-slate-500">
            Collections: students, companies, submissions
          </p>
          <div className="pt-2">
            <span className="text-amber-700 text-xs font-semibold flex items-center gap-1">
              <span>Data Field พร้อมบันทึกคลาวด์</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" /> Google Sheets API v4
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Connected
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">2,450 เรคคอร์ด</div>
          <p className="text-[11px] text-slate-500">ID: #KK-PWR-2569 (Master Sheet ทวิภาคี)</p>
          <div className="pt-2">
            <button
              onClick={onOpenSheetsModal}
              className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1"
            >
              <span>ตรวจสอบโครงสร้างคอลัมน์</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-sky-600" /> Looker Analytics Service
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800">
              Live Engine
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">อัตราผ่าน 92.4%</div>
          <p className="text-[11px] text-slate-500">ซิงค์สถิติคะแนนสมรรถนะแบบอัตโนมัติ</p>
          <div className="pt-2">
            <button
              onClick={onOpenLookerModal}
              className="text-sky-700 hover:text-sky-800 font-semibold text-xs flex items-center gap-1"
            >
              <span>เปิด Dashboard แบบผู้บริหาร</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600" /> Google SSO Domain Guard
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">@kktech.ac.th</div>
          <p className="text-[11px] text-slate-500">จำกัดสิทธิ์เฉพาะอาจารย์และนักศึกษาในสังกัด</p>
          <div className="pt-2 text-xs text-slate-500">
            ระบบตรวจสอบสิทธิ์ระดับ 2-Factor Authentication
          </div>
        </div>
      </div>

      {/* Roster & Operations Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Teachers and Groups Assignment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">การมอบหมายครูนิเทศก์ประจำกลุ่ม (ปีการศึกษา 2569)</h3>
            <span className="text-xs text-sky-600 font-medium">เพิ่มกลุ่ม</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">นายทักษิณ โสภาปิยะ</div>
                <div className="text-[11px] text-slate-500">กลุ่ม ปวส.2 ช่างไฟฟ้ากำลัง (สอฟ.2/5 และ สอฟ.2/8)</div>
                <div className="text-[10px] text-sky-700 font-medium mt-0.5">ดูแล 42 คน • 24 สถานประกอบการ</div>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                ตรวจแล้ว 75%
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">อาจารย์ประสิทธิ์ วงศ์วิริยะ</div>
                <div className="text-[11px] text-slate-500">กลุ่ม ปวช.3 ช่างไฟฟ้ากำลัง (กลุ่มทวิภาคี)</div>
                <div className="text-[10px] text-sky-700 font-medium mt-0.5">ดูแล 28 คน • 14 สถานประกอบการ</div>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-sky-100 text-sky-800">
                ตรวจแล้ว 80%
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">อาจารย์สมศักดิ์ ว. (หัวหน้าแผนก)</div>
                <div className="text-[11px] text-slate-500">ตรวจสอบคุณภาพและมาตรฐานการประเมินผลกลาง</div>
                <div className="text-[10px] text-slate-500 mt-0.5">รับรองผลคะแนนเพื่อส่งงานทะเบียนวิทยาลัย</div>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
                Super Admin
              </span>
            </div>
          </div>
        </div>

        {/* Right: Terms & Submission Period Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">การตั้งค่ารอบงวดการประเมิน (Current Term)</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              สถานะ: เปิดรับรายงาน
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">ภาคเรียนปัจจุบัน</label>
                <input
                  type="text"
                  defaultValue="ภาคเรียนที่ 2 / 2569"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">งวดสัปดาห์ปัจจุบัน</label>
                <input
                  type="text"
                  defaultValue={`สัปดาห์ที่ ${currentWeekInfo.weekNumber} จาก 18 สัปดาห์ (อ้างอิงเวลาปัจจุบัน)`}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 text-[11px] mb-1">กำหนดเวลาปิดระบบ Google Form ประจำสัปดาห์</label>
              <input
                type="text"
                defaultValue="ทุกวันอาทิตย์ เวลา 23:59 น."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
              />
            </div>

            {/* Google Sheets Connection info */}
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Google Sheets เชื่อมต่อ Form #1</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Active
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Spreadsheet ID: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-900 font-mono text-[10px]">1wQWPpmbFof8HFZjofYz9DKWAYWpe9NngeUUCFdVVt28</code>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-800 font-medium">แผ่นงานเป้าหมาย: Form_1</span>
                <a
                  href="https://docs.google.com/spreadsheets/d/1wQWPpmbFof8HFZjofYz9DKWAYWpe9NngeUUCFdVVt28/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-semibold inline-flex items-center gap-1"
                >
                  <span>เปิด Google Sheets</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>การส่งออกคะแนนสุดท้ายเพื่อตัดเกรด</span>
              </div>
              <p>
                เมื่อสิ้นสุดสัปดาห์ที่ 18 ระบบจะรวมคะแนนจากครูฝึกสถานประกอบการ (50%) + ครูนิเทศก์ (30%) + เล่มรายงาน (20%) เพื่อส่งออกเป็นไฟล์ Excel มาตรฐานงานวัดผล วท.ขอนแก่น
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={onOpenSheetsModal}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
