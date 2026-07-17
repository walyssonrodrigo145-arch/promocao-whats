'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export function DeleteButton({ produtoId }: { produtoId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAdmin = searchParams.get('admin') === 'true';
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isAdmin) return null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Tem certeza que deseja excluir esta promoção?')) {
      setIsDeleting(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://wrpromo.shop/api'}/products/removpromo/${produtoId}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          router.refresh();
        } else {
          alert('Erro ao excluir a promoção.');
        }
      } catch (err) {
        alert('Erro de conexão ao tentar excluir.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`pointer-events-auto absolute top-3 right-12 z-20 rounded-full bg-red-600/80 p-1.5 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-red-500 ${isDeleting ? 'opacity-50' : ''}`}
      title="Excluir Promoção (Admin)"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
