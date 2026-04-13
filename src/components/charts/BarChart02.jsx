import React, { useRef, useEffect } from 'react';
import { useThemeProvider } from '../pages/superadmin/Dashutils/ThemeContext';

import { chartColors } from './ChartjsConfig';
import {
  Chart,
  BarController,
  BarElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';

import 'chartjs-adapter-moment';

// register once
Chart.register(BarController, BarElement, LinearScale, TimeScale, Tooltip, Legend);

function BarChart02({ data, width, height }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';

  const {
    textColor,
    gridColor,
    tooltipBodyColor,
    tooltipBgColor,
    tooltipBorderColor,
  } = chartColors;

  useEffect(() => {
    if (!canvasRef.current) return;

    // ✅ destroy previous chart if exists
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current;

    const newChart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        layout: {
          padding: {
            top: 12,
            bottom: 16,
            left: 20,
            right: 20,
          },
        },
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            border: {
              display: false,
            },
            ticks: {
              maxTicksLimit: 5,
              color: darkMode ? textColor.dark : textColor.light,
            },
            grid: {
              color: darkMode ? gridColor.dark : gridColor.light,
            },
          },
          x: {
            stacked: true,
            type: 'time',
            time: {
              parser: 'MM-DD-YYYY',
              unit: 'month',
              displayFormats: {
                month: 'MMM YY',
              },
            },
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
              autoSkipPadding: 48,
              maxRotation: 0,
              color: darkMode ? textColor.dark : textColor.light,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: () => false,
            },
            bodyColor: darkMode
              ? tooltipBodyColor.dark
              : tooltipBodyColor.light,
            backgroundColor: darkMode
              ? tooltipBgColor.dark
              : tooltipBgColor.light,
            borderColor: darkMode
              ? tooltipBorderColor.dark
              : tooltipBorderColor.light,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        animation: {
          duration: 200,
        },
        maintainAspectRatio: false,
      },
    });

    chartRef.current = newChart;

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, currentTheme]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}

export default BarChart02;
