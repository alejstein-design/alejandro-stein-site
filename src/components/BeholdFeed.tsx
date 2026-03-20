'use client'

import dynamic from 'next/dynamic'

const BeholdWidget = dynamic(() => import('@behold/react'), { ssr: false })

export default function BeholdFeed({ feedId }: { feedId: string }) {
  return (
    <div className="behold-wrapper">
      <BeholdWidget feedId={feedId} />
    </div>
  )
}
