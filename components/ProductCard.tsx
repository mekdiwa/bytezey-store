'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category?: { name: string };
    stockCount: number;
  };
  onPurchaseSuccess?: () => void;
}

export default function ProductCard({ product, onPurchaseSuccess }: ProductCardProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (product.stockCount <= 0) {
      toast.error('ขออภัย สินค้าชิ้นนี้หมดแล้ว');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'การสั่งซื้อไม่สำเร็จ');
      }

      toast.success(`สั่งซื้อสำเร็จ! รับสินค้า: ${data.data.deliveredData}`);
      if (onPurchaseSuccess) onPurchaseSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isOutOfStock = product.stockCount <= 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#0e1738] border border-blue-500/20 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.25)] transition-all duration-300"
    >
      <div>
        {/* Card Image Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
          <Image
            src={product.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1738] via-transparent to-transparent opacity-80" />
          
          {/* Category Tag */}
          {product.category && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-sky-300 backdrop-blur-md">
              {product.category.name}
            </span>
          )}

          {/* Stock Tag */}
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border ${
              isOutOfStock
                ? 'bg-red-950/80 border-red-500/40 text-red-300'
                : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isOutOfStock ? 'สินค้าหมด' : `คงเหลือ ${product.stockCount} ชิ้น`}
          </span>
        </div>

        {/* Content Details */}
        <div className="p-5">
          <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-sky-400 transition-colors">
            {product.name}
          </h3>
          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
          </p>
        </div>
      </div>

      {/* Footer / Pricing & Buy Button */}
      <div className="p-5 pt-0 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-400">ราคาจำหน่าย</span>
          <span className="text-xl font-extrabold text-sky-400">
            ฿{Number(product.price).toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleBuy}
          disabled={isOutOfStock || loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            isOutOfStock
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.6)]'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'สินค้าหมด' : 'สั่งซื้อทันที'}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
