import React , {useEffect} from "react";
import {logout} from "../components/utils/token";
import  Router  from "next/router";

function Logout() {

    useEffect(() => {
        logout();
        Router.push("/login");
    }
    , []);
  return (
    null
  );
}

export default Logout;