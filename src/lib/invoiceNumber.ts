import pb from '@/lib/pocketbase'

/**
 * Generates the next invoice number in the format R-YYYY-XXX.
 * Starts at 001 for the current year or after a year change.
 * Increments the counter otherwise.
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()

  try {
    const result = await pb.collection('invoices').getList(1, 1, {
      sort: '-number',
    })

    if (result.items.length === 0) {
      return `R-${year}-001`
    }

    const lastNumber = result.items[0].number as string
    const match = lastNumber.match(/^R-(\d{4})-(\d+)$/)

    if (!match || parseInt(match[1], 10) !== year) {
      // No match or different year → reset
      return `R-${year}-001`
    }

    const counter = parseInt(match[2], 10) + 1
    return `R-${year}-${String(counter).padStart(3, '0')}`
  } catch {
    return `R-${year}-001`
  }
}
