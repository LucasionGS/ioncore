import React from "react";
import logo from "../../assets/logo.svg";
import "./IoncoreLoader.scss";

export default function IoncoreLoader({
  centered = false,
  size,
}: {
  centered?: boolean;
  size?: number;
}) {
  return (
    <div className={"ioncore-loader" + (centered ? " ioncore-loader--centered" : "")} style={{
      width: size,
      height: size,
      borderWidth: size ? size / 25 : undefined,
    }}>
      <img src={logo} alt="Ioncore" />
    </div>
  );
}
