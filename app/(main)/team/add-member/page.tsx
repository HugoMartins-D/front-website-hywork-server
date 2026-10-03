'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import BottomSheet, { SheetActions } from '@/components/BottomSheet';
import { Button, TextArea, OptionRow } from '@/components/FormControls';
import { TEAM_PEOPLE, TEAM_ROLES } from '@/data/team';
import { formatPrice } from '@/utils/numberUtils';
import { useToast } from '@/components/NotificationToast';

// صفحه‌ی «افزودن عضو» فیگما (add member): خلاصه‌ی فرد، کادر «وظایف» و انتخاب نقش در شیت مشکی
function AddMemberContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { success } = useToast();
  const person = TEAM_PEOPLE.find((p) => String(p.id) === params.get('id')) ?? TEAM_PEOPLE[0];
  const [duties, setDuties] = useState('');
  const [role, setRole] = useState('');
  const [pending, setPending] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <AppShell>
      <PageHeader title="افزودن عضو" onMore={() => {}} />

      <div className="flex gap-5 px-4">
        <div className="flex-1 min-w-0 text-right">
          <div className="text-sm font-semibold text-text-primary">{person.name}</div>
          <div className="text-[10px] text-text-secondary">{person.role}</div>
          <div className="mt-3 text-base font-semibold text-text-primary">
            {formatPrice(person.price)} <span className="text-[10px] font-normal text-[#cfcfcf]">/ {person.unit}</span>
          </div>
        </div>
        <span className="w-25 h-21 bg-placeholder shrink-0" aria-hidden />
      </div>

      <div className="px-4 mt-10 pb-10 flex flex-col gap-3">
        <TextArea value={duties} onChange={(e) => setDuties(e.target.value)} placeholder="وظایف" aria-label="وظایف" />
        <OptionRow label="نقش" value={role} onClick={() => { setPending(role); setOpen(true); }} />
        <Button
          className="w-full mt-6"
          disabled={!role}
          onClick={() => {
            success(`${person.name} به تیم اضافه شد`);
            router.push('/team/notifications');
          }}
        >
          افزودن به تیم
        </Button>
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={<span className="text-sm font-normal">نقش</span>}
        footer={
          <SheetActions
            onCancel={() => setOpen(false)}
            onConfirm={() => {
              setRole(pending);
              setOpen(false);
            }}
          />
        }
      >
        <ul className="list-none m-0 p-0" role="listbox" aria-label="نقش‌ها">
          {TEAM_ROLES.map((r) => (
            <li key={r}>
              <button
                type="button"
                role="option"
                aria-selected={pending === r}
                onClick={() => setPending(r)}
                className={`w-full h-10 text-right text-sm ${pending === r ? 'bg-white text-black rounded-[5px] px-3' : 'text-white'}`}
              >
                {r}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </AppShell>
  );
}

export default function AddMemberPage() {
  return (
    <Suspense fallback={null}>
      <AddMemberContent />
    </Suspense>
  );
}
