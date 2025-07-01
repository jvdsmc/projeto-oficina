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

function FormasPagamento() {
  const [formasPagamento, setFormasPagamento] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFormaPagamento, setSelectedFormaPagamento] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    descricao: ''
  })

  // Buscar formas de pagamento
  const fetchFormasPagamento = async () => {
    try {
      setLoading(true)
      const response = await api.get('/formaPagamento')
      setFormasPagamento(response.data)
    } catch (err) {
      setError('Erro ao carregar formas de pagamento')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFormasPagamento()
  }, [])

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      descricao: ''
    })
    setSelectedFormaPagamento(null)
  }

  // Abrir modal para adicionar
  const handleAdd = () => {
    clearForm()
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (formaPagamento) => {
    setSelectedFormaPagamento(formaPagamento)
    setFormData({
      descricao: formaPagamento.descricao || ''
    })
    setShowModal(true)
  }

  // Abrir modal de confirmação para excluir
  const handleDelete = (formaPagamento) => {
    setSelectedFormaPagamento(formaPagamento)
    setShowDeleteModal(true)
  }

  // Submeter formulário (criar/editar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedFormaPagamento) {
        // Editar
        await api.put(`/formaPagamento/${selectedFormaPagamento.id}`, formData)
        setSuccess('Forma de pagamento atualizada com sucesso!')
      } else {
        // Criar
        await api.post('/formaPagamento', formData)
        setSuccess('Forma de pagamento criada com sucesso!')
      }
      
      setShowModal(false)
      clearForm()
      fetchFormasPagamento()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar forma de pagamento')
      console.error(err)
    }
  }

  // Confirmar exclusão
  const confirmDelete = async () => {
    try {
      await api.delete(`/formaPagamento/${selectedFormaPagamento.id}`)
      setSuccess('Forma de pagamento excluída com sucesso!')
      setShowDeleteModal(false)
      setSelectedFormaPagamento(null)
      fetchFormasPagamento()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir forma de pagamento')
      console.error(err)
    }
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
          <h2>Gerenciar Formas de Pagamento</h2>
        </Col>
        <Col xs="auto">
          <Button className="btn-action-primary" onClick={handleAdd}>
            Adicionar Forma de Pagamento
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
            <th>ID</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {formasPagamento.map((formaPagamento) => (
            <tr key={formaPagamento.id}>
              <td>{formaPagamento.id}</td>
              <td>{formaPagamento.descricao}</td>
              <td>
                <Button 
                  variant="info" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEdit(formaPagamento)}
                >
                  <PencilFill className="me-2" /> Editar
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(formaPagamento)}
                >
                  <TrashFill className="me-2" /> Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de Formulário */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedFormaPagamento ? 'Editar Forma de Pagamento' : 'Adicionar Forma de Pagamento'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Descrição *</Form.Label>
              <Form.Control
                type="text"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Ex: Dinheiro, Cartão de Crédito, PIX, etc."
                required
                maxLength={50}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {selectedFormaPagamento ? 'Atualizar' : 'Salvar'}
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
          Tem certeza que deseja excluir a forma de pagamento <strong>{selectedFormaPagamento?.descricao}</strong>?
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

export default FormasPagamento 