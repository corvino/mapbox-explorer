import React from "React";

export default (props) => {
  const renderFeature = (feature, i) => {
    return(
      <div key={i}>
        <strong className="mr-3">{feature.layer["source-layer"]}:</strong>
        <span className="text-gray-300">{feature.layer.id}</span>
      </div>
    )
  }

  return (
    <div className="inline-flex absolute bottom-0 flex-col items-center">
      {/* Missing clip */}
      <div className="p-3 w-60 text-xs text-white truncate bg-gray-700 rounded shadow-lg">
        {props.features.map(renderFeature)}
      </div>
      <span className="block w-full text-gray-700"></span>
    </div>
  )
}
