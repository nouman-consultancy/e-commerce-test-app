'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import api from '@/lib/api';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface SuggestionsResponse {
  data: Product[];
  personalised: boolean;
}

export default function ProductSuggestions({
  productId,
  category,
}: {
  productId: string;
  category: string;
}) {
  const { data: session } = useSession();

  const { data } = useQuery({
    queryKey: ['suggestions', productId],
    queryFn: () =>
      api.get<SuggestionsResponse>(`/products/${productId}/suggestions`).then((r) => r.data),
  });

  useEffect(() => {
    if (!session?.user) return;
    api.post(`/products/${productId}/view`).catch(() => {});
  }, [productId, session?.user]);

  if (!data?.data?.length) return null;

  const title = data.personalised ? 'Recommended for you' : `More in ${category}`;

  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          style={
            {
              '--swiper-navigation-color': '#1d4ed8',
              '--swiper-navigation-size': '20px',
              paddingLeft: '32px',
              paddingRight: '32px',
            } as React.CSSProperties
          }
        >
          {data.data.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
