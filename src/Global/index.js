import './dayjsPlugins';
import './common.scss';
import style from './style.module.scss';
import React, {useState, useEffect, useRef} from 'react';
import {useLaunch, eventCenter} from '@tarojs/taro';
import {View} from '@tarojs/components';
import get from 'lodash/get';
import {Provider, useGlobalContext as useContext} from "@kne/global-context";
import classnames from 'classnames';
import isEqual from 'lodash/isEqual';
import {PAGE_NO_SCROLL_CHANGE} from '@kne/antd-taro';
import useRefCallback from "@kne/use-ref-callback";

export const useGlobalContext = (globalKey) => {
  const contextValue = useContext();

  const setGlobal = useRefCallback((value) => {
    contextValue.setGlobal(typeof value === "function" ? (global) => {
      return Object.assign({}, global, {
        [globalKey]: value(get(global, globalKey)),
      });
    } : Object.assign({}, contextValue.global, {
      [globalKey]: value,
    }));
  });

  return Object.assign({
    global: {}, setGlobal: () => {
      console.warn("调用setGlobal的组件应该被放置在Global上下文中");
    },
  }, contextValue, globalKey ? {
    global: get(contextValue.global, globalKey), setGlobal
  } : {});
};

export const SetGlobal = ({globalKey, value, children}) => {
  const {setGlobal} = useGlobalContext(globalKey);
  const valueRef = useRef(null);
  useEffect(() => {
    if (value && !isEqual(valueRef.current, value)) {
      setGlobal?.(value);
      valueRef.current = value;
    }
  }, [value]);
  return children;
};

export const GetGlobal = ({globalKey, children}) => {
  const {global} = useGlobalContext(globalKey);
  return children({value: global});
};

export const usePreset = () => {
  const contextValue = useContext();
  return get(contextValue, "preset", {});
};

const Global = ({preset, children, ...props}) => {
  const [global, setGlobal] = useState(Object.assign({}, get(preset, "global")));
  useLaunch(() => {
    console.log('App launched.')
  }, []);
  return <Provider value={{
    ...props, preset, global, setGlobal,
  }}>
    {children}
  </Provider>;
};

export const GlobalStyle = (props) => {
  const {setGlobal} = useGlobalContext(PAGE_NO_SCROLL_CHANGE);
  useEffect(() => {
    eventCenter.on(PAGE_NO_SCROLL_CHANGE, (open) => {
      setGlobal(open);
    });
  }, [setGlobal]);
  return <View className={classnames(style["container"], props.className)}>{props.children}</View>;
};

export default Global;
