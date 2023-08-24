import React, { useEffect, useState } from 'react';
import { RadialChart } from 'react-vis';

const PieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://countries.trevorblades.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetAllCountries {
            countries {
              continent {
                name
              }
            }
          }
        `,
      }),
    })
    .then(response => response.json())
    .then(result => {
      const countries = result.data.countries;
      const continentCount = {};
      countries.forEach(country => {
        const continentName = country.continent.name;
        continentCount[continentName] = (continentCount[continentName] || 0) + 1;
      });
      setData(Object.entries(continentCount).map(([continent, count]) => ({ angle: count, label: continent })));
    })
    .catch(error => console.error('Error fetching data:', error));
  }, []);

  const customLabels = data.map((d, index) => ({
    ...d,
    label: `${d.label} (${d.angle})`,
    color: index,
  }));

  return (
    <div>
      <RadialChart
        data={customLabels}
        width={400}
        height={400}
        showLabels
        labelsRadiusMultiplier={1.15}
        labelsStyle={{
          fontSize: 14,
          fontWeight: 'bold',
          fill: 'rgb(224 230 64)'
        }}
        animation
        colorType="category"
      />
    </div>
  );
};

export default PieChart;