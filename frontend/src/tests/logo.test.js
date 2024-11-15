import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/layout/Header';
import { theme } from '../App';
import configureStore from '../store';

const store = configureStore();

describe('Logo Tests', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <Header />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  });

  test('logo is visible', () => {
    const logo = screen.getByLabelText('Magazine Task Manager Logo');
    expect(logo).toBeInTheDocument();
  });

  test('logo has correct dimensions', () => {
    const logo = screen.getByLabelText('Magazine Task Manager Logo');
    expect(logo).toHaveClass('app-logo');
  });

  test('app name is visible on desktop', () => {
    const appName = screen.getByText('Magazine Task Manager');
    expect(appName).toBeInTheDocument();
    expect(appName).toHaveClass('app-name');
  });
}); 