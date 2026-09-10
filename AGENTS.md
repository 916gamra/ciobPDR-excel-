# AGENTS.md — CIOB GMAO Light UI Excel System Instructions & Architecture

هذا الملف يحتوي على الإرشادات المرجعية والمعمارية لنظام **CIOB GMAO Light UI Excel** لمطوري ومساعدي الذكاء الاصطناعي (**AI Agents & Developers**).

---

## 🏛️ 1. المبادئ المعمارية الأساسية (Core Architecture Principles)

1. **العمل بدون اتصال بالإنترنت (100% Offline Client-Side Execution):**
   - التطبيق مصمم ليعمل بالكامل داخل المتصفح بدون أي خادم خلفي إلزامي.
   - يعتمد على `localStorage` لتخزين واسترجاع البيانات محلياً.
   - متوافق مع استيراد وتصدير ملفات **Excel (`.xlsx`)** و **JSON**.

2. **التطابق الدقيق مع جداول ومعادلات Excel (Excel Twin Model):**
   - كل جدول في واجهة المستخدم يمثل ورقة عمل (`Worksheet`) في إكسيل.
   - أسماء الأعمدة والتنسيقات ومفاتيح الربط تتطابق مع النموذج المرجعي `GMAO_Light_Template_V2_Formules.xlsx`.
   - محاكاة دقيقة لحسابات الإدخالات، الإخراجات، ورصيد المخزون في الوقت الفعلي عبر الـ `useMemo` في React.

3. **الروابط الذكية والانتقال السلس (Smart Navigation & Links):**
   - الروابط بين الجداول تمكّن المستخدم من النقر على أي معرف (مثل `id_type`, `id_zone`, `id_family`) للانتقال المباشر وتطبيق الفلاتر تلقائياً على الجدول التابع.

---

## 📊 2. هيكل الكيانات والبيانات (Data Schemas)

### أ. المخزون والمقالات (`Stock_Actuel / Articles`)
- `id`: المعرف الرقمي الفريد.
- `ref`: المرجع الفريد للقطعة (رمز المقال، مثال: `ROUL-6204-2RS`).
- `designation`: اسم ووصف المقال.
- `id_type`: نوع المقال المرجعي (مرتبط بجدول `Types`).
- `id_diag`: التشخيص المرجعي (مرتبط بجدول `Diagnostics`).
- `stockInitial`: المخزون الافتتاحي (العمود E في إكسيل).
- `entrees`: مجموع كميات الإدخال المحسوبة (العمود F في إكسيل عبر `SUMIFS`).
- `sorties`: مجموع كميات الإخراج المحسوبة (العمود G في إكسيل عبر `SUMIFS`).
- `stockActuel`: الرصيد الفعلي المحسوب `= stockInitial + entrees - sorties` (العمود H).
- `seuil`: الحد الأدنى للتنبيه (العمود I).
- `alerte`: الحالة المحسوبة (`OK`, `ALERTE`, `RUPTURE`).
- `emplacement`: مكان التخزين بالمستودع (مثال: `R1-B04`).

### ب. حركات المخزون (`Mouvements`)
- `id`: معرف الحركة.
- `code_bon`: رقم وصل الطلب/الصرف (مثال: `Bon-001`).
- `date`: تاريخ العملية (`YYYY-MM-DD`).
- `ref`: مرجع المقال المستخدم.
- `quantite`: الكمية المصروفة أو المدخلة.
- `type`: نوع الحركة (`Sortie` أو `Entrée`).
- `action_id`: نوع وفلتر التدخل (`CORRECTIVE`, `PREVENTIVE`, `AMELIORATIVE`, `USAGE`, `REAPPRO`, `RETOUR`, `INVENTAIRE`).
- `usage_type`: المستفيد في حالة الاستعمال الشخصي (`technician`, `operation`, `chef`).
- `technicien`: اسم أو معرف الفني القائم بالعملية أو المستلم/الطلب.
- `id_zone`: المنطقة المعنية (تُستنتج تلقائياً في حالة الـ `USAGE` وتُعطل في الـ `Entrée`).
- `id_machine_registered`: الآلة المعنية بالتدخل (تُخفى تلقائياً عند اختيار `USAGE` أو `Entrée`).
- `operation`: نوع العملية أو المشرف المعني (يُخفى في الـ `CORRECTIVE` و `Entrée`).
- `fournisseur`: اسم المورد في حالة الـ `Entrée` (Réapprovisionnement).
- `emplacement_reception`: مكان التخزين/المستودع في حالة الـ `Entrée`.
- `commentaire`: ملاحظات أو سبب التدخل.

