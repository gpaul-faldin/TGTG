import React, { useEffect, useState } from "react";
import NavBar from "../components/navbar";
import Router from "next/router";

function index() {
  const router = Router;
  const [data, setData] = useState<string>("Loading...");

  useEffect(() => {
    router.push("/login");
  }, []);

  return <div></div>;
}

export default index;
