export type ContentfulImage = {
  description?: string
  height?: number
  title?: string
  url: string
  width?: number
}

type ImageTransform = {
  fit?: string
  fm?: string
  h?: number
  q?: number
  w?: number
}

export const normalizeContentfulUrl = (value?: string) => {
  if (!value) {
    return undefined
  }

  return value.startsWith('//') ? `https:${value}` : value
}

export const buildContentfulImageUrl = (
  value: string | undefined,
  transform: ImageTransform = {}
) => {
  const normalizedUrl = normalizeContentfulUrl(value)
  if (!normalizedUrl) {
    return undefined
  }

  const url = new URL(normalizedUrl)
  Object.entries(transform).forEach(([key, transformValue]) => {
    if (transformValue !== undefined && transformValue !== null) {
      url.searchParams.set(key, String(transformValue))
    }
  })

  return url.toString()
}

export const createContentfulImage = (asset: any): ContentfulImage | undefined => {
  const file = asset?.fields?.file
  const details = file?.details?.image
  const url = normalizeContentfulUrl(file?.url)

  if (!url) {
    return undefined
  }

  return {
    description: asset?.fields?.description,
    height: details?.height,
    title: asset?.fields?.title,
    url,
    width: details?.width,
  }
}

export const buildSrcSet = (
  image: ContentfulImage | undefined,
  widths: number[],
  transform: Omit<ImageTransform, 'w'> = {},
  dimensions?: {
    baseHeight?: number
    baseWidth?: number
  }
) => {
  if (!image?.url || widths.length === 0) {
    return undefined
  }

  return widths
    .map((width) => {
      const scaledHeight =
        transform.h && dimensions?.baseHeight && dimensions?.baseWidth
          ? Math.round((dimensions.baseHeight * width) / dimensions.baseWidth)
          : transform.h
      const src = buildContentfulImageUrl(image.url, {
        ...transform,
        h: scaledHeight,
        w: width,
      })

      return src ? `${src} ${width}w` : null
    })
    .filter(Boolean)
    .join(', ')
}