### ج. الآلات المسجلة (`Machines_Registered`)
- `id_machine_registered`: رمز الآلة الفريد (مثال: `MCH-001`, `CNC-01`).
- `designation`: اسم وتوصيف الآلة.
- `id_family`: عائلة الآلة (مرتبط بجدول `Families`).
- `id_templates`: نموذج الآلة (مرتبط بجدول `Templates`).
- `id_zone_default`: المنطقة الافتراضية للآلة (مرتبط بجدول `Zones`).
- `technician`: الفني المسؤول.
- `status`: حالة التشغيل (`En service`, `En maintenance`, `Arrêt`).

### د. العمليات والمشرفين (`Operations & Chefs`)
- `id_operation`: رمز العملية أو المشرف المولد تلقائياً (`OP-01, OP-02...` للمشغلين أو `CHEF-01, CHEF-02...` لرؤساء الفرق).
- `nom`: اسم أو وصف العملية أو المشرف.
- `id_zone`: منطقة التدخل أو التواجد.
- `type_profil`: نوع الحساب/الملف (`OPERATEUR` أو `CHEF`).
- معادلة Auto-ID للمشغل: `="OP-" & TEXT(COUNTIF(Op[Type],"OPERATEUR")+1, "00")`
- معادلة Auto-ID للرئيس: `="CHEF-" & TEXT(COUNTIF(Op[Type],"CHEF")+1, "00")`

---

## 🎨 3. معايير واجهة المستخدم والتصميم (UI & Styling Rules)

- **التباين العالي ودعم تبديل وضع الشريط الجانبي (Dark / Light Sidebar Switcher):**
  - الشريط الجانبي (`Sidebar`): يدعم التبديل الفوري بين الوضع الداكن الفاخر (`Dark: bg-slate-900 border-slate-800 text-white`) والوضع الفاتح الأنيق (`Light: bg-white border-slate-200 text-slate-800`) مع حفظ الاختيار في `localStorage`.
  - تباين قوي وموحد للتبويب النشط: خلفية بيضاء بخط داكن عريض في الوضع الداكن، وخلفية داكنة مع خط أبيض في الوضع الفاتح لجميع التبويبات بدون تشتيت لوني.
  - البطاقات العلوية (`Top Banners`): خلفية بيضاء (`bg-white border-slate-200 shadow-xs`) لتطابق شريط الفلاتر والجداول.
- **الأيقونات المعبرة:**
  - `Machines Registered`: أيقونة المصنع والمنشأة الصناعية (`Factory`).
  - `Families`: أيقونة `hub` (`HubIcon` Google Material Symbols Outlined SVG أوفلاين 100%).
  - `Templates`: أيقونة `category` (`CategoryIcon` Google Material Icons Outlined SVG أوفلاين 100%).
  - `Familles (Composants)`: أيقونة `spoke` (`SpokeIcon` Google Material Symbols Outlined SVG أوفلاين 100%).
  - `Types (Parts)`: أيقونة `layers` (`LayersIcon` Google Material Symbols Outlined SVG أوفلاين 100%).
  - `Operations`: أيقونة قائمة المهام والإجراءات الميدانية (`ClipboardList`).
  - استخدام أيقونات SVG حصراً (أوفلاين 100%) من مكتبة `lucide-react` وشعار التطبيق SVG مدمج.
  - يمنع استخدام الرموز التعبيرية (Emojis) كأيقونات أساسية في عناصر التحكم أو القوائم.
  - **الفصل التام بين بيانات المستودع (Entrepôt Parts) والمخزون (Stock PDR):**
    صفحات `Part Types` و `Part Designations` مخصصة حصراً لقطع وأجزاء المستودع (`Entrepôt`) وتمتلك قاعدة بيانات وجداول مستقلة (`Part_Types`, `Part_Designations`) تماماً عن جداول المخزون العام (`Stock_Actuel / Types / Diagnostics`). يمنع الخلط بينهما أو استخدام مسمى PDR لقطع المستودع.

