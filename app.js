const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;
app.use(express.json());

const initializeTheDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at localhost://3000");
    });
  } catch (e) {
    console.log(e.message);
  }
};
initializeTheDbAndServer();
// API 1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
     SELECT state_id AS stateId, state_name AS stateName, population
     FROM state
     `;
  const stateArray = await db.all(getStatesQuery);
  await response.send(stateArray);
});
// API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
     SELECT state_id AS stateId, state_name AS stateName, population
     FROM state
     WHERE state_id = ${stateId};
     `;
  const stateDetails = await db.get(getStateQuery);
  await response.send(stateDetails);
});
// API 3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistQuery = `
     INSERT INTO district (district_name, state_id, cases, cured, active,deaths)
     VALUES ("${districtName}", ${stateId}, ${cases}, ${cured}, ${active}, ${deaths}) 
     ;
     `;
  await db.run(addDistQuery);
  await response.send("District Successfully Added");
});
// API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
     SELECT district_id AS districtId, district_name AS districtName, 
     state_id AS stateId, cases, cured, active,deaths
     FROM district
     WHERE district_id = ${districtId};
     `;
  const districtDetails = await db.get(getDistrictQuery);
  await response.send(districtDetails);
});
// API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const removeDistQuery = `
     DELETE FROM district
     WHERE district_id = ${districtId};
     `;
  await db.run(removeDistQuery);
  await response.send("District Removed");
});
// API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistQuery = `
     UPDATE district 
     SET district_name = "${districtName}",
     state_id = ${stateId},
     cases = ${cases},
     cured = ${cured},
     active = ${active},
     deaths = ${deaths}
     WHERE district_id = ${districtId};
     `;
  await db.run(updateDistQuery);
  await response.send("District Details Updated");
});
// API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `
     SELECT SUM(cases) AS totalCases, SUM(cured) AS totalCured, SUM(active) AS totalActive, SUM(deaths) AS totalDeaths
     FROM district
     WHERE state_id = ${stateId};
     `;
  const stateStats = await db.get(getStatsQuery);
  await response.send(stateStats);
});
// API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `
     SELECT state_name AS stateName
     FROM state INNER JOIN district ON state.state_id = district.state_id
     WHERE district.district_id = ${districtId};
     `;
  const stateName = await db.get(getStateNameQuery);
  await response.send(stateName);
});

module.exports = app;

// APIs
