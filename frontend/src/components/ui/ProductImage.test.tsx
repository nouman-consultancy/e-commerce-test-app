import { render, screen, fireEvent } from '@testing-library/react';
import ProductImage from './ProductImage';

describe('ProductImage', () => {
  it('shows initials when src is null', () => {
    render(<ProductImage src={null} name="Test Product" />);
    expect(screen.getByText('TP')).toBeInTheDocument();
  });

  it('shows a single initial for a one-word name', () => {
    render(<ProductImage src={null} name="Keyboard" />);
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('renders an img with the correct src when provided', () => {
    render(<ProductImage src="https://example.com/img.jpg" name="Test Product" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('shows initials after the image fails to load', () => {
    render(<ProductImage src="https://example.com/broken.jpg" name="Slim Jeans" />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('SJ')).toBeInTheDocument();
  });
});
