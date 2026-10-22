import { Task, Exam } from '../types';

/**
 * Escapes characters according to RFC 5545 (iCalendar) specifications.
 */
function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Formats a Date or YYYY-MM-DD string into iCalendar DATE format (YYYYMMDD)
 */
function formatToIcsDate(dateStr: string): { start: string; end: string } {
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);

  const startDate = new Date(Date.UTC(y, m, d));
  const endDate = new Date(Date.UTC(y, m, d + 1)); // DTEND is non-inclusive for all-day events

  const format = (date: Date) => {
    const yr = date.getUTCFullYear();
    const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dy = String(date.getUTCDate()).padStart(2, '0');
    return `${yr}${mo}${dy}`;
  };

  return {
    start: format(startDate),
    end: format(endDate),
  };
}

/**
 * Generates current UTC timestamp in YYYYMMDDTHHMMSSZ format
 */
function getDtStamp(): string {
  const now = new Date();
  const yr = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dy = String(now.getUTCDate()).padStart(2, '0');
  const hr = String(now.getUTCHours()).padStart(2, '0');
  const mn = String(now.getUTCMinutes()).padStart(2, '0');
  const sc = String(now.getUTCSeconds()).padStart(2, '0');
  return `${yr}${mo}${dy}T${hr}${mn}${sc}Z`;
}

export interface IcsExportOptions {
  tasks?: Task[];
  exams?: Exam[];
  type?: 'all' | 'exams' | 'tasks';
  calendarName?: string;
}

/**
 * Generates an RFC 5545 compliant .ics string from tasks and exams.
 */
export function generateIcsContent(options: IcsExportOptions): string {
  const {
    tasks = [],
    exams = [],
    type = 'all',
    calendarName = 'جدول مذاكرة ذاكرلي',
  } = options;

  const dtStamp = getDtStamp();
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zakirly//Study Planner//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  // 1. Add Exams
  if (type === 'all' || type === 'exams') {
    exams.forEach((exam) => {
      if (!exam.date) return;
      const { start, end } = formatToIcsDate(exam.date);
      const summary = `🎓 اختبار: ${exam.subject} - ${exam.title}`;
      const description = `اختبار دراسي: ${exam.title}\nالمادة: ${exam.subject}\nالدرجة المستهدفة: ${exam.targetGrade || 'غير محدد'}\nنسبة الجاهزية الحالية: ${exam.progressPercent}%\nتم تصديره عبر تطبيق ذاكرلي للمذاكرة والتركيز`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:exam_${exam.id}_${start}@zakirly.app`);
      lines.push(`DTSTAMP:${dtStamp}`);
      lines.push(`DTSTART;VALUE=DATE:${start}`);
      lines.push(`DTEND;VALUE=DATE:${end}`);
      lines.push(`SUMMARY:${escapeIcsText(summary)}`);
      lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
      lines.push('CATEGORIES:Exams,Education,Zakirly');
      lines.push('STATUS:CONFIRMED');
      lines.push('TRANSP:OPAQUE');
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${escapeIcsText(`تذكير بموعد اختبار: ${exam.title}`)}`);
      lines.push('TRIGGER:-P1D'); // Remind 1 day before
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });
  }

  // 2. Add Tasks
  if (type === 'all' || type === 'tasks') {
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const { start, end } = formatToIcsDate(task.dueDate);
      const priorityLabel =
        task.priority === 'high'
          ? 'عالية جداً'
          : task.priority === 'medium'
          ? 'متوسطة'
          : 'منخفضة';
      const statusIcon = task.completed ? '✓ (مكتملة)' : '🍅';
      const summary = `${statusIcon} مهمة مذاكرة: ${task.title} (${task.subject})`;
      const description = `مهمة مذاكرة: ${task.title}\nالمادة: ${task.subject}\nالأولوية: ${priorityLabel}\nجلسات بومودورو المقدرة: ${task.estimatedPomodoros} جلسة (${task.estimatedPomodoros * 25} دقيقة)\nالحالة: ${task.completed ? 'تم الإنجاز' : 'قيد التنفيذ'}\nتم تصديره عبر تطبيق ذاكرلي للمذاكرة`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:task_${task.id}_${start}@zakirly.app`);
      lines.push(`DTSTAMP:${dtStamp}`);
      lines.push(`DTSTART;VALUE=DATE:${start}`);
      lines.push(`DTEND;VALUE=DATE:${end}`);
      lines.push(`SUMMARY:${escapeIcsText(summary)}`);
      lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
      lines.push('CATEGORIES:StudyTasks,Education,Zakirly');
      lines.push(task.completed ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED');
      lines.push('TRANSP:TRANSPARENT');
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${escapeIcsText(`تذكير بمهمة المذاكرة: ${task.title}`)}`);
      lines.push('TRIGGER:-PT2H'); // Remind 2 hours before
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });
  }

  lines.push('END:VCALENDAR');

  // RFC 5545 requires CRLF line endings
  return lines.join('\r\n');
}

/**
 * Triggers a browser download of a .ics calendar file.
 */
export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convenience helper to export commitments and download immediately.
 */
export function exportStudyCommitments(
  tasks: Task[],
  exams: Exam[],
  type: 'all' | 'exams' | 'tasks' = 'all'
): void {
  const todayStr = new Date().toISOString().split('T')[0];
  let filename = `zakirly-study-schedule-${todayStr}.ics`;
  let calTitle = 'جدول مذاكرة ذاكرلي';

  if (type === 'exams') {
    filename = `zakirly-exams-${todayStr}.ics`;
    calTitle = 'مواعيد اختبارات ذاكرلي';
  } else if (type === 'tasks') {
    filename = `zakirly-tasks-${todayStr}.ics`;
    calTitle = 'مهام مذاكرة ذاكرلي';
  }

  const icsString = generateIcsContent({
    tasks,
    exams,
    type,
    calendarName: calTitle,
  });

  downloadIcsFile(filename, icsString);
}

/**
 * Export a single exam to .ics
 */
export function exportSingleExam(exam: Exam): void {
  const icsString = generateIcsContent({
    exams: [exam],
    type: 'exams',
    calendarName: `اختبار: ${exam.subject}`,
  });
  downloadIcsFile(`exam-${exam.subject}-${exam.date}.ics`, icsString);
}

/**
 * Export a single task to .ics
 */
export function exportSingleTask(task: Task): void {
  if (!task.dueDate) return;
  const icsString = generateIcsContent({
    tasks: [task],
    type: 'tasks',
    calendarName: `مهمة: ${task.title}`,
  });
  downloadIcsFile(`task-${task.subject}-${task.dueDate}.ics`, icsString);
}
