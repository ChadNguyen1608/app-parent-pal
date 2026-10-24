import { render, screen } from '@testing-library/react-native';
import Home from '../app/index';
test('renders home', async () => {
  await render(<Home />);
  expect(await screen.findByTestId('hello')).toBeTruthy();
});
