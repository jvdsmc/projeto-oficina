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
import { TrashFill } from 'react-bootstrap-icons'
import api from '../services/api'

function AdicaoPecasOS() {
  const [ordens, setOrdens] = useState([])
  const [pecas, setPecas] = useState([])
  const [pecasAdicionadas, setPecasAdicionadas] = useState([])
  const [selectedOrdem, setSelectedOrdem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPeca, setSelectedPeca] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    pecaId: '',
    quantidade: '',
    valor: '',
    dataPeca: new Date().toISOString().split('T')[0]
  })

  // Buscar ordens de serviço
  const fetchOrdens = async () => {
    try {
      const response = await api.get('/aberturaservico')
      setOrdens(response.data)
    } catch (err) {
      setError('Erro ao carregar ordens de serviço')
      console.error(err)
    }
  }

  // Buscar peças
  const fetchPecas = async () => {
    try {
      const response = await api.get('/pecas')
      setPecas(response.data)
    } catch (err) {
      setError('Erro ao carregar peças')
      console.error(err)
    }
  }

  // Buscar peças adicionadas a uma OS específica
  const fetchPecasAdicionadas = async (ordemId) => {
    try {
      const response = await api.get(`/aberturaservico/${ordemId}`)
      // Verificar se a resposta tem a estrutura esperada
      if (response.data && response.data.pecas) {
        setPecasAdicionadas(response.data.pecas)
      } else {
        setPecasAdicionadas([])
      }
    } catch (err) {
      setError('Erro ao carregar peças adicionadas')
      console.error(err)
      setPecasAdicionadas([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchOrdens(),
        fetchPecas()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      pecaId: '',
      quantidade: '',
      valor: '',
      dataPeca: new Date().toISOString().split('T')[0]
    })
  }

  // Selecionar ordem de serviço
  const handleOrdemChange = async (ordemId) => {
    if (ordemId) {
      const ordem = ordens.find(o => o.id === parseInt(ordemId))
      setSelectedOrdem(ordem)
      await fetchPecasAdicionadas(ordemId)
      clearForm()
    } else {
      setSelectedOrdem(null)
      setPecasAdicionadas([])
      clearForm()
    }
  }

  // Validar data da peça
  const validateDataPeca = (dataPeca) => {
    if (!selectedOrdem || !dataPeca) return true
    
    const dataPecaDate = new Date(dataPeca)
    const dataOrdemDate = new Date(selectedOrdem.data)
    
    return dataPecaDate >= dataOrdemDate
  }

  // Submeter formulário de adição
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedOrdem) {
      setError('Selecione uma ordem de serviço primeiro')
      return
    }

    // Validação de data no front-end
    if (!validateDataPeca(formData.dataPeca)) {
      setError('A data da peça não pode ser anterior à data de abertura da OS')
      return
    }
    
    try {
      await api.post(`/aberturaservico/${selectedOrdem.id}/pecas`, {
        pecaId: formData.pecaId,
        quantidade: formData.quantidade,
        valor: formData.valor,
        data: formData.dataPeca,
        aberturaServicoId: selectedOrdem.id
      })
      setSuccess('Peça adicionada com sucesso!')
      clearForm()
      await fetchPecasAdicionadas(selectedOrdem.id)
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data || 'Erro ao adicionar peça')
      console.error(err)
    }
  }

  // Abrir modal de confirmação para excluir
  const handleDelete = (peca) => {
    setSelectedPeca(peca)
    setShowDeleteModal(true)
  }

  // Confirmar exclusão
  const confirmDelete = async () => {
    try {
      await api.delete(`/aberturaservico/pecas/${selectedPeca.id}`)
      setSuccess('Peça removida com sucesso!')
      setShowDeleteModal(false)
      setSelectedPeca(null)
      await fetchPecasAdicionadas(selectedOrdem.id)
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data || 'Erro ao remover peça')
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

  // Obter nome da peça
  const getPecaNome = (pecaId) => {
    const peca = pecas.find(p => p.id === pecaId)
    return peca ? peca.nome : 'Peça não encontrada'
  }

  // Obter código da peça
  const getPecaCodigo = (pecaId) => {
    const peca = pecas.find(p => p.id === pecaId)
    return peca ? peca.codigo : '-'
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
      <h2 className="mb-4">Adição de Peças em Ordem de Serviço</h2>

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

      {/* Seleção de Ordem de Serviço */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Selecionar Ordem de Serviço</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group>
            <Form.Label>Ordem de Serviço *</Form.Label>
            <Form.Select
              onChange={(e) => handleOrdemChange(e.target.value)}
              value={selectedOrdem?.id || ''}
            >
              <option value="">Selecione uma ordem de serviço</option>
              {ordens.map((ordem) => (
                <option key={ordem.id} value={ordem.id}>
                  OS #{ordem.id} - {formatDate(ordem.data)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Detalhes da OS Selecionada */}
      {selectedOrdem && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Detalhes da Ordem de Serviço #{selectedOrdem.id}</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <strong>Data de Abertura:</strong><br />
                {formatDate(selectedOrdem.data)}
              </Col>
              <Col md={3}>
                <strong>Veículo:</strong><br />
                {selectedOrdem.veiculo?.marca} {selectedOrdem.veiculo?.modelo} - {selectedOrdem.veiculo?.placa}
              </Col>
              <Col md={3}>
                <strong>Serviço:</strong><br />
                {selectedOrdem.servico?.descricao}
              </Col>
              <Col md={3}>
                <strong>Funcionário:</strong><br />
                {selectedOrdem.funcionario?.nome}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Formulário de Adição de Peças */}
      {selectedOrdem && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Adicionar Peça</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Peça *</Form.Label>
                    <Form.Select
                      value={formData.pecaId}
                      onChange={(e) => setFormData({...formData, pecaId: e.target.value})}
                      required
                    >
                      <option value="">Selecione uma peça</option>
                      {pecas.map((peca) => (
                        <option key={peca.id} value={peca.id}>
                          {peca.nome} (Código: {peca.codigo})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantidade *</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.quantidade}
                      onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                      required
                      min="1"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Valor Unitário (R$) *</Form.Label>
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
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data da Peça *</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.dataPeca}
                      onChange={(e) => setFormData({...formData, dataPeca: e.target.value})}
                      required
                      min={selectedOrdem.data}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" type="submit">
                Adicionar Peça
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Tabela de Peças Adicionadas */}
      {selectedOrdem && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">Peças Adicionadas à OS #{selectedOrdem.id}</h5>
          </Card.Header>
          <Card.Body>
            {pecasAdicionadas.length === 0 ? (
              <p className="text-muted">Nenhuma peça adicionada ainda.</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Peça</th>
                    <th>Código</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário</th>
                    <th>Valor Total</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pecasAdicionadas.map((peca) => (
                    <tr key={peca.id}>
                      <td>{getPecaNome(peca.peca_id || peca.pecaId)}</td>
                      <td>{getPecaCodigo(peca.peca_id || peca.pecaId)}</td>
                      <td>{peca.quantidade}</td>
                      <td>{formatPrice(peca.valor)}</td>
                      <td>{formatPrice(peca.quantidade * peca.valor)}</td>
                      <td>{formatDate(peca.data)}</td>
                      <td>
                        <Button 
                          variant="danger" 
                          size="sm"
                          className="btn-action-primary"
                          onClick={() => handleDelete(peca)}
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
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Remoção</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja remover a peça <strong>{getPecaNome(selectedPeca?.peca_id || selectedPeca?.pecaId)}</strong>?
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

export default AdicaoPecasOS 