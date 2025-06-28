"use client";

import React, { useEffect, useState } from "react";
import BarChart from "./BarChart";

const Revenue = ({ year }) => {
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setRevenueData(year);
      console.log(year);
    };

    if (year) {
      fetchRevenueData();
    }
  }, [year]);

  return (
    <div className="">
      {revenueData ? <BarChart revenueData={revenueData} /> : "Loading..."}
    </div>
  );
};

export default Revenue;
