const axios = require("axios");
const { Punch } = require("../models/punch");
const RADIUS = 50;

async function processLoc(points) {
  try {
    let urlsnap = "https://router.project-osrm.org/match/v1/driving";

    let reqdata1 = "";
    let reqdata2 = "";

    points.forEach((i) => {
      if (reqdata1) {
        reqdata1 = `${reqdata1};${i.long},${i.lat}`;
        reqdata2 += `;${RADIUS}`;
      } else {
        reqdata1 = `${i.long},${i.lat}`;
        reqdata2 = `${RADIUS}`;
      }
    });

    const request = `${urlsnap}/${reqdata1}?radiuses=${reqdata2}`;

    let out = await axios.get(request);

    if (out.status != 200) {
      throw 100;
    }

    return [out.data.matchings[0].geometry, out.data.matchings[0].distance];
  } catch (e) {
    console.log(e);
    return "", -1;
  }
}

async function processPoints(points, id) {
    let geo, dist  = await processLoc(points)
    let punchObj = await Punch.findById(id)

    if (dist[1] != -1) {
        punchObj.distance = dist[1]
        punchObj.polyline = dist[0]
        punchObj.save()
    }
}

module.exports = processPoints