import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Reusable Doughnut/Pie Chart Component
 * @param {Object} props
 * @param {Array} props.labels - Chart labels
 * @param {Array} props.data - Chart data values
 * @param {Array} props.backgroundColor - Background colors
 * @param {string} props.title - Chart title
 * @param {string} props.height - Chart height
 */
const DoughnutChart = ({
  labels = [],
  data = [],
  backgroundColor = [],
  title = '',
  height = '300px',
  cutout = '60%'
}) => {
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgb(200, 200, 200)',
          font: {
            size: 12
          },
          usePointStyle: true,
          padding: 15,
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
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
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${new Intl.NumberFormat('pt-BR').format(value)} (${percentage}%)`;
          }
        }
      }
    }
  }), [title]);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColor.length > 0 ? backgroundColor : [
          'rgba(99, 102, 241, 0.8)',   // Indigo
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(251, 146, 60, 0.8)',   // Orange
          'rgba(34, 197, 94, 0.8)',    // Green
          'rgba(14, 165, 233, 0.8)',   // Sky
          'rgba(245, 158, 11, 0.8)',   // Amber
          'rgba(239, 68, 68, 0.8)',    // Red
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  }), [labels, data, backgroundColor]);

  return (
    <div 
      className="w-full flex items-center justify-center"
      style={{ 
        height,
        contain: 'layout style paint',
        willChange: 'transform'
      }}
    >
      <Doughnut options={options} data={chartData} />
    </div>
  );
};

export default React.memo(DoughnutChart);
