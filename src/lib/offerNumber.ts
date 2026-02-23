import pb from '@/lib/pocketbase'

/**
 * Generates the next offer number in the format A-YYYY-XXX.
 * Starts at 042 for the current year or after a year change.
 * Increments the counter otherwise.
 */
export async function generateOfferNumber(): Promise<string> {
  const year = new Date().getFullYear()

  try {
    const result = await pb.collection('offers').getList(1, 1, {
      sort: '-number',
    })

    if (result.items.length === 0) {
      return `A-${year}-042`
    }

    const lastNumber = result.items[0].number as string
    const match = lastNumber.match(/^A-(\d{4})-(\d+)$/)

    if (!match || parseInt(match[1], 10) !== year) {
      // No match or different year → reset
      return `A-${year}-042`
    }

    const counter = parseInt(match[2], 10) + 1
    return `A-${year}-${String(counter).padStart(3, '0')}`
  } catch {
    return `A-${year}-042`
  }
}
