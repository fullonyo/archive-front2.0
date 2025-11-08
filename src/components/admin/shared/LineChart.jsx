import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Reusable Line Chart Component
 * @param {Object} props
 * @param {Array} props.labels - X-axis labels
 * @param {Array} props.datasets - Chart datasets
 * @param {string} props.title - Chart title
 * @param {boolean} props.fill - Fill area under line
 * @param {boolean} props.tension - Line tension (curved)
 * @param {string} props.height - Chart height
 */
const LineChart = ({
  labels = [],
  datasets = [],
  title = '',
  fill = true,
  tension = 0.4,
  height = '300px',
  yAxisLabel = '',
  xAxisLabel = ''
}) => {
  const options = useMemo(() => ({
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
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR').format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(150, 150, 150)',
          font: {
            size: 11
          },
          callback: function(value) {
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
        ticks: {
          color: 'rgb(150, 150, 150)',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          display: false,
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
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  }), [title, yAxisLabel, xAxisLabel]);

  const data = useMemo(() => ({
    labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      fill: dataset.fill !== undefined ? dataset.fill : fill,
      tension: dataset.tension !== undefined ? dataset.tension : tension,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: dataset.borderColor,
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }))
  }), [labels, datasets, fill, tension]);

  return (
    <div 
      className="w-full"
      style={{ 
        height,
        contain: 'layout style paint',
        willChange: 'transform'
      }}
    >
      <Line options={options} data={data} />
    </div>
  );
};

export default React.memo(LineChart);
