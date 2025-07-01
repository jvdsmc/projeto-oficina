import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { WrenchAdjustableCircleFill } from 'react-bootstrap-icons';

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="px-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <WrenchAdjustableCircleFill className="me-2" size={24} />
          Sistema de Oficina
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown title="Cadastros" id="cadastros-dropdown">
              <NavDropdown.Item as={Link} to="/cadastros/funcionarios">Funcionários</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cadastros/clientes">Clientes</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cadastros/veiculos">Veículos</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cadastros/pecas">Peças</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cadastros/servicos">Serviços</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cadastros/formas-pagamento">Formas de Pagamento</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Processos" id="processos-dropdown">
              <NavDropdown.Item as={Link} to="/processos/abertura-os">Abertura de OS</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/processos/adicao-pecas">Adição de Peças</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/processos/execucao">Execução de Serviço</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/relatorios">Relatórios</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 