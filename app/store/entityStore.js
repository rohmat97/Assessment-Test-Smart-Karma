import { makeAutoObservable, action, observable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import AsyncStorage from '@react-native-async-storage/async-storage';
class EntityStore {
    symbols= ["APPL","INFY", "TRP", "QQQ", "IXIC", "EUR/USD", "USD/JPY", "BTC/USD", "ETH/BTC"]
    constructor() {
        makeAutoObservable(
            this,
            {
                AddEntity: action,
                RemoveEntity: action,
                symbols: observable
            },
            { autoBind: true }
        )
        makePersistable(
            this,
            {
                name:"EntityPersistStore",
                properties: ['symbols'],
                storage: AsyncStorage
            }
        )
    }
    AddEntity(params){
        this.symbols = [...this.symbols, params]
    }
    RemoveEntity(params){
        this.symbols = this.symbols.filter(data => data !== params)
    }
}

export default entityStore = new EntityStore()