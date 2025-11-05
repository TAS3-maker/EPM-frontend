import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../pages/superadmin/Dashutils/ThemeContext';

// Ensure chartColors is properly imported
import { chartColors as defaultChartColors } from './ChartjsConfig';

import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip,
} from 'chart.js';
import 'chartjs-adapter-moment';

import { formatValue } from '../pages/superadmin/Dashutils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip);

function LineChart01({ data, width, height }) {
  const [chart, setChart] = useState(null);
  const [chartColors, setChartColors] = useState(defaultChartColors);
  
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';

  // Update colors when the theme changes
  useEffect(() => {
    setChartColors(defaultChartColors);
  }, [currentTheme]);

  useEffect(() => {
    const ctx = canvas.current;
    const newChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        layout: { padding: 20 },
        scales: {
          y: { display: false, beginAtZero: true },
          x: {
            type: 'time',
            time: { parser: 'MM-DD-YYYY', unit: 'month' },
            display: false,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => false,
              label: (context) => formatValue(context.parsed.y),
            },
            bodyColor: darkMode ? chartColors.tooltipBodyColor.dark : chartColors.tooltipBodyColor.light,
            backgroundColor: darkMode ? chartColors.tooltipBgColor.dark : chartColors.tooltipBgColor.light,
            borderColor: darkMode ? chartColors.tooltipBorderColor.dark : chartColors.tooltipBorderColor.light,
          },
          legend: { display: false },
        },
        interaction: { intersect: false, mode: 'nearest' },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });

    setChart(newChart);
    return () => newChart.destroy();
  }, [chartColors]);

  return <canvas ref={canvas} width={width} height={height}></canvas>;
}

export default LineChart01;
