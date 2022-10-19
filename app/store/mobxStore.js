import { makeAutoObservable, action, observable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import AsyncStorage from '@react-native-async-storage/async-storage';
class PriceStore {
    data = []
    constructor() {
        makeAutoObservable(
            this,
            {
                AddData: action,
                DeleteData: action,
                data: observable
            },
            { autoBind: true }
        )
        // makePersistable(
        //     this,
        //     {
        //         name:"counterPersistStore",
        //         properties: ['data'],
        //         storage: AsyncStorage
        //     }
        // )
    }
    ClearData() {
        this.data =  []
    }
    AddData(payload) {
        let filter = this.data.filter((obj => obj.symbol !== payload.symbol));
        let merger = [...filter,payload]
        this.data =  [...new Set(merger)]
        
    }
    DeleteData(payload) {
        console.log('payload DeleteData', payload)
    }
}

export default priceStore = new PriceStore()