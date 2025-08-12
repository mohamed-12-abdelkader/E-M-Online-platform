import React, { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Header from '../../components/landing/Header'
import HeroSection from '../../components/landing/HeroSection'
import ServicesSection from '../../components/landing/ServicesSection'
import TimelineSection from '../../components/landing/TimelineSection'
import WhyUsSection from '../../components/landing/WhyUsSection'
import TestimonialsSection from '../../components/landing/TestimonialsSection'
import PricingSection from '../../components/landing/PricingSection'
import ImageFlipbookSection from '../../components/landing/ImageFlipbookSection'
import WhyWorkWithUsSection from '../../components/landing/WhyWorkWithUsSection'

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  useEffect(() => {
    // تحميل الصفحة مع تأثير انتقالي
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div 
      dir='rtl'
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden"
    >
      {/* شريط التقدم المحسن */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transform origin-left z-50 shadow-lg"
        style={{ scaleX }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* مؤشر الموقع */}
      <motion.div
        className="fixed top-4 right-4 z-40 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {Math.round(scrollYProgress.get() * 100)}%
      </motion.div>

      {/* خلفية متحركة محسنة */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        
        {/* نمط هندسي متحرك */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.15'%3E%3Cpath d='M40 40c0-22.091 17.909-40 40-40v80c-22.091 0-40-17.909-40-40zm0 0c0 22.091-17.909 40-40 40V0c22.091 0 40 17.909 40 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }}
        />
        
        {/* تدرج لوني متحرك */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* تأثيرات الجزيئات المتحركة المحسنة */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full opacity-30 ${
              i % 3 === 0 ? 'bg-blue-400' : 
              i % 3 === 1 ? 'bg-purple-400' : 'bg-indigo-400'
            }`}
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * -100 - 50, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* جزيئات كبيرة متحركة */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`large-${i}`}
            className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 300 - 150, 0],
              y: [0, Math.random() * -200 - 100, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 25 + 25,
              repeat: Infinity,
              delay: Math.random() * 15,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* موجات متحركة في الخلفية */}
      <div className="fixed inset-0 pointer-events-none -z-5">
        <motion.div
          className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-200/20 to-transparent"
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-purple-200/20 to-transparent"
          animate={{
            y: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* تأثيرات الضوء */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Header/>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <HeroSection/>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ 
          duration: 1, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        viewport={{ once: true, margin: "-100px" }}
        whileHover={{ scale: 1.02 }}
      >
        <WhyWorkWithUsSection/>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0, rotateY: -15 }}
        whileInView={{ y: 0, opacity: 1, rotateY: 0 }}
        transition={{ 
          duration: 1.2, 
          ease: "easeOut",
          type: "spring",
          stiffness: 80
        }}
        viewport={{ once: true, margin: "-100px" }}
        whileHover={{ rotateY: 5 }}
      >
        <ImageFlipbookSection/>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0, x: -30 }}
        whileInView={{ y: 0, opacity: 1, x: 0 }}
        transition={{ 
          duration: 1, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        viewport={{ once: true, margin: "-100px" }}
        whileHover={{ x: 5 }}
      >
        <ServicesSection/>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0, x: 30 }}
        whileInView={{ y: 0, opacity: 1, x: 0 }}
        transition={{ 
          duration: 1, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        viewport={{ once: true, margin: "-100px" }}
        whileHover={{ x: -5 }}
      >
        <WhyUsSection/>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.9 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ 
          duration: 1.1, 
          ease: "easeOut",
          type: "spring",
          stiffness: 90
        }}
        viewport={{ once: true, margin: "-100px" }}
        whileHover={{ scale: 1.03 }}
      >
        <TimelineSection/>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0, rotateX: 15 }}
        whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ 
          duration: 1.2, 
          ease: "easeOut",
          type: "spring",
          stiffness: 80
        }}
        viewport={{ once: true, margin: "-100px" }}
        whileHover={{ rotateX: -5 }}
      >
        <TestimonialsSection/>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ 
          duration: 1, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        viewport={{ once: true, margin: "-100px" }}
        whileHover={{ scale: 1.02 }}
      >
        <PricingSection/>
      </motion.div>

      {/* زر العودة للأعلى المحسن */}
      <motion.button
        className="fixed bottom-8 left-8 z-40 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm border border-white/20"
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ opacity: 0, y: 100, rotate: -180 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ 
          delay: 1.5, 
          duration: 0.8,
          type: "spring",
          stiffness: 200
        }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true }}
      >
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.div>
        
        {/* تلميح */}
        <motion.div
          className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 pointer-events-none"
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          العودة للأعلى
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
        </motion.div>
      </motion.button>
    </motion.div>
  )
}

export default LandingPage