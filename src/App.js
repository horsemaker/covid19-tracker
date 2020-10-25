import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { prettyPrintStat, sortData, prettyPrintStatTotal } from './util';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

function App() {

  // STATE = hOw to write a varaiable in REACT <<<<<<
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  // USEEFFECT = Runs a piece of code based on a given condition

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      })
  }, []);

  useEffect(() => {
    // The code inside here once when the component loads and not again after
    // aync -> send a request, wait for it, do something with import

    const getCountriesData = async () => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country, // United Kingdom, United States of America
              value: country.countryInfo.iso2 // UK, USA, FR
            }
          ));

          let sortedData = sortData(data);

          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}` ;

    await fetch(url)
            .then(response => response.json())
            .then((data) => {
              setCountry(countryCode);

              // All of the data from the country response
              setCountryInfo(data);

              if (countryCode === "worldwide") {
                setMapCenter({ lat: 34.80746, lng: -40.4796 });
                setMapZoom(3);
              } else {
                setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
                setMapZoom(4);
              }
            });
  };

  console.log('COUNTRY INFO >>>', countryInfo);

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>
              COVID-19 TRACKER
          </h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              {/* Loop through all the countries and show a drop down list of the options */}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">

          <InfoBox 
            isRed
            active={casesType === "cases"}
            onClick={e => setCasesType('cases')}
            title="Coronavirus Cases:"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStatTotal(countryInfo.cases)}
          />

          <InfoBox 
            active={casesType === "recovered"}
            onClick={e => setCasesType('recovered')}
            title="Recovered:"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStatTotal(countryInfo.recovered)}
          />

          <InfoBox 
            isRed
            active={casesType === "deaths"}
            onClick={e => setCasesType('deaths')}
            title="Deaths:"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStatTotal(countryInfo.deaths)}
          />

        </div>

        <Map 
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <div>
        <Card className="app__right">
          <CardContent>
            <h3>
              Live Cases by Country:
            </h3>
            <Table
              countries={tableData} 
            />
            <h3 className="app__graphTitle">
              Worldwide new {casesType}:
            </h3>
            <LineGraph 
              className="app__graph"
              casesType={casesType}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
