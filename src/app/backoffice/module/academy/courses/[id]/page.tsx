"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import AcademyEmptyState from "../../AcademyEmptyState";
import AcademyImageField from "../../AcademyImageField";
import { AcademySortableList, AcademySortableItem, AcademySortInstructions } from "../../AcademySortable";
import { academySuccess, academyError } from "../../academyFeedback";
import { authFetch } from "@/app/utils/authFetch";
import styles from "../../academy.module.css";
import formStyles from "../../academyForms.module.css";
import { moveAcademyItem } from "../../AcademyReorderButtons";

import AcademyForm, { AcademyField } from "../../AcademyForm";
import useAcademyUnsavedChanges from "../../useAcademyUnsavedChanges";

const API = process.env.NEXT_PUBLIC_API_URL;

type Option = { id: number; name: string };

let quizKey = 0;
const nextQuizKey = () => `quiz-${quizKey++}`;
type QuizItem = { key: string; question: string; options: { key: string; text: string; correct: boolean }[] };

function movedOpen(open: number | null, from: number, to: number) {
  if (open === null) return null;
  if (open === from) return to;
  if (from < to && open > from && open <= to) return open - 1;
  if (from > to && open >= to && open < from) return open + 1;
  return open;
}

function blankQuiz(): QuizItem {
  return { key: nextQuizKey(), question: "", options: [{ key: nextQuizKey(), text: "", correct: false }, { key: nextQuizKey(), text: "", correct: false }] };
}

function parseQuizText(text: string): QuizItem[] {
  return text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean).flatMap((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const options = lines.slice(1).map((line) => ({
      key: nextQuizKey(),
      text: line.replace(/^-\s*/, "").replace(/\*$/, "").trim(),
      correct: line.endsWith("*"),
    })).filter((option) => option.text);
    return [{ key: nextQuizKey(), question: lines[0], options }];
  });
}

function serializeQuiz(items: QuizItem[]) {
  return items.map(item => [item.question.trim(), ...item.options.map(option => `- ${option.text.trim()}${option.correct ? "*" : ""}`)].join("\n")).join("\n\n");
}

type QuizValidator = { validate: () => string | null; reveal: () => void };
type RegisterQuiz = (name: string, validator: QuizValidator) => () => void;
function quizError(item: QuizItem) {
  if (!item.question.trim()) return 'กรุณาระบุคำถาม';
  if (item.options.length < 2 || item.options.some(option => !option.text.trim())) return 'กรุณากรอกตัวเลือกอย่างน้อย 2 ข้อ และเติมตัวเลือกให้ครบ';
  if (item.options.filter(option => option.correct).length !== 1) return 'กรุณาเลือกคำตอบที่ถูกต้อง 1 ข้อ';
  return null;
}

