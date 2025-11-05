import { PMProvider } from "../../../context/PMContext";
import React from "react";
import { PMAssignedtable } from "./PMAssignedtable";
 // Ensure correct path

export const PMassignedelement = () => {
  return (

    <PMProvider>
        <PMAssignedtable/>
    </PMProvider>
   
  );
};
