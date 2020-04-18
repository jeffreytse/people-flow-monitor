import React from "react";
import "./MonitorData.scss";

function MonitorData(props: any) {
  const dataSize = props.dataSize ?? props.size * 1.3;
  const sizeUnit = props.sizeUnit ?? "em";
  const fontSize = props.size + sizeUnit;
  const dataFontSize = props.primary ? undefined : dataSize + sizeUnit;
  const color = props.color ?? "deepskyblue";
  const marginLeft = props.primary ? props.size * 0.15 + sizeUnit : undefined;
  const display = "inline-flex";
  const flexDirection = props.primary ? undefined : "column-reverse";
  const fontWeight = props.primary ? undefined : 600;
  const data = `${props.data}`;

  return (
    <section style={{ fontSize, display, flexDirection }}>
      <span>{props.title}</span>
      <span style={{ fontSize: dataFontSize, color, marginLeft, fontWeight }}>
        {data}
      </span>
    </section>
  );
}

export default MonitorData;
