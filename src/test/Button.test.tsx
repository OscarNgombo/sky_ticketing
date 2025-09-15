import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../shared/components/buttons/Button'

describe('Button', () => {
  it('renders children and applies variant/className', () => {
    render(<Button variant="primary" className="extra">Click me</Button>)
    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toBeInTheDocument()
    expect(btn.className).toContain('btn')
    expect(btn.className).toContain('btn-primary')
    expect(btn.className).toContain('extra')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole('button', { name: /go/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
