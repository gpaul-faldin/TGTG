import React, { useEffect, useState } from "react";
import Router from "next/router";

function index() {
  const router = Router;
  const [data, setData] = useState<string>("Loading...");

  useEffect(() => {
    router.push("/login");
  }, []);

  return <div>{data}</div>;
}

export default index;
