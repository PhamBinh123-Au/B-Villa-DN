import { redirect } from 'next/navigation';

export default function FinanceRootPage() {
  redirect('/admin/finance/revenue');
}
