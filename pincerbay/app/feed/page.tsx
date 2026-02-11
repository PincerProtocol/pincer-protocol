import { redirect } from 'next/navigation'

export default function FeedPage() {
  redirect('/market?tab=feed')
}
