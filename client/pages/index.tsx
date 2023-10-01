import React, { useEffect, useState } from "react";

function index() {

  const [data, setData] = useState<string>("Loading...");

  useEffect(() => {
    fetch("http://localhost:8080/")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setData(data.message);
      });
  }, []);

  return <div>{data}</div>;
}

export default index;
