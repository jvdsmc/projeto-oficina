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
  Col
} from 'react-bootstrap'
import { PencilFill, TrashFill } from 'react-bootstrap-icons'
import api from '../services/api'

function Pecas() {
  const [pecas, setPecas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPeca, setSelectedPeca] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    preco: '',
    estoque: '',
    fornecedor: ''
  })

  // Buscar peças
  const fetchPecas = async () => {
    try {
      setLoading(true)
      const response = await api.get('/pecas')
      setPecas(response.data)
    } catch (err) {
      setError('Erro ao carregar peças')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPecas()
  }, [])

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      preco: '',
      estoque: '',
      fornecedor: ''
    })
    setSelectedPeca(null)
  }

  // Abrir modal para adicionar
  const handleAdd = () => {
    clearForm()
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (peca) => {
    setSelectedPeca(peca)
    setFormData({
      nome: peca.nome || '',
      codigo: peca.codigo || '',
      preco: peca.preco || '',
      estoque: peca.estoque || '',
      fornecedor: peca.fornecedor || ''
    })
    setShowModal(true)
  }

  // Abrir modal de confirmação para excluir
  const handleDelete = (peca) => {
    setSelectedPeca(peca)
    setShowDeleteModal(true)
  }

  // Submeter formulário (criar/editar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedPeca) {
        // Editar
        await api.put(`/pecas/${selectedPeca.id}`, formData)
        setSuccess('Peça atualizada com sucesso!')
      } else {
        // Criar
        await api.post('/pecas', formData)
        setSuccess('Peça criada com sucesso!')
      }
      
      setShowModal(false)
      clearForm()
      fetchPecas()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar peça')
      console.error(err)
    }
  }

  // Confirmar exclusão
  const confirmDelete = async () => {
    try {
      await api.delete(`/pecas/${selectedPeca.id}`)
      setSuccess('Peça excluída com sucesso!')
      setShowDeleteModal(false)
      setSelectedPeca(null)
      fetchPecas()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir peça')
      console.error(err)
    }
  }

  // Formatar preço
  const formatPrice = (price) => {
    if (!price) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
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
      <Row className="mb-3">
        <Col>
          <h2>Gerenciar Peças</h2>
        </Col>
        <Col xs="auto">
          <Button className="btn-action-primary" onClick={handleAdd}>
            Adicionar Peça
          </Button>
        </Col>
      </Row>

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

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Código</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Fornecedor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pecas.map((peca) => (
            <tr key={peca.id}>
              <td>{peca.nome}</td>
              <td>{peca.codigo}</td>
              <td>{formatPrice(peca.preco)}</td>
              <td>{peca.estoque}</td>
              <td>{peca.fornecedor || '-'}</td>
              <td>
                <Button variant="info" size="sm" onClick={() => handleEdit(peca)}>
                  <PencilFill className="me-2" /> Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(peca)}>
                  <TrashFill className="me-2" /> Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de Formulário */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedPeca ? 'Editar Peça' : 'Adicionar Peça'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                    maxLength={50}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    required
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Preço *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Estoque *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => setFormData({...formData, estoque: e.target.value})}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fornecedor</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {selectedPeca ? 'Atualizar' : 'Salvar'}
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
          Tem certeza que deseja excluir a peça <strong>{selectedPeca?.nome}</strong> 
          (Código: {selectedPeca?.codigo})?
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

export default Pecas 