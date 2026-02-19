'use client';

import { SearchInput, SidePanel, StatusBadge } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number | null;
  category: string | null;
  metadata: { inStock?: boolean } | null;
}

export default function CatalogPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', orgId, page, searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        const res = await fetch(
          `${API_GATEWAY_URL}/api/v1/products/search?q=${encodeURIComponent(searchQuery)}&organizationId=${orgId}&limit=24`,
          { credentials: 'include' }
        );
        if (!res.ok) return { products: [], total: 0 };
        const data = await res.json();
        return { products: data.results || [], total: data.results?.length || 0 };
      }
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/products/organization/${orgId}?page=${page}&pageSize=24`,
        { credentials: 'include' }
      );
      if (!res.ok) return { products: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: aiDescriptions } = useQuery({
    queryKey: ['ai-descriptions', selectedProduct?.id],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/products/${selectedProduct!.id}/ai-descriptions`, { credentials: 'include' });
      if (!res.ok) return { descriptions: [] };
      return res.json();
    },
    enabled: !!selectedProduct,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
        <p className="text-gray-400 text-sm mt-1">Browse and search your products</p>
      </div>

      <SearchInput
        placeholder="Search products semantically..."
        value={searchQuery}
        onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
      />

      {isLoading ? (
        <div className="text-gray-400">Loading products...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {productsData?.products?.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-violet-500/50 transition-all"
                onClick={() => setSelectedProduct(product)}
              >
                {product.images?.[0] && (
                  <img src={product.images[0]} alt={product.title} className="w-full aspect-square object-cover" />
                )}
                <div className="p-3 space-y-1">
                  <p className="text-sm text-white font-medium line-clamp-2">{product.title}</p>
                  {product.price && <p className="text-xs text-violet-400">${(product.price / 100).toFixed(2)}</p>}
                  {product.category && <StatusBadge status={product.category} />}
                </div>
              </div>
            ))}
          </div>

          {productsData?.total > 24 && (
            <div className="flex gap-2 justify-center">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={productsData.products.length < 24} className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}

      {selectedProduct && (
        <SidePanel onClose={() => setSelectedProduct(null)} title={selectedProduct.title}>
          <div className="space-y-4">
            {selectedProduct.images?.[0] && (
              <img src={selectedProduct.images[0]} alt={selectedProduct.title} className="w-full rounded-lg" />
            )}
            <p className="text-gray-300 text-sm">{selectedProduct.description}</p>
            {selectedProduct.price && <p className="text-violet-400 font-semibold">${(selectedProduct.price / 100).toFixed(2)}</p>}
            <StatusBadge status={selectedProduct.metadata?.inStock ? 'In Stock' : 'Out of Stock'} />
            {aiDescriptions?.descriptions?.map((desc: { id: string; imageUrl: string; description: string; features?: string[]; colors?: string[]; materials?: string[] }) => (
              <div key={desc.id} className="border border-white/10 rounded-lg p-3 space-y-2">
                <p className="text-sm text-gray-300">{desc.description}</p>
                {desc.features && <div className="flex flex-wrap gap-1">{desc.features.map((f: string) => <span key={f} className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded">{f}</span>)}</div>}
              </div>
            ))}
          </div>
        </SidePanel>
      )}
    </div>
  );
}
