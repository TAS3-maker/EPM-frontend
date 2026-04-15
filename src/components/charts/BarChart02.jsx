import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../pages/superadmin/Dashutils/ThemeContext';

import { chartColors } from './ChartjsConfig';
import {
  Chart, BarController, BarElement, LinearScale, TimeScale, Tooltip, Legend,
} from 'chart.js';
import 'chartjs-adapter-moment';

Chart.register(BarController, BarElement, LinearScale, TimeScale, Tooltip, Legend);

function BarChart02({
  data,
  width,
  height
}) {

  const chartRef = useRef(null);
  const canvas = useRef(null);

  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {

    const canvasEl = canvas.current;

    // ✅ HARD SAFETY: prevent unmounted canvas access
    if (!canvasEl || !canvasEl.isConnected) return;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    // ✅ destroy previous instance if exists
    if (chartRef.current) {
      chartRef.current.stop();
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const newChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        // 🔥 CRITICAL FIX: stop ResizeObserver crashes
        responsive: true,
        resize: false,
        resizeDelay: 0,

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
            border: { display: false },
            beginAtZero: true,
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
            border: { display: false },
            grid: { display: false },
            ticks: {
              autoSkipPadding: 48,
              maxRotation: 0,
              color: darkMode ? textColor.dark : textColor.light,
            },
          },
        },

        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: () => false,
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
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

    // ✅ extra safety cleanup (StrictMode proof)
    return () => {
      if (chartRef.current) {
        chartRef.current.stop();
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };

  }, [data]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;

    chart.options.scales.x.ticks.color = darkMode ? textColor.dark : textColor.light;
    chart.options.scales.y.ticks.color = darkMode ? textColor.dark : textColor.light;
    chart.options.scales.y.grid.color = darkMode ? gridColor.dark : gridColor.light;

    chart.options.plugins.tooltip.bodyColor = darkMode
      ? tooltipBodyColor.dark
      : tooltipBodyColor.light;

    chart.options.plugins.tooltip.backgroundColor = darkMode
      ? tooltipBgColor.dark
      : tooltipBgColor.light;

    chart.options.plugins.tooltip.borderColor = darkMode
      ? tooltipBorderColor.dark
      : tooltipBorderColor.light;

    chart.update('none');
  }, [currentTheme]);

  return (
    <canvas ref={canvas} width={width} height={height} />
  );
}

export default BarChart02;