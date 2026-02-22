'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthModal } from '@/hooks/use-auth-modal';

function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const { onOpen } = useAuthModal();

  useEffect(() => {
    const verified = searchParams.get('verified');

    if (verified === 'true') {
      // 1. Show success toast
      toast.success('Email verified successfully! You can now sign in.', {
        duration: 5000,
      });

      // 2. Clear the 'verified' param so it doesn't trigger again on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('verified');
      const newUrl = url.pathname + url.search;
      window.history.replaceState({}, '', newUrl);

      // 3. Open the login modal
      onOpen('login');
    }
  }, [searchParams, onOpen]);

  return null;
}

export function VerificationListener() {
  return (
    <Suspense fallback={null}>
      <SearchParamsHandler />
    </Suspense>
  );
}
