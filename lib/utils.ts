import type { RTFBorders, RTFPictureData, RTFPictureType, RTFSize, RTFTableBorders } from "./types"

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
export function toTwip(dimension: RTFSize | undefined, defaultValue: number = 0): number {
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
    return dimension / 56.69291339 // Assume input in twips, convert to mm
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
 * Convert RTFSize to half-points
 *
 * If input is a number, assume it's in twips and convert to points
 * If input is an object, convert from the specified unit
 * If input is undefined, return defaultValue (default 0 points)
 */
export function toPoint(dimension: RTFSize | undefined, defaultValue: number = 0): number {
  if (dimension === undefined) {
    return defaultValue
  }
  if (typeof dimension === "number") {
    return Math.round(dimension / 20) // Assume input in twips, convert to points
  }

  const { unit, value } = dimension

  switch (unit) {
    case "mm":
      return Math.round(value * 2.83464567) // 1 mm = 2.83464567 points
    case "cm":
      return Math.round(value * 28.3464567) // 1 cm = 28.3464567 points
    case "pt":
      return Math.round(value)
    case "in":
      return Math.round(value * 72) // 1 inch = 72 points
    default:
      throw new Error(`Invalid font size unit: ${unit as string}`)
  }
}

/**
 * Convert RTFSize to half-points
 *
 * If input is a number, assume it's in twips and convert to half-points
 * If input is an object, convert from the specified unit
 * If input is undefined, return defaultValue (default 0 half-points)
 */
export function toHalfPoint(dimension: RTFSize | undefined, defaultValue: number = 0): number {
  if (dimension === undefined) {
    return defaultValue
  }
  if (typeof dimension === "number") {
    return Math.round(dimension / 10) // Assume input in twips, convert to half-points
  }

  const { unit, value } = dimension

  switch (unit) {
    case "mm":
      return Math.round(value * 5.669291339) // 1 mm = 5.669291339 half-points
    case "cm":
      return Math.round(value * 56.69291339) // 1 cm = 56.69291339 half-points
    case "pt":
      return Math.round(value * 2) // 1 point = 2 half-points
    case "in":
      return Math.round(value * 144) // 1 inch = 144 half-points
    default:
      throw new Error(`Invalid font size unit: ${unit as string}`)
  }
}

/**
 * Convert RTFSize to half-points
 *
 * If input is a number, assume it's in twips and convert to one-eightth of a points
 * If input is an object, convert from the specified unit
 * If input is undefined, return defaultValue (default 0 one-eightth of a points)
 */
export function toEighthPoint(dimension: RTFSize | undefined, defaultValue: number = 0): number {
  if (dimension === undefined) {
    return defaultValue
  }
  if (typeof dimension === "number") {
    return Math.round(dimension / 2.5) // Assume input in twips, convert to one-eighth of a points
  }

  const { unit, value } = dimension

  switch (unit) {
    case "mm":
      return Math.round(value * 226.7716535) // 1 mm = 226.7716535 one-eighth of a points
    case "cm":
      return Math.round(value * 2267.716535) // 1 cm = 2267.716535 one-eighth of a points
    case "pt":
      return Math.round(value * 8) // 1 point = 8 one-eighth of a points
    case "in":
      return Math.round(value * 576) // 1 inch = 576 one-eighth of a points
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
  item: T // The actual resource data
}

export type RTFRegistryOptions<T> = {
  eq: (a: Partial<T>, b: Partial<T>) => boolean
  prefix?: string
  startAt?: number
}

/** Internal item registry */
export class RTFRegistry<T> {
  private _entries: RegistryEntry<T>[] = []
  private _aliasToIndex: Map<string, number> = new Map()

  constructor(private readonly _options: RTFRegistryOptions<T>) {}

  get empty(): boolean {
    return this._entries.length === 0
  }
  get size(): number {
    return this._entries.length
  }

  has(alias: string | null | undefined): boolean {
    if (alias === null || alias === undefined) {
      return false
    }
    return this._aliasToIndex.has(alias)
  }

  exists(item: T): boolean {
    return this._entries.some((entry) => this._options.eq(entry.item, item))
  }

  index(alias: string): number {
    return this.get(alias).index
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

  register(item: T, alias?: string): string {
    const existingEntry = this._entries.find((entry) => this._options.eq(entry.item, item))

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
    const name = alias || `${this._options.prefix || "d"}${newIndex + (this._options.startAt || 0)}`

    if (this._aliasToIndex.has(name)) {
      throw new Error(`Alias "${name}" is already in use in this registry.`)
    }

    this._entries.push({ index: newIndex + (this._options.startAt || 0), name, item })
    this._aliasToIndex.set(name, newIndex)
    return name
  }

  registerAsIndex(item: T, alias?: string): number {
    return this.get(this.register(item, alias)).index
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

/** Merge row and cell borders for a cell */
export function mergeCellBorders(
  tableBorders: Partial<RTFTableBorders> = {},
  rowBorders: Partial<RTFTableBorders> = {},
  cellBorders: Partial<RTFBorders> = {},
  isFirstRow?: boolean,
  isLastRow?: boolean,
  isFirstCell?: boolean,
  isLastCell?: boolean
): Partial<RTFBorders> | undefined {
  const merged: Partial<RTFBorders> = {}

  if (cellBorders.top !== undefined || rowBorders.top !== undefined) {
    merged.top = cellBorders.top || rowBorders.top
  } else if (tableBorders.top !== undefined && isFirstRow) {
    merged.top = tableBorders.top
  } else if (tableBorders.horizontal !== undefined) {
    merged.top = tableBorders.horizontal
  }
  if (cellBorders.bottom !== undefined || rowBorders.bottom !== undefined) {
    merged.bottom = cellBorders.bottom || rowBorders.bottom
  } else if (tableBorders.bottom !== undefined && isLastRow) {
    merged.bottom = tableBorders.bottom
  } else if (tableBorders.horizontal !== undefined) {
    merged.bottom = tableBorders.horizontal
  }
  if (cellBorders.left !== undefined || rowBorders.horizontal !== undefined) {
    merged.left = cellBorders.left || rowBorders.horizontal
  } else if ((tableBorders.left !== undefined || rowBorders.left !== undefined) && isFirstCell) {
    merged.left = rowBorders.left || tableBorders.left
  } else if (tableBorders.vertical !== undefined || rowBorders.vertical !== undefined) {
    merged.left = rowBorders.vertical || tableBorders.vertical
  }
  if (cellBorders.right !== undefined || rowBorders.horizontal !== undefined) {
    merged.right = cellBorders.right || rowBorders.horizontal
  } else if ((tableBorders.right !== undefined || rowBorders.right !== undefined) && isLastCell) {
    merged.right = rowBorders.right || tableBorders.right
  } else if (tableBorders.vertical !== undefined || rowBorders.vertical !== undefined) {
    merged.right = rowBorders.vertical || tableBorders.vertical
  }
  return Object.keys(merged).length > 0 ? merged : undefined
}
