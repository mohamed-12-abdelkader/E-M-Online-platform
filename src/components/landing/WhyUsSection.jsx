import React from 'react';

const features = [
  {
    id: 1,
    title: "إدارة شاملة للدورات والطلاب",
    description: "إنشاء الدورات، تنظيم الجداول، وإدارة التسجيلات والطلاب بسهولة.",
    icon: "📚",
  },
  {
    id: 2,
    title: "بث مباشر وتسجيل تلقائي",
    description: "بث المحاضرات بجودة عالية مع حفظ التسجيلات وإتاحتها للطلاب فورًا.",
    icon: "🎥",
  },
  {
    id: 3,
    title: "اختبارات وبنوك أسئلة",
    description: "إنشاء امتحانات فرعية وشاملة، تصحيح تلقائي، وتقارير تفصيلية للنتائج.",
    icon: "📝",
  },
  {
    id: 4,
    title: "لوحة أرباح ودفعات مرنة",
    description: "متابعة الإيرادات لحظيًا وسحب الأرباح بطرق دفع متعددة وآمنة.",
    icon: "💸",
  },
  {
    id: 5,
    title: "تواصل وإشعارات ذكية",
    description: "قنوات محادثة، تنبيهات للطلاب، ورسائل موجهة لتعزيز التفاعل.",
    icon: "💬",
  },
  {
    id: 6,
    title: "دعم فني وتسويق للدورات",
    description: "فريق دعم مخصص وخطط ترويجية لزيادة الوصول إلى طلاب أكثر.",
    icon: "🚀",
  },
  {
    id: 7,
    title: "جدولة ذكية وحجز المقاعد",
    description: "تقويم مرن، تحديد سعة المجموعات، وتذكيرات تلقائية للطلاب.",
    icon: "🗓️",
  },
  {
    id: 8,
    title: "تحليلات متقدمة للأداء",
    description: "لوحات معلومات تبرز أداء الدورات والطلاب لتحديد نقاط التحسين.",
    icon: "📈",
  },
];

const WhyUsSection = () => {
  return (
    <section className="bg-gradient-to-l from-blue-600 to-orange-500 text-white py-16 px-4 text-center" dir="rtl">
      <h2 className="text-3xl font-bold mb-4">لماذا العمل معنا؟</h2>
      <p className="text-gray-200 max-w-2xl mx-auto mb-10">
        نقدم للمدرسين منظومة متكاملة لبناء وإدارة أعمالهم التعليمية عبر الإنترنت،
        من إنشاء الدورات والبث المباشر إلى الاختبارات والأرباح والتسويق.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {features.map((item) => (
          <div
            key={item.id}
            className="bg-[#1C1F2A] p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-300 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyUsSection;
