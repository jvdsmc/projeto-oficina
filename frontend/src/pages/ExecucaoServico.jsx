import { useState, useEffect } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Alert,
  Spinner,
  Container,
  Card,
  Row,
  Col,
  Badge
} from 'react-bootstrap'
import { PencilFill, TrashFill } from 'react-bootstrap-icons'
import api from '../services/api'

function ExecucaoServico() {
  const [ordensAbertas, setOrdensAbertas] = useState([])
  const [servicosFinalizados, setServicosFinalizados] = useState([])
  const [formasPagamento, setFormasPagamento] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedExecucao, setSelectedExecucao] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state para criação
  const [formData, setFormData] = useState({
    ordemServicoId: '',
    valor: '',
    dataFinalizacao: new Date().toISOString().split('T')[0],
    formaPagamentoId: ''
  })

  // Form state para edição
  const [editFormData, setEditFormData] = useState({
    valor: '',
    dataFinalizacao: '',
    formaPagamentoId: ''
  })

  // Dados da OS selecionada (read-only)
  const [selectedOrdemData, setSelectedOrdemData] = useState(null)

  // Buscar ordens de serviço abertas
  const fetchOrdensAbertas = async () => {
    try {
      const response = await api.get('/aberturaservico')
      // Filtrar apenas ordens que não foram finalizadas
      const ordens = response.data.filter(ordem => {
        return !servicosFinalizados.some(execucao => 
          execucao.aberturaServico?.id === ordem.id
        )
      })
      setOrdensAbertas(ordens)
    } catch (err) {
      setError('Erro ao carregar ordens de serviço')
      console.error(err)
    }
  }

  // Buscar serviços finalizados
  const fetchServicosFinalizados = async () => {
    try {
      const response = await api.get('/ExecucaoServico')
      setServicosFinalizados(response.data)
    } catch (err) {
      setError('Erro ao carregar serviços finalizados')
      console.error(err)
    }
  }

  // Buscar formas de pagamento
  const fetchFormasPagamento = async () => {
    try {
      const response = await api.get('/formaPagamento')
      setFormasPagamento(response.data)
    } catch (err) {
      setError('Erro ao carregar formas de pagamento')
      console.error(err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchFormasPagamento(),
        fetchServicosFinalizados()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchOrdensAbertas()
    }
  }, [loading, servicosFinalizados])

  // Limpar formulário de criação
  const clearForm = () => {
    setFormData({
      ordemServicoId: '',
      valor: '',
      dataFinalizacao: new Date().toISOString().split('T')[0],
      formaPagamentoId: ''
    })
    setSelectedOrdemData(null)
  }

  // Abrir modal de criação
  const handleCreate = () => {
    clearForm()
    setShowCreateModal(true)
  }

  // Selecionar ordem de serviço
  const handleOrdemChange = (ordemId) => {
    if (ordemId) {
      const ordem = ordensAbertas.find(o => o.id === parseInt(ordemId))
      setSelectedOrdemData(ordem)
      setFormData({
        ...formData,
        ordemServicoId: ordemId,
        valor: ordem.servico?.maoObra || ''
      })
    } else {
      setSelectedOrdemData(null)
      setFormData({
        ...formData,
        ordemServicoId: '',
        valor: ''
      })
    }
  }

  // Submeter formulário de criação
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.ordemServicoId) {
      setError('Selecione uma ordem de serviço')
      return
    }
    
    try {
      await api.post('/ExecucaoServico', {
        valor: formData.valor,
        dataFinalizacao: formData.dataFinalizacao,
        formaPagamentoId: formData.formaPagamentoId,
        aberturaServicoId: formData.ordemServicoId
      })
      setSuccess('Execução de serviço registrada com sucesso!')
      setShowCreateModal(false)
      clearForm()
      await fetchServicosFinalizados()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data || 'Erro ao registrar execução de serviço')
      console.error(err)
    }
  }

  // Abrir modal para editar
  const handleEdit = (execucao) => {
    setSelectedExecucao(execucao)
    setEditFormData({
      valor: execucao.valor || '',
      dataFinalizacao: execucao.dataFinalizacao || '',
      formaPagamentoId: execucao.formaPagamento?.id || ''
    })
    setShowEditModal(true)
  }

  // Submeter formulário de edição
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await api.put(`/ExecucaoServico/${selectedExecucao.id}`, editFormData)
      setSuccess('Execução de serviço atualizada com sucesso!')
      setShowEditModal(false)
      setSelectedExecucao(null)
      await fetchServicosFinalizados()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data || 'Erro ao atualizar execução de serviço')
      console.error(err)
    }
  }

  // Abrir modal de confirmação para excluir
  const handleDelete = (execucao) => {
    setSelectedExecucao(execucao)
    setShowDeleteModal(true)
  }

  // Confirmar exclusão
  const confirmDelete = async () => {
    try {
      await api.delete(`/ExecucaoServico/${selectedExecucao.id}`)
      setSuccess('Execução de serviço removida com sucesso!')
      setShowDeleteModal(false)
      setSelectedExecucao(null)
      await fetchServicosFinalizados()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data || 'Erro ao remover execução de serviço')
      console.error(err)
    }
  }

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Formatar preço
  const formatPrice = (price) => {
    if (!price) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  // Obter status da execução
  const getStatus = (dataFinalizacao) => {
    if (!dataFinalizacao) return 'Concluído'
    
    const dataFinal = new Date(dataFinalizacao)
    const dataAtual = new Date()
    
    // Resetar horas para comparar apenas as datas
    dataFinal.setHours(0, 0, 0, 0)
    dataAtual.setHours(0, 0, 0, 0)
    
    if (dataFinal > dataAtual) {
      return 'Em Andamento'
    } else {
      return 'Concluído'
    }
  }

  // Obter badge de status
  const getStatusBadge = (status) => {
    return status === 'Em Andamento' 
      ? <Badge bg="warning" text="dark">{status}</Badge>
      : <Badge bg="success">{status}</Badge>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Execução de Serviço</h2>
        <Button variant="primary" onClick={handleCreate}>
          Registrar Nova Execução
        </Button>
      </div>

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

      {/* Tabela de Gerenciamento */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Gerenciamento de Execuções de Serviço</h5>
        </Card.Header>
        <Card.Body>
          {servicosFinalizados.length === 0 ? (
            <p className="text-muted">Nenhuma execução de serviço encontrada.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>OS #</th>
                  <th>Data Finalização</th>
                  <th>Veículo</th>
                  <th>Cliente</th>
                  <th>Funcionário Responsável</th>
                  <th>Valor Original</th>
                  <th>Valor com Desconto</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {servicosFinalizados.map((execucao) => (
                  <tr key={execucao.id}>
                    <td>#{execucao.aberturaServico?.id}</td>
                    <td>{formatDate(execucao.dataFinalizacao)}</td>
                    <td>
                      {execucao.aberturaServico?.veiculo?.marca} {execucao.aberturaServico?.veiculo?.modelo} - {execucao.aberturaServico?.veiculo?.placa}
                    </td>
                    <td>{execucao.aberturaServico?.veiculo?.cliente?.nome}</td>
                    <td>{execucao.aberturaServico?.funcionario?.nome}</td>
                    <td>{formatPrice(execucao.valor)}</td>
                    <td>
                      {execucao.valorComDesconto ? (
                        <span className="text-success">
                          {formatPrice(execucao.valorComDesconto)}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{getStatusBadge(getStatus(execucao.dataFinalizacao))}</td>
                    <td>
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="btn-action-primary me-2"
                        onClick={() => handleEdit(execucao)}
                      >
                        <PencilFill className="me-2" /> Editar
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        className="btn-action-primary"
                        onClick={() => handleDelete(execucao)}
                      >
                        <TrashFill className="me-2" /> Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Criação */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registrar Nova Execução de Serviço</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Selecionar Ordem de Serviço Aberta *</Form.Label>
              <Form.Select
                value={formData.ordemServicoId}
                onChange={(e) => handleOrdemChange(e.target.value)}
                required
              >
                <option value="">Selecione uma ordem de serviço</option>
                {ordensAbertas.map((ordem) => (
                  <option key={ordem.id} value={ordem.id}>
                    OS #{ordem.id} - {formatDate(ordem.data)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {selectedOrdemData && (
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Cliente</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedOrdemData.veiculo?.cliente?.nome || 'Cliente não encontrado'}
                      readOnly
                      plaintext
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Veículo</Form.Label>
                    <Form.Control
                      type="text"
                      value={`${selectedOrdemData.veiculo?.marca} ${selectedOrdemData.veiculo?.modelo} - ${selectedOrdemData.veiculo?.placa}`}
                      readOnly
                      plaintext
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Serviço Realizado</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedOrdemData.servico?.descricao || ''}
                      readOnly
                      plaintext
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor (R$) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Finalização *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dataFinalizacao}
                    onChange={(e) => setFormData({...formData, dataFinalizacao: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Forma de Pagamento *</Form.Label>
                  <Form.Select
                    value={formData.formaPagamentoId}
                    onChange={(e) => setFormData({...formData, formaPagamentoId: e.target.value})}
                    required
                  >
                    <option value="">Selecione uma forma</option>
                    {formasPagamento.map((forma) => (
                      <option key={forma.id} value={forma.id}>
                        {forma.descricao}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={!selectedOrdemData}>
              Salvar Execução
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Edição */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Execução de Serviço</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {selectedExecucao && (
              <div className="mb-3">
                <strong>OS:</strong> #{selectedExecucao.aberturaServico?.id}<br />
                <strong>Veículo:</strong> {selectedExecucao.aberturaServico?.veiculo?.marca} {selectedExecucao.aberturaServico?.veiculo?.modelo} - {selectedExecucao.aberturaServico?.veiculo?.placa}<br />
                <strong>Serviço:</strong> {selectedExecucao.aberturaServico?.servico?.descricao}
              </div>
            )}
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor (R$) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={editFormData.valor}
                    onChange={(e) => setEditFormData({...editFormData, valor: e.target.value})}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Finalização *</Form.Label>
                  <Form.Control
                    type="date"
                    value={editFormData.dataFinalizacao}
                    onChange={(e) => setEditFormData({...editFormData, dataFinalizacao: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Forma de Pagamento *</Form.Label>
                  <Form.Select
                    value={editFormData.formaPagamentoId}
                    onChange={(e) => setEditFormData({...editFormData, formaPagamentoId: e.target.value})}
                    required
                  >
                    <option value="">Selecione uma forma</option>
                    {formasPagamento.map((forma) => (
                      <option key={forma.id} value={forma.id}>
                        {forma.descricao}
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
          <Modal.Title>Confirmar Remoção</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja remover a execução de serviço da OS <strong>#{selectedExecucao?.aberturaServico?.id}</strong>?
          Esta ação não pode ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Remover
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ExecucaoServico 