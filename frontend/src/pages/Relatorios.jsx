import { useState } from 'react';
import { 
  Form, 
  Button, 
  Table, 
  Card, 
  Spinner, 
  Alert,
  Row,
  Col,
  InputGroup
} from 'react-bootstrap';
import api from '../services/api';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const relatoriosList = [
  { key: 'ordens-funcionario', label: 'Ordens por Funcionário' },
  { key: 'servicos-prestados', label: 'Serviços Mais Prestados' },
  { key: 'total-pecas', label: 'Total de Peças por Período' },
  { key: 'pecas-utilizadas', label: 'Peças Mais Utilizadas' },
  { key: 'ordens-execucao', label: 'Ordens de Serviço (Execução)' },
  { key: 'desempenho-funcionarios', label: 'Desempenho dos Funcionários' },
];

const Relatorios = () => {
  // Estados para cada relatório
  const [ordensFuncionario, setOrdensFuncionario] = useState({ data: [], loading: false, error: null });
  const [servicosPrestados, setServicosPrestados] = useState({ data: [], loading: false, error: null });
  const [totalPecas, setTotalPecas] = useState({ data: null, loading: false, error: null });
  const [pecasUtilizadas, setPecasUtilizadas] = useState({ data: [], loading: false, error: null });
  const [ordensExecucao, setOrdensExecucao] = useState({ data: [], loading: false, error: null });
  const [desempenhoFuncionarios, setDesempenhoFuncionarios] = useState({ data: [], loading: false, error: null });

  // Estados para datas (agora como Date)
  const [dataInicio, setDataInicio] = useState(new Date('2025-06-01'));
  const [dataFim, setDataFim] = useState(new Date('2025-06-28'));

  // Estados para controlar o relatório ativo
  const [abaAtiva, setAbaAtiva] = useState('ordens-funcionario');

  // Função helper para tratar objetos
  const renderValue = (value, field = null) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      if (field && value[field]) return value[field];
      if (value.nome) return value.nome;
      if (value.descricao) return value.descricao;
      if (value.placa) return value.placa;
      return 'N/A';
    }
    return value;
  };

  // Função para formatar datas para a API
  const formatarDataParaAPI = (data) => {
    if (!data) return '';
    return data.toISOString().split('T')[0];
  };

  // Função para gerar relatório de ordens por funcionário
  const gerarRelatorioOrdensFuncionario = async () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, preencha as datas de início e fim.');
      return;
    }
    setOrdensFuncionario(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get('/abertura-servico/relatorio/funcionarios', {
        params: {
          dataInicio: formatarDataParaAPI(dataInicio),
          dataFim: formatarDataParaAPI(dataFim)
        }
      });
      setOrdensFuncionario({ data: response.data, loading: false, error: null });
    } catch (error) {
      setOrdensFuncionario({ 
        data: [], 
        loading: false, 
        error: error.response?.data?.message || 'Erro ao carregar relatório' 
      });
    }
  };

  // Função para gerar relatório de serviços mais prestados
  const gerarRelatorioServicosPrestados = async () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, preencha as datas de início e fim.');
      return;
    }
    setServicosPrestados(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get('/relatorio-servicos', {
        params: {
          dataInicio: formatarDataParaAPI(dataInicio),
          dataFim: formatarDataParaAPI(dataFim)
        }
      });
      setServicosPrestados({ data: response.data, loading: false, error: null });
    } catch (error) {
      setServicosPrestados({ 
        data: [], 
        loading: false, 
        error: error.response?.data?.message || 'Erro ao carregar relatório' 
      });
    }
  };

  // Função para gerar relatório de total de peças
  const gerarRelatorioTotalPecas = async () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, preencha as datas de início e fim.');
      return;
    }
    setTotalPecas(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get('/relatorios/pecas/total', {
        params: {
          dataInicio: formatarDataParaAPI(dataInicio),
          dataFim: formatarDataParaAPI(dataFim)
        }
      });
      setTotalPecas({ data: response.data, loading: false, error: null });
    } catch (error) {
      setTotalPecas({ 
        data: null, 
        loading: false, 
        error: error.response?.data?.message || 'Erro ao carregar relatório' 
      });
    }
  };

  // Função para gerar relatório de peças mais utilizadas
  const gerarRelatorioPecasUtilizadas = async () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, preencha as datas de início e fim.');
      return;
    }
    setPecasUtilizadas(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get('/relatorios/pecas/mais-utilizadas', {
        params: {
          dataInicio: formatarDataParaAPI(dataInicio),
          dataFim: formatarDataParaAPI(dataFim)
        }
      });
      setPecasUtilizadas({ data: response.data, loading: false, error: null });
    } catch (error) {
      setPecasUtilizadas({ 
        data: [], 
        loading: false, 
        error: error.response?.data?.message || 'Erro ao carregar relatório' 
      });
    }
  };

  // Função para gerar relatório de ordens de execução
  const gerarRelatorioOrdensExecucao = async () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, preencha as datas de início e fim.');
      return;
    }
    setOrdensExecucao(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get('/ExecucaoServico/relatorios/ordens', {
        params: {
          dataInicio: formatarDataParaAPI(dataInicio),
          dataFim: formatarDataParaAPI(dataFim)
        }
      });
      console.log('DADOS BRUTOS RECEBIDOS DO BACK-END:', response.data);
      setOrdensExecucao({ data: response.data, loading: false, error: null });
    } catch (error) {
      setOrdensExecucao({ 
        data: [], 
        loading: false, 
        error: error.response?.data?.message || 'Erro ao carregar relatório' 
      });
    }
  };

  // Função para gerar relatório de desempenho dos funcionários
  const gerarRelatorioDesempenho = async () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, preencha as datas de início e fim.');
      return;
    }
    setDesempenhoFuncionarios(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get('/ExecucaoServico/relatorios/desempenho', {
        params: {
          dataInicio: formatarDataParaAPI(dataInicio),
          dataFim: formatarDataParaAPI(dataFim)
        }
      });
      setDesempenhoFuncionarios({ data: response.data, loading: false, error: null });
    } catch (error) {
      setDesempenhoFuncionarios({ 
        data: [], 
        loading: false, 
        error: error.response?.data?.message || 'Erro ao carregar relatório' 
      });
    }
  };

  // Função auxiliar para formatação segura de datas
  function formatarDataSegura(dataString) {
    if (!dataString) return '-';
    const dataObj = new Date(dataString);
    if (isNaN(dataObj.getTime())) return '-';
    return dataObj.toLocaleDateString('pt-BR');
  }

  // Função auxiliar para formatação segura de valores monetários
  function formatarValor(valor) {
    if (valor === null || valor === undefined) return '-';
    return `R$ ${Number(valor).toFixed(2)}`;
  }

  // Componente para campos de data melhorado com DatePicker
  const DateRangeSelector = ({ onGenerate }) => (
    <div className="mb-4">
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              <i className="bi bi-calendar-event me-2"></i>
              Data Início
            </Form.Label>
            <DatePicker
              selected={dataInicio}
              onChange={date => setDataInicio(date)}
              selectsStart
              startDate={dataInicio}
              endDate={dataFim}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              <i className="bi bi-calendar-check me-2"></i>
              Data Fim
            </Form.Label>
            <DatePicker
              selected={dataFim}
              onChange={date => setDataFim(date)}
              selectsEnd
              startDate={dataInicio}
              endDate={dataFim}
              minDate={dataInicio}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button variant="primary" onClick={onGenerate} className="w-100">
            <i className="bi bi-graph-up me-2"></i>
            Gerar Relatório
          </Button>
        </Col>
      </Row>
      
      {/* Botões de atalho para períodos comuns */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              variant="outline-info" 
              size="sm" 
              onClick={() => {
                const hoje = new Date();
                const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                setDataInicio(inicioMes);
                setDataFim(hoje);
              }}
            >
              <i className="bi bi-calendar-month me-1"></i>
              Este mês
            </Button>
            <Button 
              variant="outline-info" 
              size="sm" 
              onClick={() => {
                const hoje = new Date();
                const inicioAno = new Date(hoje.getFullYear(), 0, 1);
                setDataInicio(inicioAno);
                setDataFim(hoje);
              }}
            >
              <i className="bi bi-calendar-year me-1"></i>
              Este ano
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="tab-content-container">
      <div className="relatorios-bar">
        {relatoriosList.map(r => (
          <button
            key={r.key}
            className={`relatorios-btn${abaAtiva === r.key ? ' active' : ''}`}
            onClick={() => setAbaAtiva(r.key)}
            type="button"
          >
            {r.label}
          </button>
        ))}
      </div>
      {/* Renderização condicional dos relatórios conforme abaAtiva */}
      {abaAtiva === 'ordens-funcionario' && (
        <div className="p-3">
          <DateRangeSelector onGenerate={gerarRelatorioOrdensFuncionario} />
          
          {ordensFuncionario.loading && (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          )}

          {ordensFuncionario.error && (
            <Alert variant="danger">{ordensFuncionario.error}</Alert>
          )}

          {ordensFuncionario.data.length > 0 && (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome do Funcionário</th>
                  <th>Total de Ordens</th>
                </tr>
              </thead>
              <tbody>
                {ordensFuncionario.data.map((item, index) => (
                  <tr key={index}>
                    <td>{renderValue(item.nomeFuncionario)}</td>
                    <td>{item.totalOrdens}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}
      {abaAtiva === 'servicos-prestados' && (
        <div className="p-3">
          <DateRangeSelector onGenerate={gerarRelatorioServicosPrestados} />
          
          {servicosPrestados.loading && (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          )}

          {servicosPrestados.error && (
            <Alert variant="danger">{servicosPrestados.error}</Alert>
          )}

          {servicosPrestados.data.length > 0 && (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Descrição do Serviço</th>
                  <th>Quantidade Realizada</th>
                  <th>Receita Total</th>
                </tr>
              </thead>
              <tbody>
                {servicosPrestados.data.map((item, index) => (
                  <tr key={index}>
                    <td>{renderValue(item.descricaoServico)}</td>
                    <td>{item.quantidadeRealizada}</td>
                    <td>R$ {item.receitaTotal?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}
      {abaAtiva === 'total-pecas' && (
        <div className="p-3">
          <DateRangeSelector onGenerate={gerarRelatorioTotalPecas} />
          
          {totalPecas.loading && (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          )}

          {totalPecas.error && (
            <Alert variant="danger">{totalPecas.error}</Alert>
          )}

          {totalPecas.data && (
            <Card className="text-center">
              <Card.Body>
                <Card.Title>Total de Peças Utilizadas</Card.Title>
                <Card.Text className="display-4 text-primary">
                  R$ {totalPecas.data.total?.toFixed(2) || '0.00'}
                </Card.Text>
                <Card.Text className="text-muted">
                  Período: {dataInicio.toLocaleDateString('pt-BR')} a {dataFim.toLocaleDateString('pt-BR')}
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </div>
      )}
      {abaAtiva === 'pecas-utilizadas' && (
        <div className="p-3">
          <DateRangeSelector onGenerate={gerarRelatorioPecasUtilizadas} />
          
          {pecasUtilizadas.loading && (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          )}

          {pecasUtilizadas.error && (
            <Alert variant="danger">{pecasUtilizadas.error}</Alert>
          )}

          {pecasUtilizadas.data.length > 0 && (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome da Peça</th>
                  <th>Quantidade Utilizada</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {pecasUtilizadas.data.map((item, index) => (
                  <tr key={index}>
                    <td>{renderValue(item.nomePeca)}</td>
                    <td>{item.quantidadeUtilizada}</td>
                    <td>R$ {item.valorTotal?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}
      {abaAtiva === 'ordens-execucao' && (
        <div className="p-3">
          <DateRangeSelector onGenerate={gerarRelatorioOrdensExecucao} />
          
          {ordensExecucao.loading && (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          )}

          {ordensExecucao.error && (
            <Alert variant="danger">{ordensExecucao.error}</Alert>
          )}

          {ordensExecucao.data.length > 0 && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID da OS</th>
                  <th>Cliente</th>
                  <th>Veículo</th>
                  <th>Serviço</th>
                  <th>Valor</th>
                  <th>Valor com Desconto</th>
                </tr>
              </thead>
              <tbody>
                {ordensExecucao.data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.ordem_servico?.numero ?? '-'}</td>
                    <td>{item.cliente?.nome ?? '-'}</td>
                    <td>{item.veiculo?.modelo ?? item.veiculo?.placa ?? '-'}</td>
                    <td>{item.servico?.descricao ?? '-'}</td>
                    <td>{formatarValor(item.valores?.total)}</td>
                    <td>{formatarValor(item.valores?.com_desconto)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}
      {abaAtiva === 'desempenho-funcionarios' && (
        <div className="p-3">
          <DateRangeSelector onGenerate={gerarRelatorioDesempenho} />
          
          {desempenhoFuncionarios.loading && (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          )}

          {desempenhoFuncionarios.error && (
            <Alert variant="danger">{desempenhoFuncionarios.error}</Alert>
          )}

          {desempenhoFuncionarios.data.length > 0 && (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome do Funcionário</th>
                  <th>Cargo</th>
                  <th>Serviços Concluídos</th>
                  <th>Taxa de Conclusão</th>
                  <th>Eficiência</th>
                  <th>Receita Total</th>
                </tr>
              </thead>
              <tbody>
                {desempenhoFuncionarios.data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.funcionario?.nome ?? '-'}</td>
                    <td>{item.funcionario?.cargo ?? '-'}</td>
                    <td>{item.indicadores?.servicos_concluidos ?? '-'}</td>
                    <td>{item.indicadores?.taxa_conclusao ?? '-'}</td>
                    <td>{item.indicadores?.eficiencia ?? '-'}</td>
                    <td>{formatarValor(item.indicadores?.valor_total_servicos)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};

export default Relatorios; 