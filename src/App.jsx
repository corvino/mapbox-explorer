import React, { useRef, useEffect, useState } from "React";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import mapboxConfig from "../config/mapbox";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Tooltip from "./Tooltip";

mapboxgl.accessToken = mapboxConfig.accessToken;

export default () => {

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-121.3971);
  const [lat, setLat] = useState(47.3896);
  const [zoom, setZoom] = useState(15);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const tooltip = useRef(null);
  const tooltipContainer = useRef(null);

  function setTooltip(features) {
    if (features.length) {
      ReactDOM.render(
        React.createElement(
          Tooltip, {
            features
          }
        ),
        tooltipContainer.current
      );
    } else {
      ReactDOM.unmountComponentAtNode(tooltipContainer.current);
    }
  }

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on("load", () => {
      map.current.addSource("selectedFeatures", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });

      map.current.addLayer({
        id: "selectedFeatures",
        type: "line",
        source: "selectedFeatures"
      });
    });

    tooltipContainer.current = document.createElement("div");
    tooltip.current = new mapboxgl.Marker(tooltipContainer.current, {
      offset: [-120, 0]
    }).setLngLat([0, 0]).addTo(map.current);

    window.mapboxgl = mapboxgl;
    window.map = map;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxConfig.accessToken,
      mapboxgl: mapboxgl,
      types: "country,region,postcode,district,place,locality,neighborhood,address,poi"
    });

    map.current.addControl(geocoder);

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    map.current.on("mousemove", (e) => {
      const features = map.current.queryRenderedFeatures(e.point);
      tooltip.current.setLngLat(e.lngLat);
      map.current.getCanvas().stylecursor = features.length ? "pointer" : "";
      setTooltip(features);
    });

    map.current.on("mouseout", () => {
      setTooltip([]);
    });

    map.current.on("mousedown", (e) => {
      setSelectedFeatures(map.current.queryRenderedFeatures(e.point));
    });
  });

  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    const source = map.current.getSource("selectedFeatures");
    source.setData({
      type: "FeatureCollection",
      features: selectedFeatures
    });
  }, [selectedFeatures]);

  return (
    <div>
      <div className="absolute top-0 left-0 z-10">
        <div className="py-1 px-3 m-3 font-normal text-white bg-[#23374be5] rounded-md">
          longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>

        {0 < selectedFeatures.length &&
          <div className="py-1 px-3 m-3 font-normal text-white bg-[#23374be5] rounded-md">
            <p className="float-right text-lg" onClick={ () => setSelectedFeatures([]) }>x</p>
            <p className="text-lg font-bold">Features:</p>
            <ul className="ml-2">
              {selectedFeatures.map((feature, i) =>
                (<li key={i}>{feature.layer["source-layer"]}: {feature.layer.id}</li>)
              )}
            </ul>
          </div>
        }
      </div>

      <div ref={mapContainer} className="w-full h-screen" />
    </div>
  );
}
