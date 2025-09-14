import type { RTFPictureData, RTFPictureType, RTFSize } from "./types"

// ============================================================================
// Dimension Helper Functions
// ============================================================================

/**
 * Create RTFSize from millimeters
 */
export function mm(value: number): RTFSize {
  return { unit: "mm", value }
}

/**
 * Create RTFSize from centimeters
 */
export function cm(value: number): RTFSize {
  return { unit: "cm", value }
}

/**
 * Create RTFSize from points
 */
export function pt(value: number): RTFSize {
  return { unit: "pt", value }
}

/**
 * Create RTFSize from inches
 */
export function inch(value: number): RTFSize {
  return { unit: "in", value }
}

/**
 * Create RTFSize from millimeters
 */
export function px(value: number): RTFSize {
  return { unit: "px", value }
}

/**
 * Convert RTFSize to twips
 *
 * If input is a number, assume it's already in twips
 * If input is an object, convert from the specified unit
 * If input is undefined, return defaultValue (default 0 twips)
 */
export function toTwips(dimension: RTFSize | undefined, defaultValue: number = 0): number {
  if (dimension === undefined) {
    return Math.round(defaultValue)
  }
  if (typeof dimension === "number") {
    // Assume input already in twips
    return Math.round(dimension)
  }

  const { unit, value } = dimension

  switch (unit) {
    case "mm":
      return Math.round(value * 56.69291339)
    case "cm":
      return Math.round(value * 566.9291339)
    case "pt":
      return Math.round(value * 20)
    case "in":
      return Math.round(value * 1440)
    default:
      throw new Error(`Invalid dimension unit: ${unit as string}`)
  }
}

/**
 * Convert RTFSize to millimeters
 *
 * If input is a number, assume it's in twips and convert to mm
 * If input is an object, convert from the specified unit
 * If input is undefined, return defaultValue (default 0 mm)
 */
export function toMm(dimension: RTFSize | undefined, defaultValue: number = 0): number {
  if (dimension === undefined) {
    return defaultValue
  }
  if (typeof dimension === "number") {
    // Assume input in twips, convert to mm
    return dimension / 56.69291339
  }

  const { unit, value } = dimension

  switch (unit) {
    case "mm":
      return value
    case "cm":
      return value * 10
    case "pt":
      return value * 0.352777778 // 1 point = 0.352777778 mm
    case "in":
      return value * 25.4 // 1 inch = 25.4 mm
    default:
      throw new Error(`Invalid dimension unit: ${unit as string}`)
  }
}

/**
 * Convert RTFFontSize to half-points
 *
 * If input is a number, it's already in half-points
 * If input is an object, convert from the specified unit
 * If input is undefined, return defaultValue (default 0 half-points)
 */
export function toHalfPoints(fontSize: RTFSize | undefined, defaultValue: number = 0): number {
  if (fontSize === undefined) {
    return defaultValue
  }
  if (typeof fontSize === "number") {
    return fontSize
  }

  const { unit, value } = fontSize

  switch (unit) {
    case "pt":
      return value * 2 // 1 point = 2 half-points
    case "px":
      return Math.round(value * 1.5) // Rough conversion: 1px ≈ 0.75pt
    default:
      throw new Error(`Invalid font size unit: ${unit as string}`)
  }
}

// ============================================================================
// Image Helper Functions
// ============================================================================

type RTFBinarySource = File | Blob | ReadableStream<Uint8Array<ArrayBuffer>>
type RTFImageSource = HTMLImageElement | HTMLCanvasElement | OffscreenCanvas

/**
 * Reads base64 data and returns it as a Uint8Array
 */
export function readBase64(source: string): Uint8Array<ArrayBuffer> {
  const data = atob(source)
  const buffer = new Uint8Array(data.length)

  for (let i = 0; i < data.length; i++) {
    buffer[i] = data.charCodeAt(i)
  }
  return buffer
}

/**
 * Reads binary data from various sources and returns it as a Uint8Array
 */
export async function readBinary(source: RTFBinarySource): Promise<Uint8Array<ArrayBuffer>> {
  if (source instanceof File || source instanceof Blob) {
    return new Uint8Array(await source.arrayBuffer())
  }
  if (source instanceof ReadableStream) {
    const reader = source.getReader()

    try {
      const chunks: Uint8Array<ArrayBuffer>[] = []

      while (true) {
        const { done, value } = await reader.read()

        if (done) break
        if (value) {
          chunks.push(value)
        }
      }
      return await readBinary(new Blob(chunks))
    } finally {
      reader.releaseLock()
    }
  }
  throw new Error("Unsupported binary source type.")
}

/**
 * Reads binary picture data from various sources and returns it as RTFPictureData
 */
