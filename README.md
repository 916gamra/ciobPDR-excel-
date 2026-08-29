# CIOB GMAO Light UI Excel ⚡

نظام إدارة الصيانة بمساعدة الحاسوب (**GMAO / CMMS**) الخفيف، المصمم ليعمل **100% Offline** بتوافق تام ومباشر مع ملفات وجداول **Microsoft Excel**، مع محاكاة كاملة للمعادلات الحسابية في الوقت الفعلي (**Real-Time Excel Formulas Recalculation**)، وتصميم متقدم يعتمد على الجداول المزدوجة (**Twin Tables**) والروابط الذكية بين الكيانات (**Smart Links**).

---

## 📌 نظرة عامة (Overview)

تم بناء **CIOB GMAO Light UI Excel** ليوفر للمصانع وورش العمل والمهندسين تجربة استخدام فائقة السرعة، تجمع بين سهولة ومرونة جداول إكسيل المألوفة وقوة واجهات الويب الحديثة والمحمية.

### 🌟 أبرز المميزات (Key Features):
1. **100% Offline & Client-Side:** لا يتطلب أي خادم خارجي أو اتصال بالإنترنت، كل البيانات تحفظ محلياً في المتصفح (`LocalStorage`) وتعمل بسرعة فائقة.
2. **توافق كامل مع Excel (Import & Export):**
   - **تصدير كامل بنقرة زر:** تصدير كافة الجداول (10 أوراق عمل Sheets) إلى ملف `.xlsx` رسمي.
   - **استيراد فوري:** إمكانية رفع ملف Excel أو JSON وتحديث كافة الجداول وقواعد البيانات فوراً.
3. **محرك إعادة حساب المعادلات (Live Formula Engine):**
   - محاكاة دقيقة لدوال إكسيل مثل `=SUMIFS`, `=E+F-G`, والدوال الشرطية للتنبيهات.
4. **العلاقات المترابطة والروابط الذكية (Smart Hierarchies):**
   - **المكونات (Components):** Stock Actuel ⟷ Types ⟷ Diagnostics
   - **الآلات (Machines):** Machines Registered ⟷ Families ⟷ Templates
   - **المناطق والفرق (Zones & Teams):** Zones ⟷ Technicians ⟷ Operations
5. **شريط جانبي أنيق وعالي التباين (High Contrast Sidebar):**
   - أيقونات SVG دقيقة ومعبرة من مكتبة `lucide-react`.
   - تنظيم هرمي مقسم إلى مجموعات واضحة مع إبراز التبويب النشط بلون عالي الوضوح.

---

## 📂 بنية المشروع (Project Structure)

```text
├── src/
│   ├── components/                 # واجهات المستخدم والوحدات الوظيفية
│   │   ├── AddArticleModal.jsx     # نافذة إضافة صنف جديد
│   │   ├── AddMachineModal.jsx     # نافذة تسجيل آلة جديدة
│   │   ├── DashboardView.jsx       # لوحة التحكم والمؤشرات (KPIs)
│   │   ├── DiagnosticView.jsx      # تشخيص الأعطال وتصنيفاتها
│   │   ├── FamilyView.jsx          # عائلات الآلات
│   │   ├── GuideView.jsx           # دليل الاستخدام التفاعلي
│   │   ├── Header.jsx              # الترويسة العلوية وشريط العمليات
│   │   ├── MachinesRegisteredView.jsx # جدول الآلات المزدوج (Twin Table)
│   │   ├── NexusView.jsx           # مصفوفة الروابط والعلاقات الهرمية
│   │   ├── OperationsView.jsx      # سجل العمليات وأنواع التدخلات
│   │   ├── Sidebar.jsx             # الشريط الجانبي الذكي
│   │   ├── SortieRapideView.jsx    # استمارة الصرف السريع للحركات
│   │   ├── StockView.jsx           # جدول المخزون الفعلي ومعادلات إكسيل
│   │   ├── TechniciansView.jsx     # سجل الفنيين مع التوليد التلقائي للرموز
│   │   ├── TemplatesView.jsx       # قوالب ونماذج الآلات
│   │   ├── TypeView.jsx            # أنواع وتصنيفات قطع الغيار
│   │   └── ZonesView.jsx           # المناطق وورش العمل
│   ├── data/
│   │   └── seedData.js             # البيانات الأولية وقواعد الربط الافتراضية
│   ├── initialData.json            # قاعدة البيانات النموذجية المستوردة
│   ├── App.jsx                     # المنسق الرئيسي وإدارة الحالة وعمليات Excel
│   └── main.jsx                    # نقطة الانطلاق لتطبيق React
├── index.html                      # الصفحة الأساسية ومكتبات التنسيق
├── metadata.json                   # بيانات ووصف التطبيق
├── package.json                    # تبعيات المشروع (React 19, XLSX, Lucide)
├── README.md                       # دليل التوثيق الشامل للتطبيق
├── AGENTS.md                       # تعليمات وتوجيهات التطوير الذكي
└── EXCEL_FORMULAS.md               # توثيق شامل لكافة معادلات إكسيل
```

