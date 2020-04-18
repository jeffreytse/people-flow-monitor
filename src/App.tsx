import React, { useState, useEffect, useRef } from "react";
import "./App.scss";
import Monitor from "./Monitor";
import Websocket from "react-websocket";
import { useLocation } from "react-router-dom";
import { message, notification } from "antd";
import "antd/dist/antd.css";
import pkg from "../package.json";

/* const sleep = (delay) => new Promise(r => setTimeout(r, delay)); */

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Timeout = setTimeout(function () {}, 0).constructor;

function isTimer(t: any) {
  return t instanceof Timeout;
}

function clearTimer(t: any) {
  isTimer(t) ? clearTimeout(t) : clearInterval(t);
}

function showVersion() {
  message.success(`People Flow Monitor ${pkg.version}`);
}

function test(handler: any) {
  handler({
    command: "message",
    type: "success",
    content: "My first message...",
  });
  handler({
    command: "notification",
    type: "success",
    message: "Important",
    description: "My first notification...",
  });
  handler({
    command: "total",
    value: 250,
  });
  handler({
    command: "color",
    value: "green",
  });
  const testFlow = async () => {
    handler({
      command: Math.ceil(Math.random() * 20) % 2 ? "exit" : "enter",
      value: Math.ceil(Math.random() * 20),
    });
  };
  const testColor = async () => {
    handler({
      command: "color",
      value: `#${Math.ceil(Math.random() * 1000000)}`,
    });
  };
  const testIconColor = async () => {
    handler({
      command: "iconColor",
      value: `#${Math.ceil(Math.random() * 1000000)}`,
    });
  };
  const testBadgeColor = async () => {
    handler({
      command: "badgeColor",
      value: `#${Math.ceil(Math.random() * 1000000)}`,
    });
  };
  const testBgColor = async () => {
    handler({
      command: "bgColor",
      value: `#${Math.ceil(Math.random() * 1000000)}`,
    });
  };
  const testProgressColor = async () => {
    handler({
      command: "progressColor",
      value: `#${Math.ceil(Math.random() * 1000000)}`,
    });
  };

  return [
    setInterval(testFlow, 2000),
    setInterval(testColor, 2000),
    setInterval(testIconColor, 1000),
    setInterval(testBadgeColor, 1000),
    setInterval(testBgColor, 3000),
    setInterval(testProgressColor, 1000),
  ];
}

function App() {
  const [total, setTotal] = useState(0);
  const [stays, setStays] = useState(0);
  const [staysChanged, setStaysChanged] = useState(0);
  const [color, setColor] = useState("deepskyblue");
  const [iconColor, setIconColor] = useState(color);
  const [badgeColor, setBadgeColor] = useState("#ff4d4f");
  const [bgColor, setBgColor] = useState("#282c34");
  const [progressColor, setProgressColor] = useState(undefined);
  const [refWebsocket, setRefWebsocket]: Websocket = useState(null);
  const query = useQuery();
  const id = query.get("id");
  const wsUrl = query.get("wsUrl");
  const testRef: any = useRef([]);

  useEffect(() => {
    showVersion();
  }, []);

  // Update background color
  useEffect(() => {
    setBgColor(bgColor);
    const el: any = document.querySelector(".App-header");
    if (el) {
      el.style.backgroundColor = bgColor;
    }
  }, [bgColor]);

  const setStaysHook = (value: any) => {
    setStaysChanged(value - stays);
    setStays(value);
  };

  const sendMessage = (data: any) => {
    refWebsocket?.sendMessage(JSON.stringify(data));
  };

  const handleCommand = (data: any) => {
    if (data.command === "total") {
      if (data.value === undefined) {
        sendMessage({
          command: data.command,
          value: total,
        });
      } else {
        setTotal(data.value);
      }
    } else if (data.command === "stays") {
      if (data.value === undefined) {
        sendMessage({
          command: data.command,
          value: stays,
        });
      } else {
        setStaysHook(data.value);
      }
    } else if (data.command === "color") {
      if (data.value === undefined) {
        sendMessage({
          command: data.command,
          value: color,
        });
      } else {
        setColor(data.value);
      }
    } else if (data.command === "iconColor") {
      if (data.value === undefined) {
        sendMessage({
          command: data.command,
          value: iconColor,
        });
      } else {
        setIconColor(data.value);
      }
    } else if (data.command === "badgeColor") {
      if (data.value === undefined) {
        sendMessage({
          command: data.command,
          value: badgeColor,
        });
      } else {
        setBadgeColor(data.value);
      }
    } else if (data.command === "bgColor") {
      if (data.value === undefined) {
        sendMessage({
          command: data.command,
          value: bgColor,
        });
      } else {
        setBgColor(data.value);
      }
    } else if (data.command === "progressColor") {
      if (data.value === undefined) {
        sendMessage({
          command: data.command,
          value: progressColor,
        });
      } else {
        setProgressColor(data.value);
      }
    } else if (data.command === "enter") {
      const nowStays = stays + (data.value ?? 1);
      setStaysHook(nowStays);
    } else if (data.command === "exit") {
      let nowStays = stays - (data.value ?? 1);
      if (nowStays < 0) {
        nowStays = 0;
      }
      setStaysHook(nowStays);
    } else if (data.command === "id") {
      sendMessage({
        command: data.command,
        value: id,
      });
    } else if (data.command === "test") {
      if (data.action === "stop") {
        testRef.current.forEach((t: any) => clearTimer(t));
        testRef.current = [];
        message.success("Test stopped!");
      } else {
        if (testRef.current.length > 0) {
          testRef.current.forEach((t: any) => clearTimer(t));
          testRef.current = [];
        }
        testRef.current = test(handleCommand);
        message.success("Test starting!");
      }
    } else if (data.command === "message") {
      const type = data.type ?? "success";
      message[type](data);
    } else if (data.command === "notification") {
      const type = data.type ?? "success";
      notification[type](data);
    } else if (data.command === "version") {
      if (data.show) {
        showVersion();
      }
      sendMessage({
        command: data.command,
        value: pkg.version,
      });
    }
  };

  const onMessage = (msg: string) => {
    console.log("[websocket] received msg: " + msg);
    try {
      const data = JSON.parse(msg);
      handleCommand(data);
    } catch (e) {
      console.error(e);
    }
  };

  const onOpen = () => {
    console.log("[websocket] connected to: " + wsUrl);
    message.success(`Connect to ${wsUrl} successfully!`);
  };

  const onClose = () => {
    console.log("[websocket] connection closedi.");
    message.warning("Connection is closed!");
  };

  return (
    <div className="App">
      <header className="App-header">
        <Monitor
          total={total}
          stays={stays}
          staysChanged={staysChanged}
          color={color}
          iconColor={iconColor}
          badgeColor={badgeColor}
          progressColor={progressColor}
        />
        <Websocket
          ref={(ws) => setRefWebsocket(ws)}
          url={wsUrl}
          onMessage={onMessage}
          onOpen={onOpen}
          onClose={onClose}
        />
      </header>
    </div>
  );
}

export default App;
