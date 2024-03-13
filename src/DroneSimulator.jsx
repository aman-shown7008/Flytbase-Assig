import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DroneImg from "./img/drone.png";
import "./DroneSimulator.css";
//import LocationImg from "./img/location.jpeg";

const DroneSimulator = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [mapCenter, setMapCenter] = useState([0, 0]); // Initial map center
  const [zoom, setZoom] = useState(2); // Initial zoom level
  const [dronePosition, setDronePosition] = useState([0, 0]);
  const [dronePath, setDronePath] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [locationIconVisible, setLocationIconVisible] = useState(false);

  // Define custom icon for the marker
  const locationIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1828/1828636.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  // Define custom icon for the drone marker
  const droneIcon = L.icon({
    iconUrl: DroneImg,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  useEffect(() => {
    if (isSimulating && !isPaused) {
      const interval = setInterval(() => {
        moveDrone();
        setCurrentTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isSimulating, isPaused, currentTime]);

  const handleLatitudeChange = (event) => {
    setLatitude(event.target.value);
  };

  const handleLongitudeChange = (event) => {
    setLongitude(event.target.value);
  };

  const handleAddDataPoint = () => {
    if (latitude && longitude) {
      const newPoint = [parseFloat(latitude), parseFloat(longitude)];
      setTimeSeriesData([...timeSeriesData, newPoint]);
      setMapCenter(newPoint); // Update map center to new data point
      setZoom(13); // Zoom in a little bit when adding a data point
      setLatitude("");
      setLongitude("");
      setLocationIconVisible(true); // Show location icon
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      // Assuming the file contains latitude and longitude data in CSV format
      const parsedData = content.split("\n").map((line) => {
        const [lat, lng] = line.split(",");
        return [parseFloat(lat), parseFloat(lng)];
      });
      setTimeSeriesData(parsedData);
      if (parsedData.length > 0) {
        setMapCenter(parsedData[parsedData.length - 1]); // Update map center to last data point
        setZoom(13); // Zoom in a little bit when adding a data point
      }
    };

    reader.readAsText(file);
  };

  const simulateDrone = () => {
    // Reset drone position and path
    setDronePosition([0, 0]);
    setDronePath([]);
    setIsSimulating(true);
  };

  const moveDrone = () => {
    // Generate a new random position for the drone
    const newLat = dronePosition[0] + (Math.random() - 0.5) * 5;
    const newLng = dronePosition[1] + (Math.random() - 0.5) * 5;

    // Update drone position and path
    setDronePosition([newLat, newLng]);
    setDronePath([...dronePath, [newLat, newLng]]);
  };

  const handlePauseResume = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <MapContainer
        center={mapCenter} // Center of the map
        zoom={zoom} // Zoom level
        style={{ flex: 1 }} // Set map height and width
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // OpenStreetMap tile provider URL
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // Attribution
        />
        {/* Render markers for each data point */}
        {timeSeriesData.map((point, index) => (
          <Marker key={index} position={point}>
            <Popup>{`Latitude: ${point[0]}, Longitude: ${point[1]}`}</Popup>
          </Marker>
        ))}
        {/* Render a map marker icon for the current data point */}
        {latitude && longitude && locationIconVisible && (
          <Marker
            position={[parseFloat(latitude), parseFloat(longitude)]}
            icon={locationIcon}
          />
        )}
        {/* Render drone marker and path */}
        {isSimulating && (
          <>
            <Marker position={dronePosition} icon={droneIcon}>
              <Popup>Drone</Popup>
            </Marker>
            <Polyline positions={dronePath} color="red" />
          </>
        )}
      </MapContainer>
      <div className="cate-info">
        <div>
          <label>Latitude:</label>
          <input
            className="first"
            type="number"
            value={latitude}
            onChange={handleLatitudeChange}
            placeholder="Add a data"
          />
        </div>
        <div>
          <label>Longitude:</label>
          <input
            type="number"
            value={longitude}
            onChange={handleLongitudeChange}
            placeholder="Add a data"
          />
        </div>
        <button onClick={handleAddDataPoint}>Add Data Point</button>
        <input type="file" onChange={handleFileUpload} />
        <button onClick={simulateDrone} className="butt-d">Simulate</button>
        <button onClick={handlePauseResume} className="butt-d">
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>
    </div>
  );
};

export default DroneSimulator;
