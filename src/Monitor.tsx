import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import MonitorData from "./monitor/MonitorData";
import "./Monitor.scss";
import { Badge, Progress } from "antd";

const subDataStyle: any = {
  display: "inline-flex",
  flexDirection: "column",
  paddingLeft: "1.1em",
  paddingRight: "0.6em",
};

function Monitor(props: any) {
  const propColor = props.color ?? "deepskyblue";
  const propIconColor = props.iconColor ?? propColor;
  const propBadgeColor = props.badgeColor ?? "#ff4d4f";
  const propProgressColor: string = props.progressColor ?? "#07d028,red";
  const [iconColor, setIconColor] = useState(propIconColor);
  const [progressColor, setProgressColor] = useState(propProgressColor);
  const [color, setColor] = useState(propColor);
  const total = props.total < 0 ? 0 : props.total;
  const stays = props.stays > total ? total : props.stays;
  const available = total - stays;
  const utilizes = total ? (stays / total) * 100 : 0;
  const propStaysChanged = props.staysChanged ?? 0;
  const [staysChanged, setStaysChanged] = useState(propStaysChanged);
  const timerRef: any = useRef();

  // Update progress info text color
  useEffect(() => {
    setColor(propColor);
    const el: any = document.querySelector(".ant-progress-text");
    if (el) {
      el.style.color = propColor;
    }
  }, [propColor]);

  // Update progress stroke color
  useEffect(() => {
    setProgressColor(propProgressColor);
  }, [propProgressColor]);

  // Update icon color
  useEffect(() => {
    setIconColor(propIconColor);
  }, [propIconColor]);

  // Update badge color
  useEffect(() => {
    const el: any = document.querySelector(".ant-badge-count");
    if (el) {
      el.style.backgroundColor = propBadgeColor;
    }
  }, [propBadgeColor]);

  // Update number of stays difference badge
  useEffect(() => {
    if (propStaysChanged === 0) {
      return;
    }

    setStaysChanged(propStaysChanged);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setStaysChanged(0);
      timerRef.current = undefined;
    }, 3000);
  }, [propStaysChanged]);

  const parseStrokeColor = (value: string) => {
    const colors = value.split(",").map((c) => c.trim());
    return {
      from: colors[0],
      to: colors[colors.length - 1],
    };
  };

  return (
    <section style={{ fontFamily: "sans-serif" }}>
      <MonitorData
        title="Available"
        data={available}
        size={3}
        color={color}
        primary
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <FontAwesomeIcon icon={faUsers} color={iconColor} size="9x" />
        <section style={subDataStyle}>
          <Badge count={staysChanged > 0 ? "+" + staysChanged : staysChanged} >
            <MonitorData title="Stays" data={stays} size={1.7} color={color} />
          </Badge>
          <span style={{ height: "1.1em" }} />
          <MonitorData
            title="Utilizes"
            data={utilizes.toFixed(1) + "%"}
            size={0.9}
            color={color}
          />
        </section>
      </div>
      <Progress
        strokeColor={parseStrokeColor(progressColor)}
        status="active"
        percent={utilizes}
        format={(percent) => `${percent?.toFixed(1)}%`}
      />
    </section>
  );
}

export default Monitor;
