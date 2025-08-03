import React from 'react';
import { FaChartBar, FaTasks } from 'react-icons/fa';
import { BsChatDots } from 'react-icons/bs';
import { Slide } from 'react-awesome-reveal'; // ← استيراد الأنيميشن

const steps = [
  {
    id: 1,
    title: 'حدد احتياج وضع التفاصيل',
    description: 'نحدد احتياجك من المشروع ونفهم متطلباتك وتفاصيل المشروع بشكل دقيق',
    icon: <BsChatDots size={24} />,
  },
  {
    id: 2,
    title: 'بحث ودراسة المشروع',
    description: 'نقوم بإجراء بحث ودراسة معمقة لفهم نطاق المشروع والسوق المستهدف',
    icon: <FaChartBar size={24} />,
  },
  {
    id: 3,
    title: 'البدء في تخطيط وتحديد المهام',
    description: 'نقوم بتحديد الأهداف ووضع خطة عمل مفصلة تشمل جميع المهام والجداول الزمنية',
    icon: <FaTasks size={24} />,
  },
];

const TimelineSection = () => {
  return (
    <div className="py-12 px-4 text-center">
      <h3 className="text-purple-400 mb-2 text-lg">الجدول الزمني للمشروع</h3>
      <h2 className="text-3xl font-bold mb-2">كيف نعمل</h2>
      <p className="text-gray-400 mb-12">عملية خطوة بخطوة لتسليم مشروعك.</p>

      <div className="relative max-w-5xl mx-auto">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-700 rounded" />

        {steps.map((step, index) => (
          <Slide
            direction={index % 2 === 0 ? 'right' : 'left'}
            triggerOnce
            key={step.id}
          >
            <div className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="w-1/2 px-4">
                <div className="bg-white rounded-lg p-6 text-right border shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <div className="text-orange-400">{step.icon}</div>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
              <div className="w-6 h-6 bg-[#1C1F2A] border-4 border-orange-600 rounded-full z-10 absolute left-1/2 transform -translate-x-1/2" />
            </div>
          </Slide>
        ))}
      </div>
    </div>
  );
};

export default TimelineSection;
