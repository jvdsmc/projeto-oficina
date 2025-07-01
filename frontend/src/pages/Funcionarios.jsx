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

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFuncionario, setSelectedFuncionario] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    cpf: '',
    telefone: '',
    especialidade: '',
    dataDeAdmissao: '',
    salario: ''
  })

  // Buscar funcionários
  const fetchFuncionarios = async () => {
    try {
      setLoading(true)
      const response = await api.get('/funcionarios')
      setFuncionarios(response.data)
    } catch (err) {
      setError('Erro ao carregar funcionários')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      nome: '',
      cargo: '',
      cpf: '',
      telefone: '',
      especialidade: '',
      dataDeAdmissao: '',
      salario: ''
    })
    setSelectedFuncionario(null)
  }

  // Abrir modal para adicionar
  const handleAdd = () => {
    clearForm()
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (funcionario) => {
    setSelectedFuncionario(funcionario)
    setFormData({
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      cpf: funcionario.cpf,
      telefone: funcionario.telefone,
      especialidade: funcionario.especialidade,
      dataDeAdmissao: funcionario.dataDeAdmissao,
      salario: funcionario.salario
    })
    setShowModal(true)
  }

  // Abrir modal de confirmação para excluir
  const handleDelete = (funcionario) => {
    setSelectedFuncionario(funcionario)
    setShowDeleteModal(true)
  }

  // Submeter formulário (criar/editar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedFuncionario) {
        // Editar
        await api.put(`/funcionarios/${selectedFuncionario.id}`, formData)
        setSuccess('Funcionário atualizado com sucesso!')
      } else {
        // Criar
        await api.post('/funcionarios', formData)
        setSuccess('Funcionário criado com sucesso!')
      }
      
      setShowModal(false)
      clearForm()
      fetchFuncionarios()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar funcionário')
      console.error(err)
    }
  }

  // Confirmar exclusão
  const confirmDelete = async () => {
    try {
      await api.delete(`/funcionarios/${selectedFuncionario.id}`)
      setSuccess('Funcionário excluído com sucesso!')
      setShowDeleteModal(false)
      setSelectedFuncionario(null)
      fetchFuncionarios()
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir funcionário')
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
          <h2>Gerenciar Funcionários</h2>
        </Col>
        <Col xs="auto">
          <Button className="btn-action-primary" onClick={handleAdd}>
            Adicionar Funcionário
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
            <th>Cargo</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Especialidade</th>
            <th>Data Contratação</th>
            <th>Salário</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map((funcionario) => (
            <tr key={funcionario.id}>
              <td>{funcionario.nome}</td>
              <td>{funcionario.cargo}</td>
              <td>{formatCPF(funcionario.cpf)}</td>
              <td>{funcionario.telefone}</td>
              <td>{funcionario.especialidade}</td>
              <td>{formatDate(funcionario.dataDeAdmissao)}</td>
              <td>R$ {funcionario.salario?.toFixed(2) || '-'}</td>
              <td>
                <Button variant="info" size="sm" onClick={() => handleEdit(funcionario)}>
                  <PencilFill className="me-2" /> Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(funcionario)}>
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
            {selectedFuncionario ? 'Editar Funcionário' : 'Adicionar Funcionário'}
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
                  <Form.Label>Cargo *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    required
                    maxLength={35}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Telefone *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Especialidade *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({...formData, especialidade: e.target.value})}
                    required
                    maxLength={30}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Admissão *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dataDeAdmissao}
                    onChange={(e) => setFormData({...formData, dataDeAdmissao: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Salário *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.salario}
                    onChange={(e) => setFormData({...formData, salario: e.target.value})}
                    required
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
              {selectedFuncionario ? 'Atualizar' : 'Salvar'}
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
          Tem certeza que deseja excluir o funcionário <strong>{selectedFuncionario?.nome}</strong>?
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

export default Funcionarios 