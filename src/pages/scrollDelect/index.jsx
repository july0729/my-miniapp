import {View, ScrollView} from '@tarojs/components'
import React, {useEffect, useState, useRef} from "react";
import styles from './index.module.scss'

definePageConfig({
  navigationBarTitleText: "左滑删除",
})

const arr = [
  {id: 1, num: 1},
  {id: 2, num: 11},
  {id: 3, num: 111},
  {id: 4, num: 1111},
  {id: 5, num: 11111},
  {id: 6, num: 13411},
  {id: 7, num: 11221},
  {id: 8, num: 111665},
  {id: 9, num: 348354},
  {id: 10, num: 431111},
  {id: 11, num: 123111},

]

// 美团miniapp好像没做这个功能

// 基本功能实现   微信√    支付宝√

// 功能拓展:
// 2 允许用户自定义 隐藏的部分 （删除 收藏 xxx）

export default function ScrollDelect() {

  const [clientInfo, setClientInfo] = useState({clientStartX: null, clientStartY: null, clientEndX: null, clientEndY: null})
  const [currentIndex, setCurrentIndex] = useState(null)
  const [dleVisible, setDleVisible] = useState(false)
  const [curPosition, setCurPosition] = useState('fixed')
  const curScrollDirection = useRef(null)


  useEffect(() => {
    if (!clientInfo.clientStartX || !clientInfo.clientEndX) return
    const distance = clientInfo.clientStartX - clientInfo.clientEndX
    if (distance < 0) setDleVisible(false)
    if (distance < 10) return
    if (distance > 10) setDleVisible(true)
  }, [clientInfo])


  const onDelClick = () => {
    console.log(111)
  }

  const onTouchStart = (e) => {
    e.stopPropagation()
    setCurPosition('fixed')
    setClientInfo({...clientInfo, clientStartX: e.touches[0].pageX, clientStartY: e.touches[0].pageY})
  }

  const onTouchMove = (e, id) => {
    e.stopPropagation()
    const deltaX = Math.abs(e.touches[0].pageX - clientInfo.clientStartX);
    const deltaY = Math.abs(e.touches[0].pageY - clientInfo.clientStartY);
    if (deltaX > deltaY) {   //now is scrollX
      if (curScrollDirection.current !== 'scrollX') curScrollDirection.current = 'scrollX'
      if (curPosition !== 'fixed') setCurPosition('fixed')
      setCurrentIndex(id)
      setClientInfo({...clientInfo, clientEndX: e.touches[0].pageX, clientEndY: e.touches[0].pageY})
    } else {  //now is scrollY
      if (curScrollDirection.current !== 'scrollY') curScrollDirection.current = 'scrollY'
      if (curPosition !== 'static') setCurPosition('static')
    }
  }

  const onscroll = (e) => {
    e.stopPropagation()
    if (curScrollDirection.current === 'scrollX') return
  }

  return (
    <ScrollView
      scrollY={curScrollDirection.current === 'scrollY'}
      className={styles.root}
      style={{position: curPosition, height: '500px'}}
      onScroll={(e) => onscroll(e)}
    >
      {arr.map(item => {
        return <View className={styles.content_box} id={item.id}
          style={currentIndex === item.id ? {
            transform: `translateX(${dleVisible ? '-90' : '0'}PX)`,
            webkitTransform: `translateX(${dleVisible ? '-90' : '0'}PX)`,
            transition: 'transform 0.3s ease',
          } : {
            transform: `translateX(0PX)`,
            webkitTransform: `translateX(0PX)`,
            transition: 'transform 0.3s ease',
          }}
        >
          <View className={styles.content}
            onTouchStart={(e) => onTouchStart(e)}
            onTouchMove={(e) => onTouchMove(e, item.id)}
          >{item.num}</View>
          <View className={styles.del} onClick={onDelClick}>删除</View>
        </View>
      })}
    </ScrollView >

  )
}
