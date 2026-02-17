import { render, screen } from '@testing-library/react';
import Page from './page';

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Page />);
    const main = screen.getByRole('main'); // Next.js template usually has a main tag
    // If not, we can look for something else or just expect render to not throw
    expect(main).toBeInTheDocument();
  });
});
