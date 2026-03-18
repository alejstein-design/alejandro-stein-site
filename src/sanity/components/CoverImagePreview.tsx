import { useState, useEffect } from 'react'
import { useClient, type FieldProps } from 'sanity'
import imageUrlBuilder from '@sanity/image-url'

export function CoverImagePreview(props: FieldProps) {
  const { renderDefault, value } = props
  const ref = (value as { _ref?: string } | undefined)?._ref
  const client = useClient({ apiVersion: '2024-01-01' })
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!ref) {
      setImageUrl(null)
      return
    }
    client
      .fetch<{ asset: unknown } | null>(
        `*[_id == $id][0].images[0]`,
        { id: ref }
      )
      .then((img) => {
        if (img?.asset) {
          const builder = imageUrlBuilder(client)
          setImageUrl(builder.image(img).width(800).quality(80).url())
        } else {
          setImageUrl(null)
        }
      })
      .catch(() => setImageUrl(null))
  }, [ref, client])

  return (
    <div>
      {renderDefault(props)}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          style={{
            display: 'block',
            width: '100%',
            maxHeight: '320px',
            objectFit: 'cover',
            marginTop: '10px',
            borderRadius: '2px',
          }}
        />
      )}
    </div>
  )
}
