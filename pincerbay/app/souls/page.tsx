import { redirect } from 'next/navigation';

// Redirect /souls to /market?tab=products (Souls are now in Market)
export default function SoulsPage() {
  redirect('/market?tab=products');
}
