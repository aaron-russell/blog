export type ContentfulImage = {
  description?: string
  height?: number
  title?: string
  url: string
  width?: number
}

export type ImageFormat = 'avif' | 'jpg' | 'png' | 'webp'

export type ImageTransform = {
  f?: string
  fit?: string
  fl?: string
  fm?: string
  h?: number
  q?: number
  w?: number
}

type ResponsiveImageSource = {
  srcSet: string
  type: string
}

type ResponsiveImageOptions = {
  fallbackFormat?: ImageFormat
  formats?: ImageFormat[]
  transform?: ImageTransform
  widths?: number[]
}

const DEFAULT_MAX_WIDTH = 1600
const DEFAULT_RESPONSIVE_FORMATS: ImageFormat[] = ['avif', 'webp']
const FORMAT_MIME_TYPES: Record<ImageFormat, string> = {
  avif: 'image/avif',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
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

export const clampContentfulWidths = (
  image: ContentfulImage | undefined,
  widths: number[] = [],
  fallbackWidth?: number
) => {
  const intrinsicWidth = image?.width || fallbackWidth || DEFAULT_MAX_WIDTH
  const requestedWidths = widths.length > 0 ? widths : [fallbackWidth || intrinsicWidth]

  return [...new Set(requestedWidths)]
    .map((width) => Math.max(1, Math.min(width, intrinsicWidth)))
    .sort((left, right) => left - right)
}

export const getContentfulImageDimensions = (
  image: ContentfulImage | undefined,
  width: number,
  transform: Pick<ImageTransform, 'h' | 'w'> = {}
) => {
  const intrinsicWidth = image?.width
  const intrinsicHeight = image?.height

  if (transform.h) {
    const baseWidth = transform.w || intrinsicWidth || width
    return {
      height: Math.round((transform.h * width) / baseWidth),
      width,
    }
  }

  if (intrinsicWidth && intrinsicHeight) {
    return {
      height: Math.round((intrinsicHeight * width) / intrinsicWidth),
      width,
    }
  }

  return {
    height: undefined,
    width,
  }
}

export const buildSrcSet = (
  image: ContentfulImage | undefined,
  widths: number[],
  transform: ImageTransform = {},
  format?: ImageFormat
) => {
  if (!image?.url || widths.length === 0) {
    return undefined
  }

  const baseWidth = transform.w || widths[0] || image?.width

  return widths
    .map((width) => {
      const { height } = getContentfulImageDimensions(image, width, {
        h: transform.h,
        w: baseWidth,
      })
      const src = buildContentfulImageUrl(image.url, {
        ...transform,
        fl: format === 'jpg' ? transform.fl || 'progressive' : transform.fl,
        fm: format,
        h: height,
        w: width,
      })

      return src ? `${src} ${width}w` : null
    })
    .filter(Boolean)
    .join(', ')
}

export const buildResponsiveContentfulImage = (
  image: ContentfulImage | undefined,
  {
    fallbackFormat = 'jpg',
    formats = DEFAULT_RESPONSIVE_FORMATS,
    transform = {},
    widths = [],
  }: ResponsiveImageOptions = {}
): {
  fallbackSrc?: string
  fallbackWidth?: number
  fallbackHeight?: number
  fallbackSrcSet?: string
  sources: ResponsiveImageSource[]
} => {
  if (!image?.url) {
    return { sources: [] }
  }

  const resolvedWidths = clampContentfulWidths(image, widths, transform.w || image.width)
  const fallbackWidth = resolvedWidths[resolvedWidths.length - 1] || transform.w || image.width

  if (!fallbackWidth) {
    return { sources: [] }
  }

  const baseWidth = transform.w || resolvedWidths[0] || image.width
  const fallbackDimensions = getContentfulImageDimensions(image, fallbackWidth, {
    h: transform.h,
    w: baseWidth,
  })

  const fallbackTransform: ImageTransform = {
    ...transform,
    fm: fallbackFormat,
    w: fallbackWidth,
  }

  if (fallbackDimensions.height) {
    fallbackTransform.h = fallbackDimensions.height
  }

  if (fallbackFormat === 'jpg') {
    fallbackTransform.fl = fallbackTransform.fl || 'progressive'
  }

  const sources = formats
    .map((format) => {
      const srcSet = buildSrcSet(image, resolvedWidths, transform, format)
      if (!srcSet) {
        return undefined
      }

      return {
        srcSet,
        type: FORMAT_MIME_TYPES[format],
      }
    })
    .filter(Boolean) as ResponsiveImageSource[]

  return {
    fallbackHeight: fallbackDimensions.height,
    fallbackSrc: buildContentfulImageUrl(image.url, fallbackTransform),
    fallbackSrcSet: buildSrcSet(image, resolvedWidths, transform, fallbackFormat),
    fallbackWidth,
    sources,
  }
}

export const resolveContentfulAltText = (
  image: ContentfulImage | undefined,
  alt?: string,
  fallback = ''
) => alt || image?.description || image?.title || fallback

export const buildContentfulSocialImageUrl = (value: string | undefined) =>
  buildContentfulImageUrl(value, {
    fit: 'fill',
    fm: 'jpg',
    fl: 'progressive',
    h: 630,
    q: 80,
    w: 1200,
  })
