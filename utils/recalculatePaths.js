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

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in kilometers

  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateTotalDistance(points) {
  let totalDistance = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const point1 = points[i];
    const point2 = points[i + 1];

    const distance = haversine(
      point1.lat,
      point1.long,
      point2.lat,
      point2.long
    );

    totalDistance += distance;
  }

  return totalDistance;
}

async function processPoints(points, id) {
  let geo,
    dist = await processLoc(points);
  let punchObj = await Punch.findById(id);

  if (dist[1] != -1) {
    punchObj.distance = dist[1];
    punchObj.polyline = dist[0];
    punchObj.save();
  } else {
    punchObj.distance = calculateTotalDistance(punchObj.points)
  }
}

module.exports = {processPoints, calculateTotalDistance};
