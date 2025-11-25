import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  LayoutDashboard, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle, 
  XCircle,
  BookOpen,
  Clock,
  Phone,
  Edit3,
  Trash2,
  Search,
  Repeat
} from 'lucide-react';

// --- Helper Functions ---
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  return new Date(d.setDate(diff));
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateStr = (date) => date.toISOString().split('T')[0];

const formatTime = (time) => {
  const [h, m] = time.split(':');
  return `${h}:${m}`;
};

const getDayName = (dayIndex) => {
  const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return days[dayIndex];
};

// --- Mock Data / Initial State ---
const INITIAL_STUDENTS = [
  { 
    id: 1, 
    name: 'Yayu', 
    subject: '鋼琴演奏', 
    rate: 1600, 
    phone: '0912-345-678', 
    note: '拿到全國比賽第一名',
    weeklySchedule: [
      { day: 2, time: '18:30', duration: 2 } // 週二
    ]
  },
  { 
    id: 2, 
    name: '昕', 
    subject: '小提琴', 
    rate: 800, 
    phone: '0987-654-321', 
    note: '世界第一',
    weeklySchedule: [
      { day: 4, time: '19:00', duration: 1.5 } // 週四
    ]
  },
];

const INITIAL_SESSIONS = [
  { id: 101, studentId: 1, date: '2023-10-25', time: '18:30', duration: 2, topic: '高階班', paid: true, feedback: '進步很多' },
  { id: 102, studentId: 2, date: '2023-10-26', time: '19:00', duration: 1.5, topic: '樂理 Unit 3', paid: false, feedback: '' },
  // Generate a session for today for demo
  { id: 103, studentId: 1, date: formatDateStr(new Date()), time: '18:30', duration: 2, topic: '音樂史', paid: false, feedback: '' },
];

// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
    {children}
  </div>
);

