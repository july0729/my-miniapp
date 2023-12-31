import {View, Text, ScrollView, Image} from '@tarojs/components'
import React, {useEffect, useState, useRef} from "react";
import styles from './index.module.scss'
import VirtualList from '@tarojs/components/virtual-list'

const generateList = (length) => {
  const list = [];
  for (let i = 0; i < length; i++) {
    const productListLength = Math.floor(Math.random() * 10 + 1);
    const productList = Array.from({length: productListLength}, (_, j) => ({
      groupId: i + 1,
      groupName: `分组${i + 1}-${productListLength}`,
      id: `${i + 1}-${j + 1}`,
      imgUrl: '',
      name: `猪猪${j + 1}`,
      mainMaterials: `猪肉${j + 1}`,
      salePrice: '12.00',
    }));
    list.push({
      groupId: 'A' + (i + 1),
      groupName: `分组${i + 1}-${productListLength}`,
      productList,
    });
  }
  return list;
};

export default function Index() {

  const [productMenuList, setProductMenuList] = useState(generateList(10))
  const [curGroupId, setcurGroupId] = useState({id: '', groupName: ''})
  const [scrollTop, setScrollTop] = useState(0)
  const virtualRef = useRef(null)
  const curScrollRef = useRef({
    prodlistlengList: []   //分组的商品数量和高度
  })

  useEffect(() => {
    setcurGroupId({id: productMenuList[0].groupId, groupName: productMenuList[0].groupName})
    getProduceMenulist()
  }, [])

  const getProduceMenulist = () => {
    const list = []
    productMenuList.map(item => {
      list.push({leng: item.productList.length, size: 100 * item.productList.length + 20})
    })
    curScrollRef.current = {
      ...curScrollRef.current,
      prodlistlengList: list
    }
  }

  const onProductViewScroll = ({scrollOffset, scrollUpdateWasRequested, scrollDirection}) => {
    let sum = 0
    // 找出当前滚动的位置在哪个分组
    let index = curScrollRef.current.prodlistlengList.findIndex(item => {
      sum += item.size;
      return sum > scrollOffset;
    });

    if (index !== -1 && productMenuList[index].groupId !== curGroupId.id) {
      setcurGroupId({id: productMenuList[index].groupId, groupName: productMenuList[index].groupName})
    }

    //  超过5个时才滚动 小于5时滚到顶部
    setScrollTop((index - 5) * 100)
  }

  const onLeftGroupNameClick = (id) => {
    // 找出id 在数组中的位置
    const index = productMenuList.findIndex(item => item.groupId === id)
    let sum = 0
    curScrollRef.current.prodlistlengList.map((item, idx) => {
      if (idx < index) {
        sum += item.leng * 100 + 20
      }
    })
    // 目前确认点击时会触发onscorll事件  其中scrollOffset的值有小数点有时候不能直接命中对应id的值
    // 例如 分组3 的sum是2980  但是scrollOffset只滚动到 了2879.78979482.. 此时就无法命中对应di 需要加多一个偏移量
    // 支付宝 scrollTo的第二个参数一定要写为false
    virtualRef.current.scrollTo(sum + 5, process.env.TARO_ENV === 'alipay' ? false : true)

  }

  const Row = ({id, index, data}) => {
    return <View className={styles.menu_right_list_item} key={data[index].id} id={id}>
      {data[index].id.split('-')[1] === "1" && <Text className="product-right-item-title" style={{fontWeight: 'bold', lineHeight: '20px'}}>{data[index].groupName}</Text>}
      <View className={styles.menu_right_item} >
        <Image mode='aspectFill' src={data[index].imgUrl} style={{width: '150rpx', height: '150rpx', borderRadius: '5rpx'}}></Image>
        <View className={styles.dish_content} style={{flex: '1'}}>
          <Text>{data[index].status === 0 ? '(停售)' + data[index].name : data[index].name}</Text>
          <Text className={styles.dish_main_materials}>{data[index].mainMaterials}</Text>
          <View className={styles.price_and_more}>
            <View className={styles.sale_price}>¥ {data[index].salePrice}</View>
            {data[index].status !== 0 && <View className={styles.dish_copies}>
              <View style={{opacity: (data[index].dishNum && data[index].dishNum !== 0) ? '1' : '0', display: 'flex', justifyContent: 'space-between', width: '84rpx'}}>
                <View className={styles.reduce_btn}
                // onClick={() => reduceDish(it)}
                >
                  -</View>
                <Text>{data[index].dishNum}</Text>
              </View>
              <View className={styles.add_btn}
              // onClick={() => addDish(it, 1)}
              >+</View>
            </View>}
          </View>
        </View>
      </View>
    </View>
  }


  return (
    <View className={styles.take_out_menu_list}>
      {productMenuList.length !== 0 ?
        <View style={{display: 'flex', height: '40vh', width: '100vw'}}>
          {/* 左列菜单栏 */}
          <ScrollView
            className={styles.menu_column}
            scrollY={true}
            scrollWithAnimation={true}
            showScrollbar={false}   //隐藏滚动条
            scrollTop={scrollTop}   //Y轴滚动的距离
          >
            {productMenuList.map((item) => {
              return <View className={styles.menu_bar_item} key={item.groupId} style={{backgroundColor: curGroupId.id === item.groupId ? '#fff' : ''}} onClick={() => onLeftGroupNameClick(item.groupId)}>
                {curGroupId.id === item.groupId && <Text className={styles.circle} />}
                <Text className={styles.group_name} > {item.groupName} </Text>
              </View>
            })}
          </ScrollView>
          {/* 右列菜品 */}
          <VirtualList
            ref={virtualRef}
            className={styles.menu_content}
            scrollY={true}
            item={Row}
            height={process.env.TARO_ENV === 'alipay' ? 800 : '40vh'}   //支付宝需要设置为数字  微信支持’90vh‘
            enhanced={process.env.TARO_ENV === 'alipay' ? false : true}     //支付宝需要关闭
            itemData={productMenuList.reduce((a, b) => a.concat(b.productList), [])}
            itemCount={productMenuList.reduce((a, b) => a + b.productList.length, 0)}
            itemSize={(index, itemData) => {
              if (itemData && itemData[index].id.split('-')[1] === "1") {
                return 100 + 20
              }
              return 100
            }}
            onScroll={onProductViewScroll}
            renderTop={<View className={styles.render_top}>{'----' + curGroupId.groupName + '----'}</View>}
            renderBottom={<View style={{height: '100%', backgroundColor: 'red'}}>已经到底了～～</View>}
          />
        </View>
        : '暂无数据11'}
    </View>
  )
}

