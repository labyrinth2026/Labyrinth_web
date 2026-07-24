"use client";

import dynamic from 'next/dynamic';

const MembersManager = dynamic(() => import('../../../views/admin/MembersManager'), {
  loading: () => (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
  ssr: false,
});

export default function Page() {
  return <MembersManager />;
}
