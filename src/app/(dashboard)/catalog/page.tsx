'use client';

import { SearchInput, SidePanel, StatusBadge } from '@b3-crow/ui-kit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number | null;
  category: string | null;
  metadata: { inStock?: boolean; sourceUrl?: string } | null;
}

export default function CatalogPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['products', orgId, page, searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        const res = await fetch(
          `${API_GATEWAY_URL}/api/v1/products/search?q=${encodeURIComponent(searchQuery)}&organizationId=${orgId}&limit=24`,
          { credentials: 'include' }
        );
        if (!res.ok) return { products: [], total: 0 };
        const data = await res.json() as { results?: Product[] };
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

  const { data: aiDescriptions } = useQuery<{ descriptions: { id: string; type: string; content: string; createdAt: string }[] }>({
    queryKey: ['ai-descriptions', selectedProduct?.id],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/products/${selectedProduct!.id}/ai-descriptions`, { credentials: 'include' });
      if (!res.ok) return { descriptions: [] };
      return res.json();
    },
    enabled: !!selectedProduct,
  });

  const startCrawlMutation = useMutation({
    mutationFn: async (sourceUrl: string) => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/crawler-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sourceType: 'url', sourceValue: sourceUrl, organizationId: orgId }),
      });
      if (!res.ok) throw new Error('Failed to start crawl');
    },
    onSuccess: () => {
      toast.success('Crawl started');
      setNewSourceUrl('');
      setShowAddSource(false);
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ['products', orgId] });
      }, 5000);
    },
    onError: () => toast.error('Failed to start crawl'),
  });

  const rescrapeMutation = useMutation({
    mutationFn: async (sourceUrl: string) => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/crawler-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sourceType: 'url', sourceValue: sourceUrl, organizationId: orgId }),
      });
      if (!res.ok) throw new Error('Failed to start re-scrape');
    },
    onSuccess: () => {
      toast.success('Re-scrape started');
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ['products', orgId] });
      }, 5000);
    },
    onError: () => toast.error('Failed to start re-scrape'),
  });

  const handleStartCrawl = () => {
    if (!newSourceUrl.trim() || !orgId) return;
    startCrawlMutation.mutate(newSourceUrl.trim());
  };

  const handleRescrape = () => {
    if (!selectedProduct || !orgId) return;
    const sourceUrl = selectedProduct.metadata?.sourceUrl ?? selectedProduct.images?.[0];
    if (!sourceUrl) {
      toast.error('No source URL available for this product');
      return;
    }
    rescrapeMutation.mutate(sourceUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
          <p className="text-gray-400 text-sm mt-1">Browse and search your products</p>
        </div>
        <button
          onClick={() => setShowAddSource((v) => !v)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showAddSource ? 'Cancel' : 'Scrape New Source'}
        </button>
      </div>

      {showAddSource && (
        <div className="flex gap-3 items-center p-4 bg-white/[0.04] border border-white/10 rounded-xl">
          <input
            type="url"
            placeholder="https://example.com/products"
            value={newSourceUrl}
            onChange={(e) => setNewSourceUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleStartCrawl(); }}
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleStartCrawl}
            disabled={startCrawlMutation.isPending || !newSourceUrl.trim()}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {startCrawlMutation.isPending ? 'Starting...' : 'Start Crawl'}
          </button>
        </div>
      )}

      <SearchInput
        placeholder="Search products semantically..."
        value={searchQuery}
        onChange={(value) => { setSearchQuery(value); setPage(1); }}
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
                <div className="w-full aspect-square bg-white/[0.03] relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = 'none';
                        el.nextElementSibling?.removeAttribute('hidden');
                      }}
                    />
                  ) : null}
                  <div hidden={!!product.images?.[0]} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/30 to-black/50">
                    <span className="text-xs text-gray-500 text-center px-2">{product.title.slice(0, 20)}</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm text-white font-medium line-clamp-2">{product.title}</p>
                  {product.price && <p className="text-xs text-violet-400">${(product.price / 100).toFixed(2)}</p>}
                  {product.description && <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>}
                  {product.category && <StatusBadge>{product.category}</StatusBadge>}
                </div>
              </div>
            ))}
          </div>

          {(productsData?.total ?? 0) > 24 && (
            <div className="flex gap-2 justify-center">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={(productsData?.products?.length ?? 0) < 24} className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}

      {selectedProduct && (
        <SidePanel isOpen={true} onClose={() => setSelectedProduct(null)} title={selectedProduct.title}>
          <div className="space-y-4">
            {selectedProduct.images?.[0] && (
              <img src={selectedProduct.images[0]} alt={selectedProduct.title} className="w-full rounded-lg" />
            )}
            <p className="text-gray-300 text-sm">{selectedProduct.description}</p>
            {selectedProduct.price && <p className="text-violet-400 font-semibold">${(selectedProduct.price / 100).toFixed(2)}</p>}
            <StatusBadge>{selectedProduct.metadata?.inStock ? 'In Stock' : 'Out of Stock'}</StatusBadge>
            <button
              onClick={handleRescrape}
              disabled={rescrapeMutation.isPending}
              className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {rescrapeMutation.isPending ? 'Re-scraping...' : 'Re-scrape'}
            </button>
            {aiDescriptions?.descriptions && aiDescriptions.descriptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">AI Analysis</p>
                {aiDescriptions.descriptions.map((desc) => (
                  <div key={desc.id} className="border border-white/10 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-violet-400 font-medium capitalize">{desc.type}</p>
                    <p className="text-sm text-gray-300">{desc.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SidePanel>
      )}
    </div>
  );
}
