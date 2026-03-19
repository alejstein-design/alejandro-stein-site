'use client'

import dynamic from 'next/dynamic'

const BeholdWidget = dynamic(() => import('@behold/react'), { ssr: false })

export default function BeholdFeed({ feedId }: { feedId: string }) {
  return <BeholdWidget feedId={feedId} />
}
