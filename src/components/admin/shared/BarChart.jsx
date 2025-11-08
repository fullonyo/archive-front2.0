import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Reusable Bar Chart Component
 * @param {Object} props
 * @param {Array} props.labels - X-axis labels
 * @param {Array} props.datasets - Chart datasets
 * @param {string} props.title - Chart title
 * @param {string} props.height - Chart height
 * @param {boolean} props.horizontal - Horizontal orientation
 */
const BarChart = ({
  labels = [],
  datasets = [],
  title = '',
  height = '300px',
  horizontal = false,
  yAxisLabel = '',
  xAxisLabel = '',
  stacked = false
}) => {
  const options = useMemo(() => ({
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(200, 200, 200)',
          font: {
            size: 12
          },
          usePointStyle: true,
          padding: 15
        }
      },
      title: {
        display: !!title,
        text: title,
        color: 'rgb(255, 255, 255)',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(200, 200, 200)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null || context.parsed.x !== null) {
              const value = horizontal ? context.parsed.x : context.parsed.y;
              label += new Intl.NumberFormat('pt-BR').format(value);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        stacked,
        beginAtZero: true,
        ticks: {
          color: 'rgb(150, 150, 150)',
          font: {
            size: 11
          },
          callback: function(value) {
            if (horizontal) return value;
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: 'rgb(200, 200, 200)',
          font: {
            size: 12
          }
        }
      },
      x: {
        stacked,
        ticks: {
          color: 'rgb(150, 150, 150)',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0,
          callback: function(value) {
            if (!horizontal) return value;
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        },
        grid: {
          display: horizontal,
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel,
          color: 'rgb(200, 200, 200)',
          font: {
            size: 12
          }
        }
      }
    }
  }), [title, horizontal, yAxisLabel, xAxisLabel, stacked]);

  const data = useMemo(() => ({
    labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      borderWidth: 0,
      borderRadius: 4,
      maxBarThickness: 60
    }))
  }), [labels, datasets]);

  return (
    <div 
      className="w-full"
      style={{ 
        height,
        contain: 'layout style paint',
        willChange: 'transform'
      }}
    >
      <Bar options={options} data={data} />
    </div>
  );
};

export default React.memo(BarChart);