---

## ⚡ 4. إرشادات التعديل والتطوير (Developer & Agent Guidelines)

1. **عند تعديل الحسابات:**
   - تأكد دائماً من مطابقة معادلات الجافاسكريبت لمعادلات إكسيل الموثقة في `EXCEL_FORMULAS.md`.
2. **عند إضافة كيانات جديدة:**
   - يجب تحديث دوال التصدير والاستيراد لـ Excel (`handleExportExcel`, `handleImportFile`) في `src/App.jsx`.
3. **الحفاظ على الأداء:**
   - استخدم `useMemo` لعمليات تجميع البيانات ومحاكاة الـ `SUMIFS` لضمان استجابة فورية حتى مع آلاف الحركات.

---

## 🧩 5. وثيقة محدد الأكواد التسلسلي المشترك (SequentialCodePicker Architecture)

تم إنشاء وتوثيق هذا المكون المشترك (`SequentialCodePicker`) لتوحيد اختيار وتوليد الأكواد الرقمية التسلسلية عبر مختلف شاشات التطبيق:

### أ. الفلسفة التصميمية (Design Philosophy):
1. **الجمع بين التوليد التلقائي والاختيار اليدوي الحر:**
   - يولد الكود التسلسلي التالي تلقائياً عند فتح النافذة بناءً على البيانات المخزنة.
   - يتيح للمستخدم النقر على أيقونة الشبكة (`LayoutGrid` SVG Offline) لفتح شبكة الأرقام من `01` إلى `99` (أو أكثر) لاختيار رقم شاغر مفضل حسب الرغبة.
   - إمكانية العودة بنقرة واحدة إلى الترتيب التلقائي (`Auto`).
2. **حماية سلامة البيانات ومنع التكرار (Integrity & Conflict Prevention):**
   - الأرقام المحجوزة مسبقاً (`takenNumbers: Set<number>`) تظهر بلون رمادي خافت ومطفأ مع خط شطب (`line-through`)، وتكون غير قابلة للنقر نهائياً.
3. **تصميم Excel Twin فائق النقاء:**
   - كود موحد بصرياً بخط برمجي أحادي المسافة (`font-mono`) بدون إطارات داخلية ثقيلة.
   - نافذة منبثقة ملحقة وثابتة تحت الحقل مباشرة بخلفية بيضاء وظلال ناعمة وتقسيم منظم إلى 5 نطاقات سريعة (`01-20`, `21-40`, `41-60`, `61-80`, `81-99`).

### ب. الخصائص البرمجية (Component Props API):
- `prefix`: بادئة الكود (مثل: `'TECH-'`, `'OP-'`, `'RESP-'`, `'MCH-'`, `'ZONE-'`, `'FAM-'`, `'TYP-'`, `'BON-'`).
- `currentCode`: القيمة الحالية للكود (مثل: `'TECH-04'`).
- `onChangeCode`: دالة الاستدعاء عند اختيار أو تغيير الكود `(newCode) => void`.
- `autoGeneratedCode`: الكود التلقائي المحسوب من النظام.
- `takenNumbers`: كائن `Set<number>` يحتوي على الأرقام المحجوزة مسبقاً.
- `disabled`: تعطيل الحقل (في وضع التعديل مثلاً).
- `maxNumbers`: أقصى رقم متاح (الافتراضي: 99).
- `padLength`: عدد خانات التصفير (الافتراضي: 2 -> `01`، ويمكن جعله 3 -> `001`).

### ج. الاستيراد والاستخدام المشترك (Shared Usage):
```jsx
import SequentialCodePicker from '@/presentation/components/common/SequentialCodePicker';
// أو للاستخدام الخاص بالمستخدمين:
import UserCodePicker from '@/presentation/components/common/UserCodePicker';
```