---

## 🧮 معادلات إكسيل المطبقة بالتطبيق (Excel Formulas Mapping)

| الحقل / المؤشر | معادلة Excel المقابلة | طريقة التطبيق في الكود (JS Live Calculation) |
| :--- | :--- | :--- |
| **Entrées (الإدخالات)** | `=SUMIFS(Mouvement!D:D, Mouvement!C:C, [@Ref], Mouvement!E:E, "Entrée")` | تجميع كميات الحركات لكل صنف التي نوعها `Entrée` |
| **Sorties (الإخراجات)** | `=SUMIFS(Mouvement!D:D, Mouvement!C:C, [@Ref], Mouvement!E:E, "Sortie")` | تجميع كميات الحركات لكل صنف التي نوعها `Sortie` |
| **Stock Actuel (المخزون الحالي)** | `=[@[Stock Initial]] + [@[Entrées]] - [@[Sorties]]` | `stockInitial + entrees - sorties` |
| **Alerte (حالة التنبيه)** | `=IF([@[Stock Actuel]]<=0, "RUPTURE", IF([@[Stock Actuel]]<=[@[Seuil]], "ALERTE", "OK"))` | التحقق الشرطي الفوري والتلوين بالأحمر/البرتقالي/الأخضر |
| **Auto-Increment ID (الفنيين)** | `="TECH-" & TEXT(COUNTA(A:A)+1, "00")` | حساب التسلسل التالي تلقائياً `TECH-01`, `TECH-02` |
| **Auto-Increment ID (العمليات)** | `="OP-" & TEXT(COUNTA(A:A)+1, "00")` | حساب التسلسل التالي تلقائياً `OP-01`, `OP-02` |

*لمزيد من التفاصيل الرياضية والهندسية، يرجى الاطلاع على ملف `EXCEL_FORMULAS.md`.*

---

## 🚀 تشغيل وبناء التطبيق (Run & Build)

### 1. تثبيت التبعيات:
```bash
npm install
```

### 2. تشغيل بيئة التطوير المحلية:
```bash
npm run dev
```

### 3. بناء نسخة الإنتاج:
```bash
npm run build
```

---

## 💾 دورة حياة البيانات (Data Life-Cycle)

1. **التحميل الأولي:** يتم قراءة البيانات من `localStorage`، وإذا كانت فارغة يتم استخدام `initialData.json` و `seedData.js`.
2. **الحفظ التلقائي:** يتم حفظ أي تعديل، إضافة صنف، حركة صرف، أو تسجيل آلة فوراً في `localStorage`.
3. **التصدير والاستيراد:** يتم توليد ملف إكسيل يحوي كافة الجداول عبر مكتبة `xlsx` المتوافقة 100% مع برامج Office و LibreOffice و Google Sheets.
