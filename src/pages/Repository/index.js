import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import { Loading, Owner, IssueList, SelectFilter, Pagination } from './styles';

import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  // estado do component
  state = {
    repository: {},
    issues: [],
    loading: true,
    states: [
      { write: 'Abertas', value: 'open' },
      { write: 'Fechadas', value: 'closed' },
      { write: 'Todas', value: 'all' },
    ],
    filter: 'open',
    page: 1,
  };

  componentDidMount() {
    this.loadIssues();
  }

  // altera estado do state de acordo com filtro
  handleSelect = async e => {
    const stateValue = e.target.value;

    await this.setState({ filter: stateValue });

    this.loadIssues();
  };

  // carrega issues do repositorio
  async loadIssues() {
    const { match } = this.props;

    const { filter, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  // faz paginação das issues
  async handlePage(action) {
    const { page } = this.state;
    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });
    this.loadIssues();
  }

  render() {
    const { repository, issues, loading, states, page } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1> {repository.name} </h1>
          <p> {repository.description} </p>
        </Owner>

        <SelectFilter>
          <p>Estado da issue: </p>
          <select onChange={this.handleSelect}>
            {states.map(state => (
              <option key={state.value} value={state.value}>
                {state.write}
              </option>
            ))}
          </select>
        </SelectFilter>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />

              <div>
                <strong>
                  <a href={issue.html_url}> {issue.title} </a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}> {label.name} </span>
                  ))}
                </strong>
                <p> {issue.user.login} </p>
              </div>
            </li>
          ))}
        </IssueList>

        <Pagination>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePage('back')}
          >
            Anterior
          </button>

          <span>Página {page} </span>

          <button type="button" onClick={() => this.handlePage('next')}>
            Próximo
          </button>
        </Pagination>
      </Container>
    );
  }
}
