import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white mt-auto py-3">
      <Container className="text-center">
        <span>Sistema de Oficina &copy; {new Date().getFullYear()}</span>
      </Container>
    </footer>
  );
};

export default Footer; 