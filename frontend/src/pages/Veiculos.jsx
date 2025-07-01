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

function Veiculos() {
  const [veiculos, setVeiculos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedVeiculo, setSelectedVeiculo] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    tipoCombustivel: '',
    numeroChassi: '',
    cliente_id: ''
  })

  // Buscar veículos
  const fetchVeiculos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/veiculos')
      setVeiculos(response.data)
    } catch (err) {
      setError('Erro ao carregar veículos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Buscar clientes para o seletor
  const fetchClientes = async () => {
    try {
      const response = await api.get('/cliente')
      setClientes(response.data)
    } catch (err) {
      setError('Erro ao carregar clientes')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchVeiculos()
    fetchClientes()
  }, [])

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      marca: '',
      modelo: '',
      ano: '',
      placa: '',
      tipoCombustivel: '',
      numeroChassi: '',
      cliente_id: ''
    })
    setSelectedVeiculo(null)
  }

  // Abrir modal para adicionar
  const handleAdd = () => {
    clearForm()
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (veiculo) => {
    setSelectedVeiculo(veiculo)
    setFormData({
      marca: veiculo.marca || '',
      modelo: veiculo.modelo || '',
      ano: veiculo.ano || '',
      placa: veiculo.placa || '',
      tipoCombustivel: veiculo.tipoCombustivel || '',
      numeroChassi: veiculo.numeroChassi || '',
      cliente_id: veiculo.cliente_id || veiculo.clienteId || ''
    })
    setShowModal(true)
  }

  // Abrir modal de confirmação para excluir
  const handleDelete = (veiculo) => {
    setSelectedVeiculo(veiculo)
    setShowDeleteModal(true)
  }

  // Submeter formulário (criar/editar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedVeiculo) {
        // Editar
        await api.put(`/veiculos/${selectedVeiculo.id}`, formData)
        setSuccess('Veículo atualizado com sucesso!')
      } else {
        // Criar
        await api.post('/veiculos', formData)
        setSuccess('Veículo criado com sucesso!')
      }
      
      setShowModal(false)
      clearForm()
      fetchVeiculos()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar veículo')
      console.error(err)
    }
  }

  // Confirmar exclusão
  const confirmDelete = async () => {
    try {
      await api.delete(`/veiculos/${selectedVeiculo.id}`)
      setSuccess('Veículo excluído com sucesso!')
      setShowDeleteModal(false)
      setSelectedVeiculo(null)
      fetchVeiculos()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir veículo')
      console.error(err)
    }
  }

  // Obter nome do cliente
  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente ? cliente.nome : 'Cliente não encontrado'
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
          <h2>Gerenciar Veículos</h2>
        </Col>
        <Col xs="auto">
          <Button className="btn-action-primary" onClick={handleAdd}>
            Adicionar Veículo
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
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ano</th>
            <th>Placa</th>
            <th>Cliente Associado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((veiculo) => (
            <tr key={veiculo.id}>
              <td>{veiculo.marca}</td>
              <td>{veiculo.modelo}</td>
              <td>{veiculo.ano}</td>
              <td>{veiculo.placa}</td>
              <td>{getClienteNome(veiculo.cliente_id || veiculo.clienteId)}</td>
              <td>
                <Button variant="info" size="sm" onClick={() => handleEdit(veiculo)}>
                  <PencilFill className="me-2" /> Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(veiculo)}>
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
            {selectedVeiculo ? 'Editar Veículo' : 'Adicionar Veículo'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Marca *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    required
                    maxLength={30}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Modelo *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    required
                    maxLength={50}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Ano *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({...formData, ano: e.target.value})}
                    min="1886"
                    max={new Date().getFullYear()}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Placa *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.placa}
                    onChange={(e) => setFormData({...formData, placa: e.target.value.toUpperCase()})}
                    placeholder="ABC1234"
                    required
                    maxLength={8}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Combustível *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tipoCombustivel}
                    onChange={(e) => setFormData({...formData, tipoCombustivel: e.target.value})}
                    required
                    maxLength={20}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número do Chassi *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.numeroChassi}
                    onChange={(e) => setFormData({...formData, numeroChassi: e.target.value.toUpperCase()})}
                    placeholder="17 caracteres alfanuméricos"
                    required
                    maxLength={17}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Select
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.cpf}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {selectedVeiculo ? 'Atualizar' : 'Salvar'}
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
          Tem certeza que deseja excluir o veículo <strong>{selectedVeiculo?.marca} {selectedVeiculo?.modelo}</strong> 
          (Placa: {selectedVeiculo?.placa})?
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

export default Veiculos 