export async function createPictureDataFromBinary(source: RTFBinarySource, format: RTFPictureType, width: number, height: number): Promise<RTFPictureData> {
  const data = await readBinary(source)

  return {
    format,
    data,
    width,
    height,
  }
}

/**
 * Reads image data from various sources and returns it as a Uint8Array
 */
export async function createPictureDataFromImage(source: RTFImageSource, format: "png" | "jpeg", quality: number = 0.9): Promise<RTFPictureData> {
  const mimetype = format === "png" ? "image/png" : "image/jpeg"
  const blob = await (async () => {
    if (source instanceof OffscreenCanvas) {
      return source.convertToBlob({ type: mimetype, quality })
    }

    const canvas = source instanceof HTMLImageElement ? await imageToCanvas(source) : source

    return await new Promise<Blob>((resolve, reject) => {
      try {
        canvas.toBlob((b) => (b !== null ? resolve(b) : reject("Failed to read image from canvas.")), mimetype, quality)
      } catch (e) {
        reject(e)
      }
    })
  })()

  return await createPictureDataFromBinary(blob, format, source.width, source.height)
}

async function imageToCanvas(image: HTMLImageElement): Promise<HTMLCanvasElement> {
  if (image.complete) {
    if (image.naturalWidth === 0) {
      throw new Error("Image element has no content.")
    }

    const canvas = document.createElement("canvas")

    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Failed to create canvas context.")
    }

    ctx.drawImage(image, 0, 0)
    return canvas
  }

  return await new Promise<HTMLCanvasElement>((resolve, reject) => {
    image.addEventListener("load", () => imageToCanvas(image).then(resolve).catch(reject), { once: true })
    image.addEventListener("error", (e) => reject(e.error), { once: true })
  })
}

// ============================================================================
// Internal Helper Functions
// ============================================================================

/** Internal registry entry for named resources */
export type RegistryEntry<T> = {
  index: number // Index in the RTF table
  name: string // Entry name
  item: Partial<T> // The actual resource data
}

/** Internal item registry */
export class RTFRegistry<T> {
  private _entries: RegistryEntry<T>[] = []
  private _aliasToIndex: Map<string, number> = new Map()

  constructor(private readonly eq: (a: Partial<T>, b: Partial<T>) => boolean = () => false) {}

  get empty(): boolean {
    return this._entries.length === 0
  }

  has(alias: string | null | undefined): boolean {
    if (alias === null || alias === undefined) {
      return false
    }
    return this._aliasToIndex.has(alias)
  }

  exists(item: Partial<T>): boolean {
    return this._entries.some((entry) => this.eq(entry.item, item))
  }

  index(alias: string): number {
    const index = this._aliasToIndex.get(alias)

    if (index === undefined) {
      throw new Error(`Alias "${alias}" not found in this registry.`)
    }
    return index
  }

  get(alias: string | null | undefined): RegistryEntry<T> {
    const index = this._aliasToIndex.get(alias || "")

    if (index === undefined || index >= this._entries.length) {
      throw new Error(`Alias "${alias}" not found in this registry.`)
    }
    return this._entries[index]
  }

  *entries(): IterableIterator<RegistryEntry<T>> {
    for (const entry of this._entries) {
      yield entry
    }
  }

  register(item: Partial<T>, alias?: string): string {
    const existingEntry = this._entries.find((entry) => this.eq(entry.item, item))

    if (alias && alias.length === 0) {
      throw new Error("Alias cannot be empty")
    }
    if (existingEntry) {
      if (alias && alias !== existingEntry.name) {
        if (this._aliasToIndex.has(alias)) {
          throw new Error(`Alias "${alias}" is already in use in this registry.`)
        }
        this._aliasToIndex.set(alias, existingEntry.index)
        return alias
      }
      return existingEntry.name
    }

    const newIndex = this._entries.length
    const name = alias || `d${newIndex}`

    if (this._aliasToIndex.has(name)) {
      throw new Error(`Alias "${name}" is already in use in this registry.`)
    }

    this._entries.push({ index: newIndex, name, item })
    this._aliasToIndex.set(name, newIndex)
    return name
  }

  copyFrom(other: RTFRegistry<T>): void {
    this._entries = deepCopy(other._entries)
    this._aliasToIndex = new Map(other._aliasToIndex)
  }
}

/**
 * Deep equality check utility function
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return false
  if (typeof a !== "object") return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (!b.hasOwnProperty(key) || !deepEqual(a[key], b[key])) return false
  }
  return true
}

/**
 * Deep copy utility function
 */
export function deepCopy<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  if (value instanceof Array) {
    return value.map((item) => deepCopy(item)) as T
  }

  if (typeof value === "object") {
    const copy = {} as T
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        copy[key] = deepCopy(value[key])
      }
    }
    return copy
  }

  return value
}