function QuizEditor({ name, value, onChange, register, onDraftChange }: { name: string; value: string; onChange: (text: string) => void; register: RegisterQuiz; onDraftChange: () => void }) {
  const [items, setItems] = useState<QuizItem[]>(() => parseQuizText(value));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  useEffect(() => register(name, {
    validate: () => { const index = items.findIndex(item => quizError(item)); return index < 0 ? null : `ข้อที่ ${index + 1}: ${quizError(items[index])}`; },
    reveal: () => {
      const index = items.findIndex(item => quizError(item));
      setShowErrors(true); setOpenIndex(index);
      requestAnimationFrame(() => {
        const root = document.getElementById(`${name}-question-${index}`);
        const item = items[index];
        const fields = Array.from(root?.querySelectorAll<HTMLInputElement>('input') || []);
        const first = !item?.question.trim() ? fields[0] : item.options.some(option => !option.text.trim()) ? fields.find(field => field.type !== 'radio' && !field.value.trim()) : fields.find(field => field.type === 'radio');
        first?.focus(); first?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      });
    },
  }), [items, name, register]);
  const update = (next: QuizItem[], open: number | null = openIndex) => {
    setItems(next);
    setOpenIndex(open);
    onDraftChange();
    onChange(serializeQuiz(next));
  };
  return (
    <div className={styles.quizList}>
      {!items.length && <p className={styles.formHint}>ยังไม่มีคำถาม กดเพิ่มคำถามเพื่อเริ่มสร้างข้อสอบ</p>}
      {items.length > 1 && <AcademySortInstructions />}
      <AcademySortableList ids={items.map(item => item.key)} onReorder={(active, over) => { const from = items.findIndex(item => item.key === active); const to = items.findIndex(item => item.key === over); update(moveAcademyItem(items, from, to), movedOpen(openIndex, from, to)); }}>
      {items.map((item, index) => (
        <AcademySortableItem key={item.key} id={item.key} label={`ข้อที่ ${index + 1}`}>{({setNodeRef, style, handle}) => <div ref={setNodeRef} style={style} className={styles.lesson}>
          <div className={styles.lessonHead}>
            <button className={styles.fold} type="button" aria-expanded={openIndex === index} aria-controls={`${name}-question-${index}`} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
              {openIndex === index ? "▴" : "▾"} ข้อที่ {index + 1}{item.question.trim() ? ` · ${item.question.trim()}` : ""}
            </button>
            {handle}
            <button className={styles.danger} type="button" onClick={() => update(items.filter((_, itemIndex) => itemIndex !== index), openIndex === index ? null : openIndex !== null && openIndex > index ? openIndex - 1 : openIndex)}>ลบข้อ</button>
          </div>
          {openIndex === index && (
            <div id={`${name}-question-${index}`} className={formStyles.fields}>
          {showErrors && quizError(item) && <p className={formStyles.fieldError} role="alert">{quizError(item)}</p>}
          <AcademyField label="คำถาม *"><input value={item.question} onChange={(event) => update(items.map((question, itemIndex) => itemIndex === index ? { ...question, question: event.target.value } : question))} /></AcademyField>
          <p className={styles.formHint}>กรอกตัวเลือกให้ครบอย่างน้อย 2 ข้อ และเลือกวงกลมหน้าคำตอบที่ถูกต้อง</p>
          <AcademySortableList ids={item.options.map(option => option.key)} onReorder={(active, over) => update(items.map(question => question.key === item.key ? {...question, options: moveAcademyItem(question.options, question.options.findIndex(option => option.key === active), question.options.findIndex(option => option.key === over))} : question))}>
          {item.options.map((option, optionIndex) => (
            <AcademySortableItem key={option.key} id={option.key} label={`ตัวเลือก ${optionIndex + 1} ของข้อที่ ${index + 1}`}>{({setNodeRef, style, handle}) => <div ref={setNodeRef} style={style} className={styles.optionRow}>
              <input
                type="radio"
                name={`${name}-${index}`}
                checked={option.correct}
                onChange={() => update(items.map((question, itemIndex) => itemIndex === index ? { ...question, options: question.options.map((choice, choiceIndex) => ({ ...choice, correct: choiceIndex === optionIndex })) } : question))}
                aria-label={`ข้อที่ ${index + 1}: ตัวเลือก ${optionIndex + 1} เป็นคำตอบที่ถูก`}
              />
              <input
                value={option.text}
                aria-label={`ข้อที่ ${index + 1}: ข้อความตัวเลือก ${optionIndex + 1}`}
                placeholder={`ตัวเลือก ${optionIndex + 1}`}
                onChange={(event) => update(items.map((question, itemIndex) => itemIndex === index ? { ...question, options: question.options.map((choice, choiceIndex) => choiceIndex === optionIndex ? { ...choice, text: event.target.value } : choice) } : question))}
              />
              {handle}
              <button className={styles.ghost} type="button" onClick={() => update(items.map((question, itemIndex) => itemIndex === index ? { ...question, options: question.options.filter((_, choiceIndex) => choiceIndex !== optionIndex) } : question))} disabled={item.options.length <= 2}>ลบ</button>
            </div>}</AcademySortableItem>
          ))}
          </AcademySortableList>
          <button className={styles.ghost} type="button" onClick={() => update(items.map((question, itemIndex) => itemIndex === index ? { ...question, options: [...question.options, { key: nextQuizKey(), text: "", correct: false }] } : question))}>เพิ่มตัวเลือก</button>
            </div>
          )}
        </div>}</AcademySortableItem>
      ))}
      </AcademySortableList>
      <button className={styles.addBar} type="button" onClick={() => update([...items, blankQuiz()], items.length)}>เพิ่มคำถาม</button>
    </div>
  );
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const empty = {
  title: "",
  summary: "",
  coverUrl: "",
  durationLabel: "",
  cpeCredits: "0",
  conferenceCode: "",
  price: "0",
  audience: "all",
  format: "online",
  venue: "",
  trainingStartsAt: "",
  trainingEndsAt: "",
  status: "draft",
  isFeatured: false,
  popularOrder: 0,
  categoryId: "",
  instructorId: "",
  outcomes: "",
  examText: "",
};

export default function AcademyCourseFormPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);
  const [initialLessons, setInitialLessons] = useState('[]');
  const [quizChanged, setQuizChanged] = useState(false);
  const quizValidators = useRef(new Map<string, QuizValidator>());
  const registerQuiz = useCallback<RegisterQuiz>((name, validator) => {
    quizValidators.current.set(name, validator);
    return () => { quizValidators.current.delete(name); };
  }, []);
  const [lessons, setLessons] = useState<{ id?: number; clientKey?: string; title: string; description: string; videoUrl: string; quizText: string; documents: { id?: number; name: string; fileUrl: string }[] }[]>([]);
  const [invalidLessonKey, setInvalidLessonKey] = useState<number | string | null>(null);
  const [openLesson, setOpenLesson] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Option[]>([]);
  const [instructors, setInstructors] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const savingRef = useRef(false);
  const pendingUploads = useRef(0);
  const [uploadingDocuments, setUploadingDocuments] = useState(0);
  const newLessonKey = useRef(0);
  useAcademyUnsavedChanges(loadState === 'ready' && (Boolean(file) || quizChanged || uploadingDocuments > 0 || JSON.stringify(form) !== JSON.stringify(initialForm) || JSON.stringify(lessons) !== initialLessons), saving);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadState("loading");
      try {
        const [categoryRes, instructorRes, courseRes] = await Promise.all([
          authFetch(`${API}/academy/admin/categories`),
          authFetch(`${API}/academy/admin/instructors`),
          isNew ? Promise.resolve(null) : authFetch(`${API}/academy/admin/courses/${params.id}`),
        ]);
        if (!categoryRes.ok || !instructorRes.ok || (courseRes && !courseRes.ok)) throw new Error();
        const [categoryData, instructorData, data] = await Promise.all([
          categoryRes.json(), instructorRes.json(), courseRes ? courseRes.json() : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setCategories(categoryData);
        setInstructors(instructorData);
        if (data) {
      const loadedForm = {
        title: data.title || "",
        summary: data.summary || "",
        coverUrl: data.coverUrl || "",
        durationLabel: data.durationLabel || "",
        cpeCredits: String(data.cpeCredits ?? "0"),
        conferenceCode: data.conferenceCode || "",
        price: String(data.price ?? "0"),
        audience: data.audience || "all",
        format: data.format || "online",
        venue: data.venue || "",
        trainingStartsAt: toLocalInput(data.trainingStartsAt),
        trainingEndsAt: toLocalInput(data.trainingEndsAt),
        status: data.status || "draft",
        isFeatured: Boolean(data.isFeatured),
        popularOrder: data.popularOrder ?? 0,
        categoryId: data.categoryId ? String(data.categoryId) : "",
        instructorId: data.instructorId ? String(data.instructorId) : "",
        outcomes: (data.outcomes || []).join("\n"),
        examText: data.examText || "",
      };
      setForm(loadedForm); setInitialForm(loadedForm);
      const loadedLessons = (data.lessons || []).map((lesson: { documents?: { id?: number; name: string; fileUrl: string }[] }, index: number) => ({
        ...lesson,
        clientKey: `loaded-${index}`,
        documents: lesson.documents || [],
      }));
      setLessons(loadedLessons); setInitialLessons(JSON.stringify(loadedLessons));
        }
        setLoadState("ready");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [isNew, params.id, reloadKey]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (savingRef.current || pendingUploads.current > 0 || loadState !== "ready") return;
    for (const [name, validator] of quizValidators.current) {
      const error = validator.validate();
      if (!error) continue;
      const lessonIndex = lessons.findIndex(lesson => `lesson-${lesson.id ?? lesson.clientKey}` === name);
      if (lessonIndex >= 0) setOpenLesson(lessonIndex);
      validator.reveal();
      return;
    }
    const invalidLesson = lessons.findIndex((lesson) => !lesson.title.trim());
    if (invalidLesson !== -1) {
      setInvalidLessonKey(lessons[invalidLesson].id ?? lessons[invalidLesson].clientKey!);
      setOpenLesson(invalidLesson);
      await academyError("กรุณาระบุชื่อบทเรียน", `บทที่ ${invalidLesson + 1} ยังไม่มีชื่อ`);
      requestAnimationFrame(() => document.getElementById(`lesson-title-${invalidLesson}`)?.focus());
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
    let coverUrl: string | null = form.coverUrl || null;
    if (file) {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await authFetch(`${API}/academy/admin/upload`, { method: "POST", body });
      const data = await uploaded.json();
      if (!uploaded.ok) {
        academyError("อัปโหลดไม่สำเร็จ", data.message || "กรุณาลองอีกครั้ง");
        return;
      }
      coverUrl = data.url;
    }
    const payload = {
      ...form,
      coverUrl,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      instructorId: form.instructorId ? Number(form.instructorId) : null,
      popularOrder: Number(form.popularOrder),
      outcomes: form.outcomes.split("\n").map((line) => line.trim()).filter(Boolean),
      lessons: lessons.map((lesson) => { const data = { ...lesson }; delete data.clientKey; return data; }),
    };
    const res = await authFetch(
      isNew ? `${API}/academy/admin/courses` : `${API}/academy/admin/courses/${params.id}`,
      { method: isNew ? "POST" : "PUT", body: JSON.stringify(payload) }
    );
    if (!res.ok) {
      const data = await res.json();
      academyError("บันทึกไม่สำเร็จ", data.message || "กรุณาลองอีกครั้ง");
      return;
    }
    await academySuccess("บันทึกคอร์สสำเร็จ");
    router.push("/backoffice/module/academy/courses");
    } catch {
      academyError("บันทึกไม่สำเร็จ", "กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (loadState !== "ready") return <div className={styles.container}>
    <AcademyEmptyState state={loadState} title={loadState === "loading" ? "กำลังโหลดข้อมูลคอร์ส" : "โหลดข้อมูลคอร์สไม่สำเร็จ"} hint={loadState === "loading" ? "กรุณารอสักครู่" : "กรุณาลองอีกครั้งก่อนแก้ไขหรือบันทึกคอร์ส"} action={loadState === "error" ? <button className={styles.ghost} type="button" onClick={() => setReloadKey((value) => value + 1)}>ลองอีกครั้ง</button> : undefined} />
  </div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isNew ? "เพิ่มคอร์ส" : "แก้ไขคอร์ส"}</h1>
          <p className={styles.subtitle}>กรอกข้อมูลคอร์ส ตั้งค่าการเรียน และเพิ่มเนื้อหาก่อนเผยแพร่</p>
        </div>
        <Link href="/backoffice/module/academy/courses" className={styles.backButton}><ArrowLeft size={18} aria-hidden="true" />ย้อนกลับ</Link>
      </div>
      <AcademyForm className={`${styles.form} ${formStyles.form} ${formStyles.editorForm}`} onSubmit={onSubmit} aria-busy={saving}>
        <fieldset disabled={saving}><p className={styles.formHint}>ช่องที่มี * จำเป็นต้องกรอก</p>
        <div className={formStyles.courseSections}>
          <section className={formStyles.section}>
            <h2 className={styles.sectionTitle}>ข้อมูลคอร์ส</h2>
            <div className={formStyles.courseIntro}>
              <div className={formStyles.fields}>
                <AcademyField label="ชื่อคอร์ส"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></AcademyField>
                <AcademyField label="คำโปรย"><textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="แนะนำคอร์สสั้น ๆ เพื่อแสดงบนการ์ดคอร์ส" /></AcademyField>
        <div className={`${styles.row2} ${formStyles.fields}`}>
          <AcademyField label="หมวดหมู่"><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">ไม่ระบุ</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </AcademyField>
          <AcademyField label="วิทยากร"><select value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })}>
              <option value="">ไม่ระบุ</option>
              {instructors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </AcademyField>
        </div>
              </div>
              <AcademyImageField label="รูปปกคอร์ส" src={form.coverUrl} file={file} onFileChange={setFile} onRemove={() => { setFile(null); setForm({ ...form, coverUrl: "" }); }} cover disabled={saving} />
            </div>
          </section>
          <section className={formStyles.section}>
        <h2 className={styles.sectionTitle}>รูปแบบและค่าเรียน</h2>
        <div className={`${styles.row2} ${formStyles.fields}`}>
          <AcademyField label="รูปแบบ"><select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
              <option value="online">ออนไลน์</option>
              <option value="onsite">ออนไซต์</option>
            </select>
          </AcademyField>
          <AcademyField label="กลุ่มผู้เรียน"><select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">ทุกคน</option>
              <option value="general">บุคคลทั่วไป</option>
              <option value="pharmacist">เฉพาะเภสัชกร</option>
            </select>
          </AcademyField>

        </div>
        <div className={`${styles.row2} ${formStyles.fields}`}>
          <AcademyField label="ระยะเวลาที่แสดงบนการ์ด"><input value={form.durationLabel} onChange={(e) => setForm({ ...form, durationLabel: e.target.value })} placeholder="2.5 ชม." /></AcademyField>
          <AcademyField label="หน่วยกิต CPE"><input type="number" min="0" step="0.01" value={form.cpeCredits} onChange={(e) => setForm({ ...form, cpeCredits: e.target.value })} /></AcademyField>
        </div>
        <div className={`${styles.row2} ${formStyles.fields}`}>
          <AcademyField label="Conference Code"><input value={form.conferenceCode} onChange={(e) => setForm({ ...form, conferenceCode: e.target.value })} /></AcademyField>
          <AcademyField label="ราคา (0 = ฟรี)"><input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></AcademyField>
        </div>
        {form.format === "onsite" && (
          <>
            <AcademyField label="สถานที่"><input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required /></AcademyField>
            <div className={`${styles.row2} ${formStyles.fields}`}>
              <AcademyField label="เริ่มอบรม"><input type="datetime-local" value={form.trainingStartsAt} onChange={(e) => setForm({ ...form, trainingStartsAt: e.target.value })} required /></AcademyField>
              <AcademyField label="สิ้นสุด"><input type="datetime-local" value={form.trainingEndsAt} onChange={(e) => setForm({ ...form, trainingEndsAt: e.target.value })} /></AcademyField>
            </div>
          </>
        )}
          </section>
          <section className={formStyles.section}>
            <h2 className={styles.sectionTitle}>สิ่งที่จะได้เรียนรู้</h2>
            <AcademyField label="ผลลัพธ์การเรียนรู้"><textarea rows={4} value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} placeholder="หนึ่งข้อต่อหนึ่งบรรทัด" /></AcademyField>
            <p className={styles.formHint}>แต่ละบรรทัดจะแสดงเป็นหนึ่งข้อในหน้ารายละเอียดคอร์ส</p>
          </section>
            <section className={formStyles.section}>
        <h2 className={styles.sectionTitle}>เนื้อหาบทเรียน</h2>
        <div className={styles.lessonHead}>
          <span>บทเรียน</span>
          <button className={styles.ghost} type="button" onClick={() => { setLessons([...lessons, { clientKey: `new-${newLessonKey.current++}`, title: "", description: "", videoUrl: "", quizText: "", documents: [] }]); setOpenLesson(lessons.length); }}>เพิ่มบท</button>
        </div>
        {!lessons.length && <p className={formStyles.emptyContent}>ยังไม่มีบทเรียน กดเพิ่มบทเพื่อเพิ่มวิดีโอ แบบทดสอบ และเอกสารประกอบ</p>}
        {lessons.length > 1 && <AcademySortInstructions />}
        <AcademySortableList ids={lessons.map(lesson => lesson.id ?? lesson.clientKey!)} disabled={saving} onReorder={(active, over) => { const from = lessons.findIndex(lesson => (lesson.id ?? lesson.clientKey) === active); const to = lessons.findIndex(lesson => (lesson.id ?? lesson.clientKey) === over); setLessons(moveAcademyItem(lessons, from, to)); setOpenLesson(movedOpen(openLesson, from, to)); }}>
        {lessons.map((lesson, index) => (
          <AcademySortableItem key={lesson.id ?? lesson.clientKey} id={lesson.id ?? lesson.clientKey!} label={`บทที่ ${index + 1}`} disabled={saving}>{({setNodeRef, style, handle}) => <div ref={setNodeRef} style={style} className={styles.lesson}>
            <div className={styles.lessonHead}>
              <button className={styles.fold} type="button" aria-expanded={openLesson === index} aria-controls={`lesson-content-${index}`} onClick={() => setOpenLesson(openLesson === index ? null : index)}>
                {openLesson === index ? "▴" : "▾"} บทที่ {index + 1}{lesson.title.trim() ? ` · ${lesson.title.trim()}` : ""}
              </button>
              {handle}
              <button className={styles.danger} type="button" onClick={() => { setLessons(lessons.filter((_, item) => item !== index)); setOpenLesson(openLesson === index ? null : openLesson !== null && openLesson > index ? openLesson - 1 : openLesson); }}>ลบ</button>
            </div>
            <div hidden={openLesson !== index} id={`lesson-content-${index}`} className={formStyles.fields}>
            {invalidLessonKey === (lesson.id ?? lesson.clientKey) && !lesson.title.trim() && <p className={formStyles.fieldError} role="alert">กรุณาระบุชื่อบทเรียน</p>}
            <AcademyField label="ชื่อบท *"><input id={`lesson-title-${index}`} value={lesson.title} onChange={(e) => setLessons(lessons.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item))} /></AcademyField>
            <AcademyField label="คำอธิบาย"><textarea rows={2} value={lesson.description} onChange={(e) => setLessons(lessons.map((item, itemIndex) => itemIndex === index ? { ...item, description: e.target.value } : item))} /></AcademyField>
            <AcademyField label="ลิงก์วิดีโอ"><input value={lesson.videoUrl} onChange={(e) => setLessons(lessons.map((item, itemIndex) => itemIndex === index ? { ...item, videoUrl: e.target.value } : item))} placeholder="YouTube, Vimeo หรือไฟล์ mp4" /></AcademyField>
            <div>
              <span>แบบทดสอบท้ายบท</span>
              <QuizEditor register={registerQuiz} onDraftChange={() => setQuizChanged(true)} name={`lesson-${lesson.id ?? lesson.clientKey}`} value={lesson.quizText} onChange={(quizText) => setLessons(lessons.map((item, itemIndex) => itemIndex === index ? { ...item, quizText } : item))} />
            </div>
            <div>
              <span>เอกสารประกอบ</span>
              <AcademySortableList ids={lesson.documents.map(document => document.id ?? document.fileUrl)} onReorder={(active, over) => setLessons(lessons.map(item => item === lesson ? {...item, documents: moveAcademyItem(item.documents, item.documents.findIndex(document => (document.id ?? document.fileUrl) === active), item.documents.findIndex(document => (document.id ?? document.fileUrl) === over))} : item))}>
              {lesson.documents.map((document) => (
                <AcademySortableItem key={document.id ?? document.fileUrl} id={document.id ?? document.fileUrl} label={`เอกสาร ${document.name}`}>{({setNodeRef, style, handle}) => <div ref={setNodeRef} style={style} className={styles.lessonHead}>
                  <a href={document.fileUrl} target="_blank" rel="noreferrer">{document.name}</a>
                  {handle}
                  <button className={styles.danger} type="button" onClick={() => setLessons(lessons.map((item, itemIndex) => itemIndex === index ? { ...item, documents: item.documents.filter((file) => file.fileUrl !== document.fileUrl) } : item))}>ลบ</button>
                </div>}</AcademySortableItem>
              ))}
              </AcademySortableList>
              <label className={styles.addBar}>
                เพิ่มเอกสาร
              <input hidden type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                const lessonKey = lesson.id ?? lesson.clientKey;
                pendingUploads.current += 1;
                setUploadingDocuments(pendingUploads.current);
                try {
                const body = new FormData();
                body.append("file", file);
                const uploaded = await authFetch(`${API}/academy/admin/upload`, { method: "POST", body });
                const data = await uploaded.json();
                if (!uploaded.ok) {
                  academyError("อัปโหลดไม่สำเร็จ", data.message || "กรุณาลองอีกครั้ง");
                  return;
                }
                setLessons((current) => current.map((item) => (item.id ?? item.clientKey) === lessonKey ? { ...item, documents: [...item.documents, { name: file.name, fileUrl: data.url }] } : item));
                } catch { await academyError("อัปโหลดไม่สำเร็จ", "กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง"); } finally {
                  pendingUploads.current -= 1;
                  setUploadingDocuments(pendingUploads.current);
                }
              }} />
              </label>
            </div>
            </div>
          </div>}</AcademySortableItem>
        ))}
        </AcademySortableList>
