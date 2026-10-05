import { ListingsSearch } from '@/components/listings/ListingsSearch';

export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">案件を探す</h1>
      <ListingsSearch />
    </div>
  );
}
