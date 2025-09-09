import React, { useEffect, useState } from "react";
import axios from "axios";

const TowerMaintenanceTables = () => {
  const [platformData, setPlatformData] = useState([]);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/data-fetch2/data"); // Replace with your backend URL
        const data = response.data;

        // Parse and clean the data
        const parsedData = data.map((item) => {
          const { platform, response: soapResponse } = item;

          // Extract JSON from SOAP response
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(soapResponse, "text/xml");
          const jsonText =
            xmlDoc.querySelector("TowerMaintenanceOthersResult")?.textContent || "[]";

          // Fix malformed JSON (adjust based on issues in the file)
          const fixedJson = jsonText.replace(/,}/g, "}").replace(/":(\d+)"/g, '":"$1"');

          // Parse the JSON
          const records = JSON.parse(fixedJson);

          return { platform, records };
        });

        setPlatformData(parsedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Tower Maintenance Data</h1>
      {platformData.map((platformEntry, idx) => (
        <div key={idx}>
          <h2>Platform: {platformEntry.platform}</h2>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Column1</th>
                <th>Column2</th>
                <th>Column3</th>
                <th>Column4</th>
              </tr>
            </thead>
            <tbody>
              {platformEntry.records.map((record, index) => (
                <tr key={index}>
                  <td>{record.Column1}</td>
                  <td>{record.Column2}</td>
                  <td>{record.Column3}</td>
                  <td>{record.Column4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default TowerMaintenanceTables;