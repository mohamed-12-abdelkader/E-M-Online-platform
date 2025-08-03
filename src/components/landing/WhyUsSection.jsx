import React from 'react';

const features = [
  {
    id: 1,
    title: "خبرة واسعة",
    description: "لدينا سنوات من الخبرة في تنفيذ المشاريع بجودة عالية وفي الوقت المحدد.",
    icon: "💼",
  },
  {
    id: 2,
    title: "دعم فني متواصل",
    description: "فريق الدعم لدينا متواجد دائمًا لحل أي مشكلة تواجهك بسرعة وفعالية.",
    icon: "🛠️",
  },
  {
    id: 3,
    title: "أسعار تنافسية",
    description: "نقدم أفضل جودة بأفضل سعر لتناسب احتياجات جميع العملاء.",
    icon: "💰",
  },
  {
    id: 4,
    title: "التزام بالمواعيد",
    description: "نلتزم بتسليم المشروع في الوقت المحدد دون أي تأخير.",
    icon: "⏱️",
  },
];

const WhyUsSection = () => {
  return (
    <section className="bg-gradient-to-l from-blue-600 to-orange-500 text-white py-16 px-4 text-center" dir="rtl">
      <h2 className="text-3xl font-bold mb-4">لماذا نحن؟</h2>
      <p className="text-gray-400 max-w-xl mx-auto mb-10">
        نتميز بمجموعة من القيم والمميزات التي تجعلنا الخيار الأفضل لمشروعك القادم.
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
