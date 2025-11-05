
import { Chart, Tooltip } from "chart.js";

import { adjustColorOpacity } from "../pages/superadmin/Dashutils/Utils";

Chart.register(Tooltip);

Chart.defaults.font.family = '"Inter", sans-serif';
Chart.defaults.font.weight = 500;
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.displayColors = false;
Chart.defaults.plugins.tooltip.mode = "nearest";
Chart.defaults.plugins.tooltip.intersect = false;
Chart.defaults.plugins.tooltip.position = "nearest";
Chart.defaults.plugins.tooltip.caretSize = 0;
Chart.defaults.plugins.tooltip.caretPadding = 20;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 8;

export const chartAreaGradient = (ctx, chartArea, colorStops) => {
  if (!ctx || !chartArea || !colorStops || colorStops.length === 0) {
    return "#ffffff"; 
  }
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  colorStops.forEach(({ stop, color }) => {
    gradient.addColorStop(stop, color);
  });
  return gradient;
};

export const chartColors = {
  textColor: "#6b7280",
  gridColor: adjustColorOpacity("#f3f4f6", 0.6), 
  backdropColor: "#ffffff",
  tooltipTitleColor: "#1f2937", 
  tooltipBodyColor: "#6b7280", 
  tooltipBgColor: "#ffffff", 
  tooltipBorderColor: "#e5e7eb", 
};

// console.log("Final Chart Colors (Light Theme Only):", chartColors);
