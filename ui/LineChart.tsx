import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LineChartProps {
  data: number[];
  width: number;
  height: number;
  color: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, width, height, color }) => {
  if (!data || data.length === 0) {
    return <View style={{ width, height }} />;
  }

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data);
  const valueRange = maxValue - minValue || 1;

  // Generate path points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
    return { x, y };
  });

  // Create SVG path string
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  // Create gradient area path
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        
        {/* Gradient area under the line */}
        <Path
          d={areaPath}
          fill="url(#gradient)"
        />
        
        {/* Main line */}
        <Path
          d={pathData}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </Svg>
    </View>
  );
};
