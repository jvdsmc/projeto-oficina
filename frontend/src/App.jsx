import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Funcionarios from './pages/Funcionarios';
import Clientes from './pages/Clientes';
import Veiculos from './pages/Veiculos';
import Pecas from './pages/Pecas';
import Servicos from './pages/Servicos';
import FormasPagamento from './pages/FormasPagamento';
import AberturaOS from './pages/AberturaOS';
import AdicaoPecasOS from './pages/AdicaoPecasOS';
import ExecucaoServico from './pages/ExecucaoServico';
import Relatorios from './pages/Relatorios';
import './App.css';

function App() {
  return (
    <>
      <Header />
      <Container className="mt-4">
        <div className="content-container p-4">
          <Routes>
            <Route path="/" element={<h2>Bem-vindo ao Sistema de Oficina!</h2>} />
            {/* Rotas de Cadastros */}
            <Route path="/cadastros/funcionarios" element={<Funcionarios />} />
            <Route path="/cadastros/clientes" element={<Clientes />} />
            <Route path="/cadastros/veiculos" element={<Veiculos />} />
            <Route path="/cadastros/pecas" element={<Pecas />} />
            <Route path="/cadastros/servicos" element={<Servicos />} />
            <Route path="/cadastros/formas-pagamento" element={<FormasPagamento />} />
            {/* Rotas de Processos */}
            <Route path="/processos/abertura-os" element={<AberturaOS />} />
            <Route path="/processos/adicao-pecas" element={<AdicaoPecasOS />} />
            <Route path="/processos/execucao" element={<ExecucaoServico />} />
            {/* Rota de Relatórios */}
            <Route path="/relatorios/*" element={<Relatorios />} />
          </Routes>
        </div>
      </Container>
    </>
  );
}

export default App;
