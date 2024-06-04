import Chart from 'react-apexcharts';
import React from 'react';

const regularDate = (t, mode) => {
  let date = new Date(t);
  let year = date.getFullYear();
  let month = (date.getMonth() + 1);
  let day = date.getDate();

  month = month >= 10 ? month : '0' + month;
  day = day >= 10 ? day : '0' + day;
  if (mode === 0)
      return year + '-' + month + '-' + day;
  else if (mode === 1)
      return year + "년 " + month + "월 " + day + "일";
};

const MyBarChart = (e) => {
  let result = [];
  let wearData = [];
  let noWearData = [];
  let curDate = new Date(e.start);
  let endDate = new Date(e.end);
  let cnt = 0;
  while(curDate <= endDate){
    result.push(regularDate(curDate,0));
    wearData.push(e.report[cnt].actualWearTime);
    noWearData.push(e.report[cnt].actualNonWearTime);
    curDate.setDate(curDate.getDate() + 1);
    cnt+=1;
  }
  return (
    <Chart
    
      width={340}
      height={300}
      type="bar"
      series={[{
        name: '착용시간',
        data: wearData,
      }, {
        name: '미착용시간',
        data: noWearData,
      },
      ]}
      options={{
        states: {
          normal: {
              filter: {
                  type: 'none',
              }
          },
          hover: {
              filter: {
                  type: 'none',
              }
          },
          active: {
              allowMultipleDataPointsSelection: false,
              filter: {
                  type: 'none',
              }
          },
      },
        events:{
          dataPointSelection:null
        },
        animations: { enabled: false,
                    dynamicAnimation:{enabled:false} },
        xaxis:{
          tickAmount:7,
          labels:{
            rotateAlways: true,
            rotate:-60,
          },
          tickPlacement: 'on',
        },
        yaxis: {
          min: 0,
          max: 100,
          decimalsInFloat:0,
        },
        labels: result,
        dataLabels:{
          enabled:false
        },
        colors: ['#99CCFF', '#FFCCCC'],
        tooltip: { enabled: false},
        chart: {
          selection:{
            enabled:false,
          },

          offsetY: 10,
          zoom:{
            enabled:false
          },
          type: 'bar',
          stacked: true,
          stackType: '100%',
          toolbar: { show: false },
          background: "transparent",
          animations: { enabled: false,dynamicAnimation:{enabled:false} },
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }],

        fill: {
          opacity: 1
        },
        legend: {
          show: true,
          position: 'top',
          offsetX: 0,
          offsetY: 20,
          onItemClick: {
            toggleDataSeries: false
          },
          onItemHover: {
            highlightDataSeries: false
          },
        },
      }}
    />
  )
}

const MyLineChart = (e) => {
  let result = [];
  let vasData = [];
  let curDate = new Date(e.start);
  let endDate = new Date(e.end);
  let cnt = 0
  while(curDate <= endDate){
    result.push(regularDate(curDate,0));
    vasData.push(e.report[cnt].vas);
    curDate.setDate(curDate.getDate() + 1);
    cnt+=1;
  }
  return (
    <Chart
      width={340}
      height={300}
      series={[{
        name: 'VAS',
        data: vasData,
      }]}
      options={{
        tooltip: { enabled: false },
        chart: {
          offsetY: 10,
          type: 'line',
          zoom: {
            enabled: false
          },
          animations: {
            enabled: false
          },
          toolbar: { show: false },
          background: "transparent",
        },
        stroke: {
          width: 2,
          curve: 'straight'
        },
        labels: result,
        xaxis: {
          offsetY:5,
          tickAmount:7,
          labels:{
            rotate:-60,
            rotateAlways: true,
          },
          tickPlacement: 'on',
        },
        yaxis: {
          min: 0,
          max: 10,
          decimalsInFloat:0,
        },
        markers: {
          size: 4,
        },
        title: {
          text: "VAS",
          align: 'center',
          offsetY: 20,
        }
      }
      }
    />
  )
}

export default MyBarChart;
export { MyLineChart };