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

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    nascimento: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: ''
  })

  // Buscar clientes
  const fetchClientes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cliente')
      setClientes(response.data)
    } catch (err) {
      setError('Erro ao carregar clientes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      nascimento: '',
      cidade: '',
      bairro: '',
      rua: '',
      numero: ''
    })
    setSelectedCliente(null)
  }

  // Abrir modal para adicionar
  const handleAdd = () => {
    clearForm()
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (cliente) => {
    setSelectedCliente(cliente)
    setFormData({
      nome: cliente.nome || '',
      cpf: cliente.cpf || '',
      nascimento: cliente.nascimento || '',
      cidade: cliente.cidade || '',
      bairro: cliente.bairro || '',
      rua: cliente.rua || '',
      numero: cliente.numero || ''
    })
    setShowModal(true)
  }

  // Abrir modal de confirmação para excluir
  const handleDelete = (cliente) => {
    setSelectedCliente(cliente)
    setShowDeleteModal(true)
  }

  // Submeter formulário (criar/editar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedCliente) {
        // Editar
        await api.put(`/cliente/${selectedCliente.id}`, formData)
        setSuccess('Cliente atualizado com sucesso!')
      } else {
        // Criar
        await api.post('/cliente', formData)
        setSuccess('Cliente criado com sucesso!')
      }
      
      setShowModal(false)
      clearForm()
      fetchClientes()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar cliente')
      console.error(err)
    }
  }

  // Confirmar exclusão
  const confirmDelete = async () => {
    try {
      await api.delete(`/cliente/${selectedCliente.id}`)
      setSuccess('Cliente excluído com sucesso!')
      setShowDeleteModal(false)
      setSelectedCliente(null)
      fetchClientes()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir cliente')
      console.error(err)
    }
  }

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Formatar CPF
  const formatCPF = (cpf) => {
    if (!cpf) return '-'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
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
          <h2>Gerenciar Clientes</h2>
        </Col>
        <Col xs="auto">
          <Button className="btn-action-primary" onClick={handleAdd}>
            Adicionar Cliente
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
            <th>CPF</th>
            <th>Nascimento</th>
            <th>Cidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{formatCPF(cliente.cpf)}</td>
              <td>{formatDate(cliente.nascimento)}</td>
              <td>{cliente.cidade}</td>
              <td>
                <Button variant="info" size="sm" onClick={() => handleEdit(cliente)}>
                  <PencilFill className="me-2" /> Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(cliente)}>
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
            {selectedCliente ? 'Editar Cliente' : 'Adicionar Cliente'}
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
                  <Form.Label>CPF *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Nascimento *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.nascimento}
                    onChange={(e) => setFormData({...formData, nascimento: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cidade *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                    required
                    maxLength={50}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Bairro</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                    maxLength={50}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rua</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.rua}
                    onChange={(e) => setFormData({...formData, rua: e.target.value})}
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Número</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({...formData, numero: e.target.value})}
                    maxLength={10}
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
              {selectedCliente ? 'Atualizar' : 'Salvar'}
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
          Tem certeza que deseja excluir o cliente <strong>{selectedCliente?.nome}</strong>?
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

export default Clientes 