import { TLProvider } from "../../../context/TLContext";
import React from "react";
import { TLAssignedtable } from "./TLAssignedtable";
 // Ensure correct path

export const TLassignedelement = () => {
  return (

    <TLProvider>
        <TLAssignedtable/>
    </TLProvider>
   
  );
};
