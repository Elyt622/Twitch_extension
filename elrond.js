const { ProxyProvider } = require('elrondjs')
const fetch = require("node-fetch");
const Queue = require ('./Queue.js')

const provider = new ProxyProvider('https://api.elrond.com/')

class Streamer {
    constructor(currentAddress, herotag, balance) {
        this.currentAddress = currentAddress
        this.herotag = herotag
        this.balance = balance
    }
};

class LastTransaction {
    constructor(valueLastTx, dataTx, statusLastTx, lastSender, herotagLastSender, txHash){
        this.valueLastTx = valueLastTx
        this.statusLastTx = statusLastTx
        this.lastSender = lastSender
        this.dataTx = dataTx
        this.herotagLastSender = herotagLastSender
        this.txHash = txHash
    }
};                

// Put your elrond public address
let currentAddress = "erd1f72agueyk6n2377dwun6argmxt7s6vse96g94m62j23c7m84vygsy0je7u";  
let currentStreamer = new Streamer(currentAddress, null, null, null);
let newArrayTransaction = new Array(10);
let oldArrayTransaction = new Array();
let lastTransaction = new Queue(10);

function decodeBase64(strToDecode){
    let dataReceive;
    // Decode Data from Base64 to UTF-8
    if(strToDecode != null){
        let buff = Buffer.from(strToDecode, 'Base64');
        dataReceive = buff.toString('utf-8');
    }
    else{
        dataReceive = ''
    }
    return dataReceive;
}

function convertToRealBalance(balanceConvertToReal){
    return balanceConvertToReal/1000000000000000000;
}

function shortHerotag(strHerotag){
    if(strHerotag != null)
        return strHerotag.substr(0, strHerotag.indexOf('.')); 
    else 
        return '';
}

async function printInfoSender(sender){
        console.log(sender.herotagLastSender+'\n');
        console.log(sender.valueLastTx+'\n');
        console.log(sender.dataTx+'\n');
        console.log(sender.txHash+'\n');
        lastTransaction.dequeue();
}

async function getUserByAddress(){
    try {
        let addressStreamer = await provider.getAddress(currentAddress)
        currentStreamer.balance = convertToRealBalance(addressStreamer.balance);
        currentStreamer.herotag = shortHerotag(addressStreamer.username);

    } catch (error) {
        console.log(error);
    }
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

async function fetchLastTxReceive(){
    try {
        await getUserByAddress(currentStreamer);
        const resultsLastTx = await fetch('https://api.elrond.com/transactions?receiver=' + currentAddress + '&from=0&size=10');
        const dataLastTxReceive = await resultsLastTx.json();

        for(let i = 0; i < 10; i++){
            newArrayTransaction[i] = dataLastTxReceive[i]['txHash'];
        }

        if (oldArrayTransaction.length == 0){
            oldArrayTransaction = newArrayTransaction.slice();
            console.log(oldArrayTransaction);
        }

        if(!arraysEqual(oldArrayTransaction, newArrayTransaction)){
            let pos = newArrayTransaction.indexOf(oldArrayTransaction[0]);
            console.log("Position: " + pos);
            for(let i = pos; i > 0; i--){
                let lastTransactionViewerAddress = dataLastTxReceive[i]['sender'];
                let address = await provider.getAddress(lastTransactionViewerAddress);
                lastTransaction.enqueue(new LastTransaction(convertToRealBalance(dataLastTxReceive[i]['value']),
                decodeBase64(dataLastTxReceive[i]['data']), dataLastTxReceive[i]['status'], dataLastTxReceive[i]['sender'],
                shortHerotag(address.username), dataLastTxReceive[i]['txHash']));
            }
            oldArrayTransaction = newArrayTransaction.slice();
        }

        console.log("Taille: " + lastTransaction.getLength());
        if(!lastTransaction.isEmpty()){
            printInfoSender(lastTransaction.peek());
        }
    } catch (error) {
        console.log(error);
    }
}

setInterval(fetchLastTxReceive, 2000);
