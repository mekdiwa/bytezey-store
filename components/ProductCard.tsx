'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Layers } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  product_items: { count: number }[];
}

interface ProductListProps {
  initialCategories: Category[];
  initialProducts: Product[];
}

export default function ProductList({ initialCategories, initialProducts }: ProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [inventoryTitle, setInventoryTitle] = useState('คลังสินค้าดิจิทัล');
  const [inventorySubtitle, setInventorySubtitle] = useState('เลือกซื้อสินค้าที่พร้อมจัดส่งทันที');
  const supabase = createClient();

  useEffect(() => {
    const fetchDynamicData = async () => {
      // ดึงข้อความหัวข้อโซนสินค้า
      const { data: settings } = await supabase.from('site_settings').select('*');
      if (settings) {
        settings.forEach((s) => {
          if (s.key === 'inventory_title') setInventoryTitle(s.value);
          if (s.key === 'inventory_subtitle') setInventorySubtitle(s.value);
        });
      }

      // ดึงหมวดหมู่และสินค้าล่าสุด
      const { data: catData } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      if (catData) setCategories(catData);

      const { data: prodData } = await supabase
        .from('products')
        .select(`
          *,
          product_items (count)
        `)
        .eq('is_active', true)
        .eq('product_items.is_sold', false);
      if (prodData) setProducts(prodData as any);
    };

    fetchDynamicData();
  }, [supabase]);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  return (
    <div id="store-inventory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-blue-500/20 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {inventoryTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {inventorySubtitle}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-[#0e1738] text-slate-400 hover:text-white border border-blue-500/20'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-[#0e1738] text-slate-400 hover:text-white border border-blue-500/20'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 rounded-3xl bg-[#0e1738]/40 border border-blue-500/10 backdrop-blur-sm">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
          <p className="text-slate-400 font-medium text-sm">ไม่มีรายการสินค้าในหมวดหมู่นี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const stockCount = p.product_items ? (p.product_items[0]?.count || 0) : 0;
            return (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description}
                price={p.price}
                imageUrl={p.image_url}
                stock={stockCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