</section>
            <section className={formStyles.section}>
        <h2 className={styles.sectionTitle}>ข้อสอบจบคอร์ส</h2>
        <div>
          <QuizEditor register={registerQuiz} onDraftChange={() => setQuizChanged(true)} name="exam" value={form.examText} onChange={(examText) => setForm({ ...form, examText })} />
        </div>
</section>
          <section className={formStyles.section}>
        <h2 className={styles.sectionTitle}>การเผยแพร่</h2>
          <AcademyField label="สถานะ"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">ร่าง</option>
              <option value="published">เผยแพร่</option>
              <option value="archived">เก็บถาวร</option>
            </select>
          </AcademyField>
        <div className={`${styles.row2} ${formStyles.fields}`}>
          <AcademyField label="ลำดับความนิยม"><input type="number" min="0" step="1" value={form.popularOrder} onChange={(e) => setForm({ ...form, popularOrder: Number(e.target.value) })} /></AcademyField>
          <p className={styles.formHint}>เลขน้อยแสดงก่อนในส่วนคอร์สยอดนิยม</p>

        </div>
        <label className={styles.checks}>
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
          ปักหมุดเป็นคอร์สแนะนำ
        </label>
          </section>
        </div>
        <div className={formStyles.save}>
        <Link href="/backoffice/module/academy/courses" className={styles.ghost}>ยกเลิก</Link>
        <span role="status" className={styles.formHint}>{uploadingDocuments > 0 ? "กำลังอัปโหลดเอกสาร กรุณารอก่อนบันทึก" : ""}</span>
        <button className={styles.primary} type="submit" disabled={saving || uploadingDocuments > 0}>{saving ? "กำลังบันทึก..." : "บันทึกคอร์ส"}</button>
        </div>
        </fieldset>
      </AcademyForm>
    </div>
  );
}
