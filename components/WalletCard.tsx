// components/WalletCard.tsx

// کارت کیف پول فیگما: سه لایه‌ی روی هم (#e2e2e2، #999999، مشکی) با گوشه‌ی ۲۵،
// «موجودی» ۱۵/۴۰۰، مبلغ ۲۵/۶۰۰ و نام صاحب کارت ۱۶/۵۰۰ سفید

export default function WalletCard({ balance, owner }: { balance: string; owner: string }) {
  return (
    <div className="relative h-62 mx-8">
      <div className="absolute inset-x-7 top-0 bottom-6 rounded-[25px] bg-[#e2e2e2]" aria-hidden />
      <div className="absolute inset-x-3.5 top-2.75 bottom-3.25 rounded-[25px] bg-[#999999]" aria-hidden />
      <div className="absolute inset-x-0 top-6 bottom-0 rounded-[25px] bg-black text-white px-12.75 pt-10.75 pb-8 flex flex-col">
        <span className="text-[15px]">موجودی</span>
        <span className="text-[25px] font-semibold leading-7.5">{balance}</span>
        <span className="mt-auto text-base font-medium">{owner}</span>
      </div>
    </div>
  );
}
