'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden pt-12 pb-20">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[140px] pointer-events-none -z-10 rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/60 border border-sky-400/30 backdrop-blur-md mb-8"
        >
          <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
            Bytezey Store — ระบบจัดส่งอัตโนมัติ 24 ชม.
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          ศูนย์รวมดิจิทัลไอเทม <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 drop-shadow-[0_0_35px_rgba(56,189,248,0.6)]">
            และไอดีเกมชั้นนำระดับพรีเมียม
          </span>
        </motion.h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10">
          ทำรายการรวดเร็ว ปลอดภัย ได้รับสินค้าทันทีหลังชำระเงิน พร้อมระบบสต็อกอัตโนมัติ 100%
        </p>

        {/* Shimmer CTA Button */}
        <div className="flex justify-center gap-4 mb-16">
          <Link href="#store-inventory" className="relative inline-flex overflow-hidden rounded-xl p-[1px] focus:outline-none">
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#38bdf8_0%,#0e1738_50%,#38bdf8_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-[#0e1738] px-8 py-4 text-sm font-bold text-white backdrop-blur-3xl hover:bg-blue-600/20 transition-all">
              เลือกซื้อสินค้าทันที
            </span>
          </Link>
        </div>

        {/* Store Highlights Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Zap, title: 'ส่งงานไวใน 1 วินาที', desc: 'ระบบบอทส่งรหัสทันทีหลังชำระเงิน' },
            { icon: ShieldCheck, title: 'รับประกันความปลอดภัย', desc: 'สินค้าแท้ 100% มีประวัติการซื้อชัดเจน' },
            { icon: Flame, title: 'ยอดจำหน่ายกว่า 10,000+', desc: 'ผู้ใช้งานไว้วางใจทั่วประเทศ' },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="flex items-center gap-4 p-5 rounded-2xl bg-[#0e1738]/60 border border-blue-500/20 backdrop-blur-md"
            >
              <div className="p-3 rounded-xl bg-blue-600/20 text-sky-400">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
