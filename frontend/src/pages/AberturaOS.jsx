import { useState, useEffect } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Alert,
  Spinner,
  Container,
  Row,
  Col,
  Card
} from 'react-bootstrap'
import { PencilFill, TrashFill } from 'react-bootstrap-icons'
import api from '../services/api'

function AberturaOS() {
  const [ordens, setOrdens] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [veiculosFiltrados, setVeiculosFiltrados] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicos, setServicos] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOrdem, setSelectedOrdem] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Função auxiliar para tratar erros de forma padronizada
  const handleApiError = (err, operation) => {
    console.error(`Erro ao ${operation}:`, err.response);

    // Verifica se a resposta do erro e a mensagem existem
    if (err.response && err.response.data && (err.response.data.message || err.response.data.mensagem)) {
      // Extrai a mensagem de erro específica do back-end
      setError(err.response.data.message || err.response.data.mensagem);
    } else {
      // Se não houver uma mensagem específica, exibe um erro genérico
      setError(`Ocorreu um erro ao ${operation}. Tente novamente.`);
    }
  }

  // Form state
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    clienteId: '',
    veiculoId: '',
    servicoId: '',
    funcionarioId: '',
    cpfCliente: ''
  })

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    data: '',
    veiculoId: '',
    servicoId: '',
    funcionarioId: ''
  })

  // Buscar ordens de serviço
  const fetchOrdens = async () => {
    try {
      const response = await api.get('/aberturaservico')
      setOrdens(response.data)
    } catch (err) {
      handleApiError(err, 'carregar ordens de serviço')
    }
  }

  // Buscar veículos
  const fetchVeiculos = async () => {
    try {
      const response = await api.get('/veiculos')
      setVeiculos(response.data)
    } catch (err) {
      handleApiError(err, 'carregar veículos')
    }
  }

  // Buscar serviços
  const fetchServicos = async () => {
    try {
      const response = await api.get('/servicos')
      setServicos(response.data)
    } catch (err) {
      handleApiError(err, 'carregar serviços')
    }
  }

  // Buscar funcionários
  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios')
      setFuncionarios(response.data)
    } catch (err) {
      handleApiError(err, 'carregar funcionários')
    }
  }

  // Buscar clientes
  const fetchClientes = async () => {
    try {
      const response = await api.get('/cliente')
      setClientes(response.data)
    } catch (err) {
      handleApiError(err, 'carregar clientes')
    }
  }

  // Manipulador de mudança de cliente
  const handleClienteChange = (clienteId) => {
    if (clienteId) {
      // Encontrar o cliente selecionado
      const clienteSelecionado = clientes.find(cliente => cliente.id === parseInt(clienteId))
      
      if (clienteSelecionado) {
        // Preencher o CPF automaticamente
        setFormData(prev => ({
          ...prev,
          clienteId: clienteId,
          cpfCliente: clienteSelecionado.cpf,
          veiculoId: '' // Limpar veículo selecionado
        }))
        
        // Filtrar veículos do cliente
        const veiculosDoCliente = veiculos.filter(veiculo => veiculo.cliente_id === parseInt(clienteId))
        setVeiculosFiltrados(veiculosDoCliente)
      }
    } else {
      // Se nenhum cliente for selecionado, limpar tudo
      setFormData(prev => ({
        ...prev,
        clienteId: '',
        cpfCliente: '',
        veiculoId: ''
      }))
      setVeiculosFiltrados([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchOrdens(),
        fetchVeiculos(),
        fetchServicos(),
        fetchFuncionarios(),
        fetchClientes()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      clienteId: '',
      veiculoId: '',
      servicoId: '',
      funcionarioId: '',
      cpfCliente: ''
    })
    setVeiculosFiltrados([])
  }

  // Submeter formulário de criação
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Encontrar o cliente selecionado para obter o nome
    const clienteSelecionado = clientes.find(cliente => cliente.id === parseInt(formData.clienteId))
    
    const dadosParaEnviar = {
      data: formData.data,
      veiculoId: formData.veiculoId,
      servicoId: formData.servicoId,
      funcionarioId: formData.funcionarioId,
      nomeCliente: clienteSelecionado ? clienteSelecionado.nome : '',
      cpfCliente: formData.cpfCliente
    }
    
    try {
      await api.post('/aberturaservico', dadosParaEnviar)
      setSuccess('Ordem de serviço criada com sucesso!')
      clearForm()
      fetchOrdens()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      handleApiError(err, 'criar Ordem de Serviço')
    }
  }

  // Abrir modal para editar
  const handleEdit = (ordem) => {
    setSelectedOrdem(ordem)
    setEditFormData({
      data: ordem.data || '',
      veiculoId: ordem.veiculo_id || ordem.veiculoId || '',
      servicoId: ordem.servico_id || ordem.servicoId || '',
      funcionarioId: ordem.funcionario_id || ordem.funcionarioId || ''
    })
    setShowEditModal(true)
  }

  // Submeter formulário de edição
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await api.put(`/aberturaservico/${selectedOrdem.id}`, editFormData)
      setSuccess('Ordem de serviço atualizada com sucesso!')
      setShowEditModal(false)
      setSelectedOrdem(null)
      fetchOrdens()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      handleApiError(err, 'atualizar Ordem de Serviço')
    }
  }

  // Abrir modal de confirmação para excluir
  const handleDelete = (ordem) => {
    setSelectedOrdem(ordem)
    setShowDeleteModal(true)
  }

  // Confirmar exclusão
  const confirmDelete = async () => {
    try {
      await api.delete(`/aberturaservico/${selectedOrdem.id}`)
      setSuccess('Ordem de serviço excluída com sucesso!')
      setShowDeleteModal(false)
      setSelectedOrdem(null)
      fetchOrdens()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      handleApiError(err, 'excluir Ordem de Serviço')
    }
  }

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Obter nome do veículo
  const getVeiculoNome = (ordem) => {
    // Se temos dados aninhados do veículo, use-os
    if (ordem.veiculo) {
      return `${ordem.veiculo.marca} ${ordem.veiculo.modelo} - ${ordem.veiculo.placa}`
    }
    // Caso contrário, busque no array local
    const veiculoId = ordem.veiculo_id || ordem.veiculoId
    const veiculo = veiculos.find(v => v.id === veiculoId)
    return veiculo ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}` : 'Veículo não encontrado'
  }

  // Obter descrição do serviço
  const getServicoDescricao = (ordem) => {
    // Se temos dados aninhados do serviço, use-os
    if (ordem.servico) {
      return ordem.servico.descricao
    }
    // Caso contrário, busque no array local
    const servicoId = ordem.servico_id || ordem.servicoId
    const servico = servicos.find(s => s.id === servicoId)
    return servico ? servico.descricao : 'Serviço não encontrado'
  }

  // Obter nome do funcionário
  const getFuncionarioNome = (ordem) => {
    // Se temos dados aninhados do funcionário, use-os
    if (ordem.funcionario) {
      return ordem.funcionario.nome
    }
    // Caso contrário, busque no array local
    const funcionarioId = ordem.funcionario_id || ordem.funcionarioId
    const funcionario = funcionarios.find(f => f.id === funcionarioId)
    return funcionario ? funcionario.nome : 'Funcionário não encontrado'
  }

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    )
  }

  return (
    <Container>
      <h2 className="mb-4">Abertura de Ordem de Serviço</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Formulário de Abertura - Sempre Visível */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Nova Ordem de Serviço</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Data *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Select
                    value={formData.clienteId}
                    onChange={(e) => handleClienteChange(e.target.value)}
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Veículo *</Form.Label>
                  <Form.Select
                    value={formData.veiculoId}
                    onChange={(e) => setFormData({...formData, veiculoId: e.target.value})}
                    required
                    disabled={!formData.clienteId}
                  >
                    <option value="">Selecione um veículo</option>
                    {veiculosFiltrados.map((veiculo) => (
                      <option key={veiculo.id} value={veiculo.id}>
                        {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Serviço *</Form.Label>
                  <Form.Select
                    value={formData.servicoId}
                    onChange={(e) => setFormData({...formData, servicoId: e.target.value})}
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {servicos.map((servico) => (
                      <option key={servico.id} value={servico.id}>
                        {servico.descricao}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Funcionário *</Form.Label>
                  <Form.Select
                    value={formData.funcionarioId}
                    onChange={(e) => setFormData({...formData, funcionarioId: e.target.value})}
                    required
                  >
                    <option value="">Selecione um funcionário</option>
                    {funcionarios.map((funcionario) => (
                      <option key={funcionario.id} value={funcionario.id}>
                        {funcionario.nome} - {funcionario.cargo}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>CPF do Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.cpfCliente}
                    readOnly
                    placeholder="Preenchido automaticamente"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit">
              Criar Ordem de Serviço
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Tabela de Ordens */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Ordens de Serviço Abertas</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Veículo</th>
                <th>Serviço</th>
                <th>Funcionário</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((ordem) => (
                <tr key={ordem.id}>
                  <td>{ordem.id}</td>
                  <td>{formatDate(ordem.data)}</td>
                  <td>{getVeiculoNome(ordem)}</td>
                  <td>{getServicoDescricao(ordem)}</td>
                  <td>{getFuncionarioNome(ordem)}</td>
                  <td>
                    <Button 
                      variant="info" 
                      size="sm" 
                      className="btn-action-primary me-2"
                      onClick={() => handleEdit(ordem)}
                    >
                      <PencilFill className="me-2" /> Editar
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      className="btn-action-primary"
                      onClick={() => handleDelete(ordem)}
                    >
                      <TrashFill className="me-2" /> Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de Edição */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Ordem de Serviço</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data *</Form.Label>
                  <Form.Control
                    type="date"
                    value={editFormData.data}
                    onChange={(e) => setEditFormData({...editFormData, data: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Veículo *</Form.Label>
                  <Form.Select
                    value={editFormData.veiculoId}
                    onChange={(e) => setEditFormData({...editFormData, veiculoId: e.target.value})}
                    required
                  >
                    <option value="">Selecione um veículo</option>
                    {veiculos.map((veiculo) => (
                      <option key={veiculo.id} value={veiculo.id}>
                        {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Serviço *</Form.Label>
                  <Form.Select
                    value={editFormData.servicoId}
                    onChange={(e) => setEditFormData({...editFormData, servicoId: e.target.value})}
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {servicos.map((servico) => (
                      <option key={servico.id} value={servico.id}>
                        {servico.descricao}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Funcionário *</Form.Label>
                  <Form.Select
                    value={editFormData.funcionarioId}
                    onChange={(e) => setEditFormData({...editFormData, funcionarioId: e.target.value})}
                    required
                  >
                    <option value="">Selecione um funcionário</option>
                    {funcionarios.map((funcionario) => (
                      <option key={funcionario.id} value={funcionario.id}>
                        {funcionario.nome} - {funcionario.cargo}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Atualizar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir a ordem de serviço <strong>#{selectedOrdem?.id}</strong>?
          Esta ação não pode ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default AberturaOS 