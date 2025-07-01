import { Tabs, Tab } from 'react-bootstrap';
import Funcionarios from './Funcionarios';
import Clientes from './Clientes';
import Veiculos from './Veiculos';
import Pecas from './Pecas';
import Servicos from './Servicos';
import FormasPagamento from './FormasPagamento';

const CadastrosTabs = () => (
  <div className="tab-content-container">
    <Tabs id="cadastros-tabs" defaultActiveKey="funcionarios" className="mb-3">
      <Tab eventKey="funcionarios" title="Funcionários">
        <Funcionarios />
      </Tab>
      <Tab eventKey="clientes" title="Clientes">
        <Clientes />
      </Tab>
      <Tab eventKey="veiculos" title="Veículos">
        <Veiculos />
      </Tab>
      <Tab eventKey="pecas" title="Peças">
        <Pecas />
      </Tab>
      <Tab eventKey="servicos" title="Serviços">
        <Servicos />
      </Tab>
      <Tab eventKey="formas-pagamento" title="Formas de Pagamento">
        <FormasPagamento />
      </Tab>
    </Tabs>
  </div>
);

export default CadastrosTabs; 