/**
 * PII Tokenization Service
 *
 * Automatically detects and tokenizes PII in data before MCP processing
 */

export interface TokenMapping {
  [token: string]: string
}

export class PIITokenizer {
  private tokenMap: Map<string, string> = new Map()
  private reverseMap: Map<string, string> = new Map()

  /**
   * Tokenize PII in text
   */
  tokenize(text: string): [string, TokenMapping] {
    let tokenized = text
    const mapping: TokenMapping = {}

    // Email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    tokenized = tokenized.replace(emailRegex, match => {
      const token = this.generateToken('EMAIL')
      mapping[token] = match
      return token
    })

    // Phone numbers
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
    tokenized = tokenized.replace(phoneRegex, match => {
      const token = this.generateToken('PHONE')
      mapping[token] = match
      return token
    })

    // SSN
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g
    tokenized = tokenized.replace(ssnRegex, match => {
      const token = this.generateToken('SSN')
      mapping[token] = match
      return token
    })

    return [tokenized, mapping]
  }

  /**
   * Detokenize text
   */
  detokenize(text: string, mapping: TokenMapping): string {
    let detokenized = text

    for (const [token, value] of Object.entries(mapping)) {
      detokenized = detokenized.replace(new RegExp(token, 'g'), value)
    }

    return detokenized
  }

  private generateToken(type: string): string {
    const random = Math.random().toString(36).substring(2, 8)
    return `<PII:${type}_${random}>`
  }
}
