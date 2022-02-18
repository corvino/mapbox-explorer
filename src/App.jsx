import React, { Fragment, useEffect, useRef, useState } from "React";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import mapboxConfig from "../config/mapbox";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Tooltip from "./Tooltip";
import { ChevronRightIcon } from "@heroicons/react/outline";
import {  SelectorIcon } from "@heroicons/react/solid";
import { Listbox, Transition } from "@headlessui/react";


mapboxgl.accessToken = mapboxConfig.accessToken;

export default () => {

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-121.3971);
  const [lat, setLat] = useState(47.3896);
  const [zoom, setZoom] = useState(15);

  const [showControls, setShowControls] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(false);

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

  function selectedFeaturesSource() {
    const source = map.current.getSource("selectedFeatures");
    if (source) { return source };

    map.current.addSource("selectedFeatures", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: selectedFeatures
      }
    });

    map.current.addLayer({
      id: "selectedFeatures",
      type: "line",
      source: "selectedFeatures"
    });

    return map.current.getSource("selectedFeatures");
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
      selectedFeaturesSource();
    });

    tooltipContainer.current = document.createElement("div");
    tooltip.current = new mapboxgl.Marker(tooltipContainer.current, {
      offset: [-120, 0]
    }).setLngLat([0, 0]).addTo(map.current);

    window.mapboxgl = mapboxgl;
    window.map = map.current;

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
    const source = selectedFeaturesSource();
    if (!source) {
      console.log("yo");
      addSelectedFeaturesSource();
    }
    source.setData({
      type: "FeatureCollection",
      features: selectedFeatures
    });
  }, [selectedFeatures]);

  function toggleBoundaries() {
    const toggle = !showBoundaries;
    map.current.showTileBoundaries = toggle;
    setShowBoundaries(toggle);
  }

  const [style, setStyle] = useState("mapbox://styles/mapbox/streets-v11");
  const styles = [
    "mapbox://styles/mapbox/streets-v11",
    "mapbox://styles/mapbox/outdoors-v11",
    "mapbox://styles/mapbox/light-v10",
    "mapbox://styles/mapbox/dark-v10",
    "mapbox://styles/mapbox/satellite-v9",
    "mapbox://styles/mapbox/satellite-streets-v11",
    "mapbox://styles/mapbox/navigation-day-v1",
    "mapbox://styles/mapbox/navigation-night-v1"
  ];

  function styleSelected(style) {
    setStyle(style);
    map.current.setStyle(style);
  };

  return (
    <div>
      <div className="absolute top-0 left-0 z-10">
        <div className="py-1 px-3 m-3 font-normal text-white bg-[#23374be5] rounded-md">
          longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>

        {showControls ?
          <div className="py-1 px-3 m-3 font-normal text-white bg-[#23374be5] rounded-md">
            <p className="float-right text-lg" onClick={() => setShowControls()}>x</p>
            <p className="text-lg font-bold">Options:</p>

            <Listbox value={style} onChange={styleSelected}>
              <Listbox.Button className="relative p-1 pl-3 w-full border-2 rounded-lg text-left">
                {style}
                <SelectorIcon className="w-5 h-5 float-right" />
              </Listbox.Button>
              <Transition as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute w-full mt-1 overflow-auto rounded-md shadow-lg ring-1 ring-white ring-opacity-5 bg-[#23374b]">
                  {styles.map((style, i) => (
                    <Listbox.Option
                      key={i}
                      value={style}
                      className="p-1 pl-2"
                    >
                      {style}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </Listbox>

            <ul>
              <li onClick={toggleBoundaries}>{showBoundaries ? "x" : "o"} Show Tile Boundaries</li>
            </ul>
          </div>
          :
          <div className="w-4 h-4 -mt-3 float-left" onClick={() => setShowControls(true)}><ChevronRightIcon /></div>
        }

        {0 < selectedFeatures.length &&
          <div className="py-1 px-3 m-3 font-normal text-white bg-[#23374be5] rounded-md">
            <p className="float-right text-lg" onClick={ () => setSelectedFeatures([]) }>x</p>
            <p className="text-lg font-bold">Features:</p>
            <ul className="ml-2">
              {selectedFeatures.map((feature, i) =>
                (<li key={i} onClick={() => console.log(feature)}>{feature.layer["source-layer"]}: {feature.layer.id}</li>)
              )}
            </ul>
          </div>
        }
      </div>

      <div ref={mapContainer} className="w-full h-screen" />
    </div>
  );
}
