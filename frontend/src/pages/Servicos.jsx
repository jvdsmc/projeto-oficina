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

function Servicos() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedServico, setSelectedServico] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    descricao: '',
    maoObra: '',
    categoria: ''
  })

  // Buscar serviços
  const fetchServicos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/servicos')
      setServicos(response.data)
    } catch (err) {
      setError('Erro ao carregar serviços')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServicos()
  }, [])

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      descricao: '',
      maoObra: '',
      categoria: ''
    })
    setSelectedServico(null)
  }

  // Abrir modal para adicionar
  const handleAdd = () => {
    clearForm()
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (servico) => {
    setSelectedServico(servico)
    setFormData({
      descricao: servico.descricao || '',
      maoObra: servico.maoObra || '',
      categoria: servico.categoria || ''
    })
    setShowModal(true)
  }

  // Abrir modal de confirmação para excluir
  const handleDelete = (servico) => {
    setSelectedServico(servico)
    setShowDeleteModal(true)
  }

  // Submeter formulário (criar/editar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedServico) {
        // Editar
        await api.put(`/servicos/${selectedServico.id}`, formData)
        setSuccess('Serviço atualizado com sucesso!')
      } else {
        // Criar
        await api.post('/servicos', formData)
        setSuccess('Serviço criado com sucesso!')
      }
      
      setShowModal(false)
      clearForm()
      fetchServicos()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar serviço')
      console.error(err)
    }
  }

  // Confirmar exclusão
  const confirmDelete = async () => {
    try {
      await api.delete(`/servicos/${selectedServico.id}`)
      setSuccess('Serviço excluído com sucesso!')
      setShowDeleteModal(false)
      setSelectedServico(null)
      fetchServicos()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir serviço')
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
          <h2>Gerenciar Serviços</h2>
        </Col>
        <Col xs="auto">
          <Button className="btn-action-primary" onClick={handleAdd}>
            Adicionar Serviço
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
            <th>Descrição</th>
            <th>Mão de Obra (R$)</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {servicos.map((servico) => (
            <tr key={servico.id}>
              <td>{servico.descricao}</td>
              <td>{formatPrice(servico.maoObra)}</td>
              <td>{servico.categoria}</td>
              <td>
                <Button variant="info" size="sm" onClick={() => handleEdit(servico)}>
                  <PencilFill className="me-2" /> Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(servico)}>
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
            {selectedServico ? 'Editar Serviço' : 'Adicionar Serviço'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Descrição *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mão de Obra (R$) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.maoObra}
                    onChange={(e) => setFormData({...formData, maoObra: e.target.value})}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoria *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    required
                    maxLength={1}
                    placeholder="Ex: M (Manutenção), R (Revisão), etc."
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
              {selectedServico ? 'Atualizar' : 'Salvar'}
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
          Tem certeza que deseja excluir o serviço <strong>{selectedServico?.descricao}</strong>?
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

export default Servicos 