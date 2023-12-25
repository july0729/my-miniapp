import {View} from '@tarojs/components'
import React, {useEffect, useState, useRef} from "react";
import Taro from '@tarojs/taro'


export default function index() {
  const [state, setState] = useState(0)
  useEffect(() => {
    setState(2)
  }, [])

  useEffect(() => {
    if (!state) return
    switchUrl(state)
  }, [state])


  const switchUrl = (num) => {
    switch (num) {
      case 1:
        Taro.navigateTo({url: '/pages/scrollList/index'})
        return
      case 2:
        Taro.navigateTo({url: '/pages/scrollDelect/index'})
        return
    }
  }

  return <View>
    <View onClick={() => setState(1)}> to scrollView</View>
    <View onClick={() => setState(2)}>scrollDelect</View>
  </View>

}
