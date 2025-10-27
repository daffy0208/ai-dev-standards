import { render, screen } from '@testing-library/react'
import { Testbutton } from './Testbutton'

describe('Testbutton', () => {
  it('renders without crashing', () => {
    render(<Testbutton {...mockProps} />)
    expect(screen.getByText('Testbutton')).toBeInTheDocument()
  })

  // FIX: Only test className if component actually supports it
  // This test is removed because generated components don't accept className prop
  // Add className to your component props if you want to test it
})

const mockProps = {
  label: 'test-label',
  onClick: jest.fn(),
}
