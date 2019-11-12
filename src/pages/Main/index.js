import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';

import { Form, SubmitButton, List, RepositoryInput } from './styles';

export default class Main extends Component {
  // estado do component
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
  };

  // carrega repositorios do localstorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // adiciona repositorio ao localstorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  // adiciona novo repositorio ao state
  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  // faz busca do repositorio na api
  handleSubmit = async e => {
    e.preventDefault();

    try {
      this.setState({ loading: true });

      const { newRepo, repositories } = this.state;

      // checka se repositorio já foia adicionado
      const checkRepo = repositories.find(repo => {
        return repo.name === newRepo ? repo : null;
      });

      if (checkRepo) {
        throw new Error('Repósitorio duplicado');
      }

      // busca repositorio na api
      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      // adiciona repositorio ao state
      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        error: false,
      });
    } catch (error) {
      this.setState({ loading: false, error: true });
    }
  };

  render() {
    const { newRepo, loading, repositories, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <RepositoryInput
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
            error={error}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span> {repository.name} </span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
