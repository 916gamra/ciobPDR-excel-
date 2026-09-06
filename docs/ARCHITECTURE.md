# 🏗️ دليل الهيكلية المعمارية وقابلية التوسع (Architecture & Extensibility Guide)

يقدم هذا الدليل المرجع الشامل لهيكلية مشروع **CIOB GMAO Light UI Excel**، والمصمم وفق مبادئ **Clean Architecture** و **Domain-Driven Design (DDD)** لضمان سهولة صيانة النظام والتوسع فيه وإضافة صفحات ومميزات جديدة بسرعة وأمان.

---

## 📁 1. خريطة وهيكلية المشروع (Project Directory Tree)

```text
├── public/                 # الأصول الثابتة (أيقونات PWA، الشعار، manifest)
├── scripts/                # أدوات التطوير والأرشيف
│   ├── tools/              # أدوات مساعدة نشطة (مثل generate_icons.js)
│   └── archive/            # أرشيف سكريبتات الترحيل والتحديثات السابقة
├── docs/                   # التوثيق الفني والمعماري للشاشات والميزات
├── src/                    # الكود المصدري للتطبيق
│   ├── domain/             # طبقة النطاق وقواعد الأعمال النقية (DDD)
│   │   ├── pdr/            # قطع الغيار والمخزون
│   │   ├── machines/       # الآلات والمعدات
│   │   └── maintenance/    # التدخلات والحركات
│   ├── application/        # خدمات التطبيق (Use Cases & Application Services)
│   │   └── services/       # SparePartApplicationService, MachineApplicationService, etc.
│   ├── infrastructure/     # البنية التحتية والاتصال الخارجي (Storage, Excel, Repositories)
│   ├── presentation/       # طبقة واجهة المستخدم (UI Layer)
│   │   ├── pages/          # شاشات التطبيق المستقلة (Views) المحملة تدريجياً (Lazy Loading)
│   │   ├── components/     # المكونات القابلة لإعادة الاستخدام
│   │   │   ├── layout/     # الهيكل الرئيسي (Header, Sidebar, MainLayout)
│   │   │   ├── modals/     # النوافذ المنبثقة للنماذج (AddArticleModal, AddMachineModal, etc.)
│   │   │   └── common/     # عناصر التحكم الأساسية (Card, Button, Toast, ErrorBoundary, etc.)
│   │   ├── modals/         # مجمع النوافذ المنبثقة المركزي (AppModals.jsx)
│   │   ├── router/         # محول الشاشات المركزي (AppRouter.jsx)
│   │   └── hooks/          # خطافات العرض الخاصة (useSpareParts, useMachines, etc.)
│   ├── hooks/              # خطافات التطبيق وإدارة الحالة (useAppHandlers, useAppComplexHandlers, etc.)
│   ├── context/            # سياقات الحالة العامة (AuthContext.jsx)
│   ├── utils/              # الدوال المساعدة ومحرك معادلات إكسيل (formulaEngine.js)
│   ├── data/               # البيانات الافتراضية الأولية
│   ├── App.jsx             # الغلاف العام ومزود السياقات والبيئة الحاضنة (Layout Shell)
│   └── main.jsx            # نقطة البداية لتطبيق React و PWA
```

---

## 🚀 2. كيف تضيف صفحة جديدة (How to Add a New Page)

لإضافة شاشة جديدة (مثلاً: `ReportsView.jsx`):

1. **أنشئ مكون الشاشة في `src/presentation/pages/ReportsView.jsx`:**
   ```jsx
   import React from 'react';
   import AnimatedPage from '../components/common/AnimatedPage';

   export default function ReportsView({ ...props }) {
     return (
       <AnimatedPage>
         <div className="p-6">
           {/* محتوى الشاشة */}
         </div>
       </AnimatedPage>
     );
   }
   ```

2. **سجل الشاشة في موجه الصفحات `src/presentation/router/AppRouter.jsx`:**
   ```jsx
   // إضافة الاستيراد الكسول (Lazy Import)
   const ReportsView = lazy(() => import('../pages/ReportsView'));

   // إضافة الحالة في مفتاح switch(currentTab)
   case 'reports':
     return <ReportsView {...commonProps} />;
   ```

3. **أضف التبويب إلى القائمة الجانبية `src/presentation/components/layout/Sidebar.jsx`:**
   - أضف معرف التبويب والأيقونة والعنوان في مصفوفة عناصر القائمة.

---

## 🪟 3. كيف تضيف نافذة منبثقة جديدة (How to Add a New Modal)

1. أنشئ مكون النافذة داخل `src/presentation/components/modals/MyNewModal.jsx`.
2. استورده كسولاً (Lazy) داخل `src/presentation/modals/AppModals.jsx`.
3. اربط حالة الفتح والإغلاق والدوال المنفذة عبر الخصائص (Props).

---

## ⚙️ 4. كيف تضيف عمليات ومعالجات بيانات جديدة (Handlers & Services)

- **العمليات البسيطة والـ CRUD المباشر:** تضاف إلى `src/hooks/useAppHandlers.js`.
- **العمليات المتتالية والمعقدة (Cascading Updates & Business Transactions):** تضاف إلى `src/hooks/useAppComplexHandlers.js` أو داخل الخدمة المعنية في `src/application/services/`.
- **الحسابات والمعادلات:** تضاف إلى محرك الحسابات `src/utils/formulaEngine.js` لضمان التوافق مع معادلات إكسيل (`Excel Twin`).