const Badge = ({ type, text }) => {
  const colors = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
    neutral: 'bg-gray-100 text-gray-700',
    danger: 'bg-red-100 text-red-600',
    ghost: 'bg-gray-100 text-gray-500 border border-dashed border-gray-300'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || colors.neutral}`}>
      {text}
    </span>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, size = 'md' }) => {
  const baseStyle = "flex items-center justify-center rounded-lg transition-all font-medium";
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm"
  };
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-gray-500 hover:bg-gray-100"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} className={children ? "mr-2" : ""} />}
      {children}
    </button>
  );
};

// --- Main Application ---

export default function App() { // 導出名稱從 TutorMateApp 改為 App
  // --- State ---
  const [activeTab, setActiveTab] = useState('schedule'); // Default to schedule to show new feature
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('tutor_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('tutor_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  // Calendar State
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));

  // Modals State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Forms
  const defaultStudentForm = { name: '', subject: '', rate: '', phone: '', note: '', weeklySchedule: [] };
  const [studentForm, setStudentForm] = useState(defaultStudentForm);
  
  const defaultSessionForm = { studentId: '', date: '', time: '', duration: 1.5, topic: '', paid: false, feedback: '' };
  const [sessionForm, setSessionForm] = useState(defaultSessionForm);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('tutor_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('tutor_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // --- Helpers ---
  const getStudentName = (id) => students.find(stu => stu.id === parseInt(id))?.name || '未知學生';
  
  const getSessionCost = (session) => {
    const s = students.find(stu => stu.id === parseInt(session.studentId));
    return s ? Math.round(s.rate * session.duration) : 0;
  };

  const handleWeekChange = (direction) => {
    setCurrentWeekStart(prev => addDays(prev, direction * 7));
  };

  // --- Handlers ---

  const handleSaveStudent = () => {
    // 為了避免 alert 錯誤，使用 console.error
    if (!studentForm.name || !studentForm.subject) return console.error('請填寫姓名與科目'); 
    
    const newStudent = { 
      ...studentForm, 
      rate: Number(studentForm.rate),
      id: editingId || Date.now() 
    };

    if (editingId) {
      setStudents(students.map(s => s.id === editingId ? newStudent : s));
    } else {
      setStudents([...students, newStudent]);
    }
    setShowStudentModal(false);
    setEditingId(null);
  };

  const handleAddScheduleSlot = () => {
    setStudentForm(prev => ({
      ...prev,
      weeklySchedule: [...(prev.weeklySchedule || []), { day: 1, time: '19:00', duration: 1.5 }]
    }));
  };

  const handleRemoveScheduleSlot = (index) => {
    setStudentForm(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateScheduleSlot = (index, field, value) => {
    setStudentForm(prev => {
      const newSchedule = [...prev.weeklySchedule];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      return { ...prev, weeklySchedule: newSchedule };
    });
  };

  const handleSaveSession = () => {
    if (!sessionForm.studentId || !sessionForm.date) return console.error('請選擇學生與日期');

    const newSession = { 
      ...sessionForm, 
      duration: Number(sessionForm.duration),
      id: editingId || Date.now() 
    };

    if (editingId) {
      setSessions(sessions.map(s => s.id === editingId ? newSession : s));
    } else {
      setSessions([...sessions, newSession]);
    }
    setShowSessionModal(false);
    setEditingId(null);
  };

  const openSessionModal = (session = null, prefill = null) => {
    if (session) {
      setEditingId(session.id);
      setSessionForm(session);
    } else {
      setEditingId(null);
      setSessionForm(prefill || { ...defaultSessionForm, date: formatDateStr(new Date()) });
    }
    setShowSessionModal(true);
  };
  
  // 刪除操作使用自定義模態框取代原來的 confirm
  const handleStudentDelete = (student) => {
    const confirmation = window.prompt(`確定刪除學生 ${student.name} 嗎？輸入 'DELETE' 確認。`);
    if (confirmation === 'DELETE') {
      setStudents(students.filter(s => s.id !== student.id));
      setSessions(sessions.filter(s => s.studentId !== student.id));
    }
  };
  
  const handleSessionDelete = (id) => {
    const confirmation = window.prompt(`確定刪除此課程記錄嗎？輸入 'DELETE' 確認。`);
    if (confirmation === 'DELETE') {
      setSessions(sessions.filter(s => s.id !== id));
      setShowSessionModal(false);
    }
  };


  // --- Views ---

  const WeeklyCalendarView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const endOfWeek = addDays(currentWeekStart, 6);

    return (
      <div className="space-y-4 animate-fade-in h-full flex flex-col">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => handleWeekChange(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20}/></button>
            <h2 className="text-lg font-bold text-gray-800 tabular-nums">
              {currentWeekStart.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })} - {endOfWeek.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
            </h2>
            <button onClick={() => handleWeekChange(1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20}/></button>
            <button onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))} className="text-sm text-indigo-600 font-medium px-3 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100">本週</button>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => openSessionModal()}>新增課程</Button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          {weekDays.map((date) => {
            const dateStr = formatDateStr(date);
            const isToday = dateStr === formatDateStr(new Date());
            const dayOfWeek = date.getDay(); // 0-6

            // 1. Get Actual Sessions for this day
            const daySessions = sessions
              .filter(s => s.date === dateStr)
              .sort((a, b) => a.time.localeCompare(b.time));

            // 2. Get Recurring Templates (Ghosts)
            // Logic: Find all students who have a schedule on this dayOfWeek
            // Filter out if that student ALREADY has a session on this specific date
            const recurringGhosts = students.flatMap(student => {
              if (!student.weeklySchedule) return [];
              return student.weeklySchedule
                .filter(slot => slot.day === dayOfWeek)
                .filter(slot => {
                  // Check if there is already a session for this student on this date
                  // This prevents duplicate showing if the class is already confirmed/created
                  const hasActualSession = daySessions.some(s => parseInt(s.studentId) === student.id);
                  return !hasActualSession;
                })
                .map(slot => ({
                  isGhost: true,
                  studentId: student.id,
                  studentName: student.name,
                  subject: student.subject,
                  time: slot.time,
                  duration: slot.duration,
                  date: dateStr
                }));
            });

            const allItems = [...daySessions, ...recurringGhosts].sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div key={dateStr} className={`flex-1 min-w-[140px] flex flex-col border-b md:border-b-0 md:border-r border-gray-100 last:border-0 ${isToday ? 'bg-blue-50/30' : ''}`}>
                {/* Day Header */}
                <div className={`p-3 text-center border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10 ${isToday ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
                  <div className="text-xs uppercase mb-1">{getDayName(dayOfWeek)}</div>
                  <div className={`text-xl ${isToday ? 'bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-full mx-auto shadow-md' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>

                {/* Sessions List */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[300px] md:max-h-full">
                  {allItems.map((item, idx) => {
                    if (item.isGhost) {
                      return (
                        <div 
                          key={`ghost-${idx}`}
                          onClick={() => openSessionModal(null, {
                            studentId: item.studentId,
                            date: item.date,
                            time: item.time,
                            duration: item.duration,
                            topic: '',
                            paid: false
                          })}
                          className="p-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-400 group-hover:text-indigo-500">{item.time}</span>
                            <Plus size={14} className="text-gray-300 group-hover:text-indigo-500" />
                          </div>
                          <div className="text-sm font-medium text-gray-500 group-hover:text-gray-700">{item.studentName}</div>
                          <div className="text-xs text-gray-400">{item.subject}</div>
                        </div>
                      );
                    }

                    // Actual Session Card
                    const student = students.find(s => s.id === parseInt(item.studentId));
                    return (
                      <div 
                        key={item.id}
                        onClick={() => openSessionModal(item)}
                        className={`p-3 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md relative overflow-hidden ${
                          item.paid ? 'bg-green-50 border-green-100 hover:border-green-300' : 'bg-white border-gray-100 hover:border-indigo-300'
                        }`}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.paid ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                        <div className="flex justify-between items-start mb-1 pl-2">
                          <span className="text-xs font-bold text-gray-600">{item.time}</span>
                          <span className="text-xs text-gray-400">{item.duration}hr</span>
                        </div>
                        <div className="pl-2">
                          <div className="font-bold text-gray-800 text-sm truncate">{student?.name || '未知'}</div>
                          {item.topic && <div className="text-xs text-gray-500 mt-1 truncate">{item.topic}</div>}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Empty State for Day */}
                  {allItems.length === 0 && (
                    <div className="h-20 flex items-center justify-center text-gray-300 text-xs italic">
                      無課程
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const StudentsView = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">學生管理</h2>
        <Button variant="primary" icon={Plus} onClick={() => {
          setStudentForm(defaultStudentForm);
          setEditingId(null);
          setShowStudentModal(true);
        }}>新增學生</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(student => (
          <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-indigo-300 transition-all group relative">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
                <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">{student.subject}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">時薪</div>
                <div className="font-bold text-gray-800">${student.rate}</div>
              </div>
            </div>
            
            {/* Weekly Schedule Preview */}
            {student.weeklySchedule && student.weeklySchedule.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {student.weeklySchedule.map((s, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600">
                    <Clock size={10} className="mr-1" />
                    {getDayName(s.day)} {s.time}
                  </span>
                ))}
              </div>
            )}
            
            <div className="space-y-2 text-sm text-gray-600 mb-4 pt-2 border-t border-gray-50">
              <div className="flex items-center">
                <Phone size={14} className="mr-2 text-gray-400" />
                {student.phone || '無聯絡電話'}
              </div>
              <div className="flex items-start">
                <BookOpen size={14} className="mr-2 mt-0.5 text-gray-400" />
                <span className="line-clamp-2">{student.note || '尚無備註'}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="sm" onClick={() => {
                setEditingId(student.id);
                setStudentForm({ ...defaultStudentForm, ...student });
                setShowStudentModal(true);
              }}>編輯</Button>
              <Button variant="danger" size="sm" onClick={() => handleStudentDelete(student)}>刪除</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BillingView = () => {
    const [filter, setFilter] = useState('unpaid'); 
    const filteredSessions = sessions.filter(s => {
      if (filter === 'paid') return s.paid;
      if (filter === 'unpaid') return !s.paid;
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalUnpaid = sessions
      .filter(s => !s.paid)
      .reduce((sum, s) => sum + getSessionCost(s), 0);

    const incomeThisMonth = sessions
      .filter(s => {
        const d = new Date(s.date);
        const now = new Date();
        return s.paid && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, s) => sum + getSessionCost(s), 0);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-indigo-500 bg-indigo-50/50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-indigo-600 text-sm font-bold">目前待收學費</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">${totalUnpaid.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-3 rounded-full shadow-sm"><DollarSign className="text-indigo-500"/></div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-green-500 bg-green-50/50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-600 text-sm font-bold">本月已入帳</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">${incomeThisMonth.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-3 rounded-full shadow-sm"><CheckCircle className="text-green-500"/></div>
              </div>
            </Card>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">帳務明細</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg text-xs">
              {['unpaid', 'paid', 'all'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                >
                  {f === 'unpaid' ? '未收款' : f === 'paid' ? '已收款' : '全部'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-4 font-medium">日期</th>
                  <th className="p-4 font-medium">學生</th>
                  <th className="p-4 font-medium">金額</th>
                  <th className="p-4 font-medium">狀態</th>
                  <th className="p-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSessions.map(session => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{session.date}</td>
                    <td className="p-4 text-gray-600">
                      {getStudentName(session.studentId)}
                      <div className="text-xs text-gray-400">{session.duration} hr</div>
                    </td>
                    <td className="p-4 font-bold text-gray-800">${getSessionCost(session)}</td>
                    <td className="p-4">
                      <Badge type={session.paid ? 'success' : 'warning'} text={session.paid ? '已入帳' : '待收款'} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSessions(sessions.map(s => s.id === session.id ? { ...s, paid: !s.paid } : s))}
                        className={`text-xs font-medium px-3 py-1 rounded border transition-colors ${
                          session.paid ? 'border-gray-200 text-gray-500' : 'border-indigo-200 text-indigo-600 bg-indigo-50'
                        }`}
                      >
                        {session.paid ? '標示未付' : '收款'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2 text-indigo-600">
          <BookOpen className="fill-current" />
          <span className="font-bold text-xl">TutorMate</span>
        </div>
        <div className="text-sm font-bold text-gray-600">{activeTab === 'schedule' ? '週曆管理' : activeTab === 'students' ? '學生名單' : '財務報表'}</div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 z-30">
        <div className="p-6 flex items-center gap-3 text-indigo-600">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BookOpen size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">TutorMate</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'schedule', icon: Calendar, label: '週曆排課' },
            { id: 'students', icon: Users, label: '學生管理' },
            { id: 'billing', icon: DollarSign, label: '收費帳務' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4">
           <div className="text-xs text-center text-gray-400">Version 2.0 (Weekly View)</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-6 overflow-hidden flex flex-col h-[calc(100vh-60px)] md:h-screen">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {activeTab === 'schedule' && <WeeklyCalendarView />}
            {activeTab === 'students' && <StudentsView />}
            {activeTab === 'billing' && <BillingView />}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-30 safe-area-pb">
        {[
          { id: 'schedule', icon: Calendar, label: '週曆' },
          { id: 'students', icon: Users, label: '學生' },
          { id: 'billing', icon: DollarSign, label: '帳務' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* --- Student Modal (Updated with Schedule) --- */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 animate-scale-in">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-lg text-gray-800">{editingId ? '編輯學生資料' : '新增學生'}</h3>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">學生姓名 *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                    value={studentForm.name}
                    onChange={e => setStudentForm({...studentForm, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">科目 *</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                      value={studentForm.subject}
                      onChange={e => setStudentForm({...studentForm, subject: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">時薪 ($)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                      value={studentForm.rate}
                      onChange={e => setStudentForm({...studentForm, rate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
                  <input 
                    type="tel" 
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                    value={studentForm.phone}
                    onChange={e => setStudentForm({...studentForm, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* Weekly Schedule Settings */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center">
                    <Repeat size={14} className="mr-2" />
                    每週固定上課時間
                  </label>
                  <button onClick={handleAddScheduleSlot} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 flex items-center">
                    <Plus size={12} className="mr-1"/> 新增時段
                  </button>
                </div>
                
                <div className="space-y-2 bg-gray-50 p-3 rounded-xl">
                  {(studentForm.weeklySchedule || []).length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-2">尚未設定固定時間</div>
                  )}
                  {studentForm.weeklySchedule?.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 shadow-sm">
                      <select 
                        className="p-1 border border-gray-300 rounded text-sm bg-white"
                        value={slot.day}
                        onChange={e => handleUpdateScheduleSlot(index, 'day', parseInt(e.target.value))}
                      >
                        {[1,2,3,4,5,6,0].map(d => <option key={d} value={d}>{getDayName(d)}</option>)}
                      </select>
                      <input 
                        type="time" 
                        className="p-1 border border-gray-300 rounded text-sm"
                        value={slot.time}
                        onChange={e => handleUpdateScheduleSlot(index, 'time', e.target.value)}
                      />
                      <span className="text-gray-400 text-xs">長度</span>
                      <input 
                        type="number" 
                        step="0.5"
                        className="w-16 p-1 border border-gray-300 rounded text-sm"
                        value={slot.duration}
                        onChange={e => handleUpdateScheduleSlot(index, 'duration', parseFloat(e.target.value))}
                      />
                      <span className="text-gray-400 text-xs">hr</span>
                      <button onClick={() => handleRemoveScheduleSlot(index)} className="ml-auto text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 h-20 resize-none"
                  value={studentForm.note}
                  onChange={e => setStudentForm({...studentForm, note: e.target.value})}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowStudentModal(false)}>取消</Button>
                <Button variant="primary" className="flex-1" onClick={handleSaveStudent}>儲存</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Session Modal --- */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-lg text-gray-800">{editingId ? '編輯課程' : '新增課程'}</h3>
              <button onClick={() => setShowSessionModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
               {/* Auto-filled info hint */}
               {!editingId && sessionForm.studentId && (
                 <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm flex items-center mb-2">
                   <Clock size={14} className="mr-2" />
                   正在為 {getStudentName(sessionForm.studentId)} 安排課程
                 </div>
               )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">學生 *</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 bg-white"
                  value={sessionForm.studentId}
                  onChange={e => setSessionForm({...sessionForm, studentId: e.target.value})}
                >
                  <option value="">-- 請選擇 --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.subject})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
                  <input 
                    type="date" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                    value={sessionForm.date}
                    onChange={e => setSessionForm({...sessionForm, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                  <input 
                    type="time" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                    value={sessionForm.time}
                    onChange={e => setSessionForm({...sessionForm, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">時數 (小時)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                    value={sessionForm.duration}
                    onChange={e => setSessionForm({...sessionForm, duration: e.target.value})}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-indigo-600 rounded border-gray-300"
                      checked={sessionForm.paid}
                      onChange={e => setSessionForm({...sessionForm, paid: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">已收款項</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">課程進度 / 重點</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                  value={sessionForm.topic}
                  onChange={e => setSessionForm({...sessionForm, topic: e.target.value})}
                  placeholder="例如: Ch.5 文法練習"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">課後回饋</label>
                <textarea 
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 h-20 resize-none"
                  value={sessionForm.feedback}
                  onChange={e => setSessionForm({...sessionForm, feedback: e.target.value})}
                  placeholder="學生狀況、作業..."
                />
              </div>
              
              {editingId && (
                <div className="pt-2">
                  <button 
                    onClick={() => handleSessionDelete(editingId)}
                    className="text-red-500 text-sm flex items-center hover:underline"
                  >
                    <Trash2 size={14} className="mr-1"/> 刪除此紀錄
                  </button>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowSessionModal(false)}>取消</Button>
                <Button variant="primary" className="flex-1" onClick={handleSaveSession}>儲存</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
        .safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
        
        /* Custom Scrollbar for calendar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* 由於我們移除了 index.css 的引用，需要手動確保一些基礎樣式被應用 */
        html { height: 100%; }
        #root { min-height: 100vh; display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
}
