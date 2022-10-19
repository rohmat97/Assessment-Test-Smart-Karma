import { ActivityIndicator, Dimensions, FlatList, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import priceStore from "./store/mobxStore";
import { observer } from 'mobx-react';
import { Wait } from './function/Wait';
// import { WebSocket } from './function/WebSocket';
import { VictoryAxis, VictoryCandlestick, VictoryChart, VictoryLabel, VictoryTheme } from 'victory-native';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { socketUrl } from './function/WebSocket';
import { Button, Chip, FAB, Modal, TextInput } from 'react-native-paper';
import entityStore from './store/entityStore';

const { width } = Dimensions.get('screen')
const App = () => {
  const [refreshing, setRefreshing] = useState(false);
  // const [symbols, setsymbols] = useState(["APPL","INFY", "TRP", "QQQ", "IXIC", "EUR/USD", "USD/JPY", "BTC/USD", "ETH/BTC"])
  const [open, setopen] = useState(false)
  const [visible, setVisible] = React.useState(false);
  const [addEntity, setAddEntity] = useState()
  const [titleModal, setTitleModal] = useState('')
  const hideModal = () => setVisible(false);
  const { data } = priceStore
  const { symbols } = entityStore
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const subscribe = {
    "action": "subscribe",
    "params": {
      "symbols": symbols.join()
    }
  }
  const unsubscribe = {
    "action": "unsubscribe",
    "params": {
      "symbols": symbols.join()
    }
  }
  function ClearData(params) {
    priceStore.ClearData(params)
    sendMessage(JSON.stringify(unsubscribe))
    setTimeout(() => {
      handleClickSendMessage()
      setRefreshing(false);
    }, 500);
  }
  function AddData(params) {
    priceStore.AddData(params)
  }
  async function AddEntity(params) {
    // console.log('ADD ENTIRY', [...symbols, params])
    setVisible(false)
    // setsymbols([...symbols, params])
    entityStore.AddEntity(params)
    onRefresh()
    setAddEntity()
  }
  async function RemoveEntity(params) {
    
    // console.log('RemoveEntity', symbols.filter(data => data !== params))
    setVisible(false)
    entityStore.RemoveEntity(params)
    // setsymbols(symbols.filter(data => data !== params))
    setAddEntity()
    onRefresh()
  }
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    ClearData()
  }, []);

  useEffect(() => {
    onRefresh()

  }, [])

  useEffect(() => {
    if (data) {
      // console.log('data', data)
    }
  }, [data])



  useEffect(() => {
    // messageHistory.current.concat(lastMessage)
    // console.log('lastMessage', lastMessage && lastMessage.data && JSON.parse(lastMessage?.data).event)
    if (lastMessage && lastMessage.data && JSON.parse(lastMessage?.data).event === 'price') {
      AddData(JSON.parse(lastMessage?.data))
    }

  }, [lastMessage])

  const handleClickSendMessage = () => sendMessage(JSON.stringify(subscribe));

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <Text>Entity</Text>
        <FlatList 
          numColumns={5}
          data={symbols}
          renderItem={({item})=> <Chip>{item}</Chip>}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 12 }}>
          <Text style={styles.headerText}>Entity</Text>
          <Text style={styles.headerText}>Last Price</Text>
          <Text style={styles.headerText}>Last Update</Text>
        </View>

        <FlatList
          data={data}

          renderItem={({ item, index }) => {
            // console.log('item', item?.meta)
            // let date = item.timestamp ? new Date():''
            var t = new Date(item.timestamp * 1000);
            var hours = t.getHours();
            var minutes = t.getMinutes();
            var newformat = t.getHours() >= 12 ? 'PM' : 'AM';

            // Find current hour in AM-PM Format 
            hours = hours % 12;

            // To display "0" as "12" 
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var formatted =
              (t.toString().split(' ')[0])
              + ', ' + ('0' + t.getDate()).slice(-2)
              + '/' + ('0' + (t.getMonth() + 1)).slice(-2)
              + '/' + (t.getFullYear())
              + ' - ' + ('0' + t.getHours()).slice(-2)
              + ':' + ('0' + t.getMinutes()).slice(-2)
              + ' ' + newformat;
            return (

              <TouchableOpacity>
                <>
                  <View style={styles.containerItem}>
                    <Text style={{ width: width * 0.33, textAlign: 'center', fontWeight: "bold" }}>{item?.symbol}</Text>
                    <Text style={{ width: width * 0.33, textAlign: 'center' }}>{item?.price}</Text>
                    <Text style={{ width: width * 0.33, textAlign: 'center' }}>{formatted}</Text>
                  </View>
                </>
              </TouchableOpacity>

            )
          }}
          ListEmptyComponent={
            <View style={{
              justifyContent: 'center'
            }}>
              <Text>No Data</Text>
            </View>
          }
        />

      </ScrollView>
      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.containerModal}>
        <Text>{titleModal}</Text>
        <TextInput
          label="Entity"
          value={addEntity}
          onChangeText={text => setAddEntity(text)}
        />
        <Button mode="contained" onPress={() => {
          if(titleModal === 'Remove Entity'){
            RemoveEntity(addEntity)
          }else{
            AddEntity(addEntity)
          }
          }} style={{ marginTop: 24 }}>
          Confirm Add
        </Button>
      </Modal>
      <FAB.Group
        open={open}
        icon={open ? 'close' : 'plus'}
        actions={[
          {
            icon: 'minus',
            label: 'Remove Entity',
            onPress: () => { 
              setTitleModal("Remove Entity")
              setVisible(true)
              
            },
            small: false,
          },
          {
            icon: 'plus',
            label: 'Add Entity',
            onPress: () =>{ 
              setTitleModal("Add Entity")
              setVisible(true)
              
            },
            small: false,
          },
        ]}
        onStateChange={() => setopen(!open)}
        onPress={() => {
          if (open) {
            // do something if the speed dial is open
          }
        }}
      />
    </SafeAreaView>
  )
}

export default observer(App)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerItem: {
    flex: 1,
    justifyContent: "space-around",
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1
  },
  containerTitle: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: "center"
  },
  headerText: { width: width * 0.33, textAlign: 'center', fontWeight: 'bold', color: 'black' },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  containerModal: { backgroundColor: 'white', padding: 20 }
})