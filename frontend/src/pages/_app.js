import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Layout from '../components/Layout';
import '../styles/globals.css';

const theme = extendTheme({
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  colors: {
    brand: {
      50: '#EBF8FF',
      100: '#BEE3F8',
      500: '#3182CE',
      600: '#2B6CB0',
      700: '#2C5282',
      900: '#1A365D'
    }
  }
});

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </Provider>
  );
}
