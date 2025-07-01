import { Tabs, Tab } from 'react-bootstrap';
import AberturaOS from './AberturaOS';
import AdicaoPecasOS from './AdicaoPecasOS';
import ExecucaoServico from './ExecucaoServico';

const ProcessosTabs = () => (
  <div className="tab-content-container">
    <Tabs id="processos-tabs" defaultActiveKey="abertura-os" className="mb-3">
      <Tab eventKey="abertura-os" title="Abertura de Ordem de Serviço">
        <AberturaOS />
      </Tab>
      <Tab eventKey="adicao-pecas-os" title="Adição de Peças em OS">
        <AdicaoPecasOS />
      </Tab>
      <Tab eventKey="execucao-servico" title="Execução de Serviço">
        <ExecucaoServico />
      </Tab>
    </Tabs>
  </div>
);

export default ProcessosTabs; 