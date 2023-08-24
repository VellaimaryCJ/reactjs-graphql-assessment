import React, { useState } from 'react';
import './App.css';
import './styles/Table.css';
import './styles/App.css';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import Modal from 'react-bootstrap/Modal'; 
import PieChart from './components/PieChart';

const COUNTRIES_GRAPHQL_ENDPOINT = 'https://countries.trevorblades.com/';

const client = new ApolloClient({
  uri: COUNTRIES_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
});

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
      awsRegion
      currency
    }
  }
`;

function Table({ data }) {
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterName, setFilterName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedCountry, setSelectedCountry] = useState(null);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const sortedData = data.slice().sort((a, b) => {
    if (sortDirection === 'asc' && a[sortColumn] !== undefined) {
      return a[sortColumn].localeCompare(b[sortColumn]);
    } else if (sortDirection === 'desc' && b[sortColumn] !== undefined) {
      return b[sortColumn].localeCompare(a[sortColumn]);
    }
  });
  const openSummaryModal = country => {
    setSelectedCountry(country);
  };

  const closeSummaryModal = () => {
    setSelectedCountry(null);
  };
  const filteredData = sortedData.filter(country =>
    country.name.toLowerCase().includes(filterName.toLowerCase())
  );
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  const currentData = filteredData.slice(startIndex, endIndex);
  return (
    <div>
      <div className='header-section'>
       
        <div className="chart">
        <h2 style={{ textAlign: 'center', "color": "#90bde1" }}>Distribution of Countries Across Continents</h2>
          <PieChart />
        </div>
        <div className="filters">
          <label>Filter by Name:</label>
          <input
            type="text"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
          />
        </div>
      </div>
      <table className="table-container">
        <thead>
          <tr>
          <th
              onClick={() => handleSort('name')}
              className={`sortable ${sortColumn === 'name' ? 'sorted-' + sortDirection : ''}`}
            >
              Name
            </th>
            <th>Code</th>
            <th>AWS Region</th>
            <th>currency</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((country, index) => (
            <tr key={index} onClick={() => openSummaryModal(country)} className="row-clickable">
             <td>{country.name}</td>
             <td>{country.code}</td>
             <td>{country.awsRegion}</td>
             <td>{country.currency}</td>                    
            </tr>
         
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {pageCount}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          Next
        </button>
      </div>
    <Modal
        show={selectedCountry !== null}
        onHide={closeSummaryModal}
        className="modal"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Country Summary</h5>
            <button type="button" className="close" onClick={closeSummaryModal}>
              <span>&times;</span>
            </button>
          </div>
          {selectedCountry && (
            <div className="modal-body">
              <p><strong>Name:</strong> {selectedCountry.name}</p>
              <p><strong>Code:</strong> {selectedCountry.code}</p>
              <p><strong>AWS Region:</strong> {selectedCountry.awsRegion}</p>
              <p><strong>Currency:</strong> {selectedCountry.currency}</p>
              
           
            </div>
          )}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={closeSummaryModal}>Close</button>
          </div>
        </div> 
      </Modal>
      
    </div>
  );

  function handleSort(column) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }
}

function App() {
  const { loading, error, data } = useQuery(GET_COUNTRIES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>World Countries</h1>        
        <Table data={data.countries} />
      </header>
    </div>
  );
}

function MyApp() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

export default MyApp;
