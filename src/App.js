// import React, { useState } from 'react';
// import { Chart, registerables } from 'chart.js'
// Chart.register(...registerables);
// import Chart from 'chart.js/auto';

import VerticalBarChart from './components/BarChart/VerticalBarChart';
import HorizontalBarChart from './components/BarChart/HorizontalBarChart';
import StackdBarChartwithGroups from './components/BarChart/StackdBarChartWithGroups';
import StackdBarChart from './components/BarChart/StackedBarChart';
import FloatingBarChart from './components/BarChart/FloatingBarChart';
import BarChartBoarderRadius from './components/BarChart/BarChartBoarderRadius';

import LineChart from './components/LineChart/LineChart';
import Layout from './components/Layout';
import MultiAxisLineChart from './components/LineChart/MultiAxisLineChart';
import SteppedLineChart from './components/LineChart/SteppedLineChart';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ScatterChart from './components/OtherChart/ScatterChart';

function App() {
  const data = [50, 40, 30, 35, 40];
  const labels = [2017, 2018, 2019, 2020, 2021];
  const [csv, setCsv] = useState([])
  const [monthBasePassenger, setMonthBasePassenger] = useState([])

  const [busBasePassenger, setBusBasePassenger] = useState([])

  const getCsvWithCallback = useCallback(async () => {
    try {
      const url = 'http://localhost:3001/csv'
      const axiosObj = await axios.get(url)
      const res = await axiosObj.data
      setCsv(res)
    } catch (e) {
      console.log(e);
    }
  }, [])
  //fetch data useEffect
  useEffect(() => {
    getCsvWithCallback()
  }, [getCsvWithCallback])

  //data 처리 useEffect
  useEffect(() => {
    if (Array.isArray(csv) && csv.length !== 0) {
      // console.log('this. is array!')
      const monthBase = csv.reduce((acc, cur) => {
        const month = cur['년월']
        const sum = Number(cur['합계'])
        const type = cur['구분']

        console.log(type);
        if (!acc.has(month)) {
          acc.set(month, {
            sum: 0,
            getIn: 0,
            getOff: 0,
          })
        }
        const thisMonth = acc.get(month);
        const getIn = thisMonth['getIn'];
        const getOff = thisMonth['getOff'];
        acc.set(month, {
          sum: thisMonth['sum'] + sum,
          getIn: type === '승차' ? getIn + sum : getIn,
          getOff: type === '하차' ? getOff + sum : getOff,
        })

        return acc
      }, new Map())
      console.log(monthBase);
      const monthData = Array.from(monthBase, ([key, value]) => ({
        month: key,
        data: value
      }))
      setMonthBasePassenger(monthData)
      // console.log(monthData);
    }
  }, [csv])

  // bp 데이터 처리
  useEffect(() => {
    if (Array.isArray(csv) && csv.length) {
      const busBase = csv.reduce((acc, cur) => {
        const busNo = cur['노선']
        const month = cur['년월']
        const sum = Number(cur['합계'])
        const type = cur['구분']

        if (!acc.has(busNo)) {
          const monthMap = new Map()
          acc.set(
            busNo,
            monthMap.set(month, {
              getIn: 0,
              getOff: 0,
            })
          )
        }
        const thisBus = acc.get(busNo)
        const data = thisBus.get(month)
        const getIn = data ? Number(data['getIn']) : 0
        const getOff = data ? Number(data['getOff']) : 0
        thisBus.set(month, {
          getIn: type === '승차' ? getIn + sum : getIn,
          getOff: type === '하차' ? getOff + sum : getOff
        })

        return acc
      }, new Map())
      const bp = Array.from(busBase, ([key, value]) => {
        return {
          busNo: key,
          data: Array.from(value, ([month, data]) => {
            console.log(data);

            return {
              month: month,
              ...data
              // getIn: data.getIn
              // getOff: data.getOff
            }
          })
        }
      })
      setBusBasePassenger(bp)
      // console.log(bp);
    }
  }, [csv])

  console.log(csv);
  return (
    <Layout>
      <VerticalBarChart monthBasePassenger={monthBasePassenger} />
      <HorizontalBarChart monthBasePassenger={monthBasePassenger} />

      <LineChart data={data} labels={labels} />
      <StackdBarChart data={data} labels={labels} />
      <StackdBarChartwithGroups data={data} labels={labels} />
      <FloatingBarChart data={data} labels={labels} />
      <BarChartBoarderRadius data={data} labels={labels} />
      <MultiAxisLineChart data={data} labels={labels} />
      <SteppedLineChart data={data} labels={labels} />

      <ScatterChart busBasePassenger={busBasePassenger} />
    </Layout>
  );
}

export default App;
