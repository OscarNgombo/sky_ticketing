import { describe, it, expect } from 'vitest'
import { encryptData, decryptData, hashPassword, comparePassword } from '../utils/crypto'

describe('crypto utils', () => {
  it('encrypts and decrypts round-trip with default secret', () => {
    const payload = { a: 1, b: 'x' }
    const enc = encryptData(payload)
    expect(enc).toBeTypeOf('string')
    const dec = decryptData(enc)
    expect(JSON.parse(dec)).toEqual(payload)
  })

  it('decryptData returns empty string with wrong secret', () => {
    const text = 'hello-world'
    const enc = encryptData(text)
    const decWrong = decryptData(enc, 'wrong-secret')
    expect(decWrong).toBe('')
  })

  it('hashPassword is deterministic and comparePassword works', () => {
    const pw = 'S3cureP@ss'
    const h1 = hashPassword(pw)
    const h2 = hashPassword(pw)
    expect(h1).toEqual(h2)
    expect(comparePassword(pw, h1)).toBe(true)
    expect(comparePassword('other', h1)).toBe(false)
  })
})

