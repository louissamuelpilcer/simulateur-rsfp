"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import {
  interpolateBlues,
  interpolateGreens,
  interpolateOranges,
  interpolatePurples,
  interpolateReds,
} from "d3-scale-chromatic";
import type { Department, IndicatorKey, Indicator } from "@/types";
import { getIndicatorValue } from "@/lib/indicators";

const GEO_URL =
  "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson";

const INTERPOLATORS = {
  blues: interpolateBlues,
  greens: interpolateGreens,
  oranges: interpolateOranges,
  purples: interpolatePurples,
  reds: interpolateReds,
};

interface Props {
  departments: Department[];
  selectedIndicator: Indicator;
  onDepartmentClick?: (dept: Department) => void;
}

export default function FranceMap({ departments, selectedIndicator, onDepartmentClick }: Props) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    dept: Department;
    value: number;
  } | null>(null);

  const values = useMemo(
    () => departments.map((d) => getIndicatorValue(d, selectedIndicator.key as IndicatorKey)),
    [departments, selectedIndicator.key]
  );

  const colorScale = useMemo(() => {
    const interpolate = INTERPOLATORS[selectedIndicator.colorScheme];
    return scaleQuantile<string>()
      .domain(values)
      .range(Array.from({ length: 8 }, (_, i) => interpolate(0.2 + (i / 7) * 0.75)));
  }, [values, selectedIndicator.colorScheme]);

  const deptMap = useMemo(
    () => new Map(departments.map((d) => [d.code, d])),
    [departments]
  );

  const quantiles = colorScale.quantiles();

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2700, center: [2.3, 46.5] }}
        className="w-full h-full"
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={8}>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const code = geo.properties.code as string;
                const dept = deptMap.get(code);
                const value = dept ? getIndicatorValue(dept, selectedIndicator.key as IndicatorKey) : null;
                const fill = value !== null ? colorScale(value) : "#D1D5DB";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    className="map-geography outline-none"
                    style={{
                      hover: { fill: "#001F5E", stroke: "#fff", strokeWidth: 1 },
                      pressed: { fill: "#001F5E" },
                    }}
                    onMouseEnter={(e: any) => {
                      if (dept && value !== null) {
                        const rect = (e.target as SVGElement)
                          .closest("svg")!
                          .getBoundingClientRect();
                        setTooltip({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                          dept,
                          value,
                        });
                      }
                    }}
                    onMouseMove={(e: any) => {
                      if (dept && value !== null) {
                        const rect = (e.target as SVGElement)
                          .closest("svg")!
                          .getBoundingClientRect();
                        setTooltip((t) =>
                          t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null
                        );
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => dept && onDepartmentClick?.(dept)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm z-50"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-semibold text-gray-900">
            {tooltip.dept.code} – {tooltip.dept.name}
          </p>
          <p className="text-gray-500 text-xs">{tooltip.dept.region}</p>
          <p className="text-[#003189] font-bold mt-1">
            {selectedIndicator.format(tooltip.value)} {selectedIndicator.unit}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700 mb-1.5">{selectedIndicator.label}</p>
        <div className="flex items-center gap-1">
          {colorScale.range().map((color, i) => {
            const from = i === 0 ? values.reduce((a, b) => Math.min(a, b), Infinity) : quantiles[i - 1];
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-6 h-3 rounded-sm" style={{ background: color }} />
                {i % 2 === 0 && (
                  <span className="text-gray-500" style={{ fontSize: "9px" }}>
                    {selectedIndicator.format(from)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
